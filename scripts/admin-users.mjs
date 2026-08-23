#!/usr/bin/env node
/**
 * Account management for the admin panel.
 *
 *   npm run admin:users -- list
 *   npm run admin:users -- add <username> "<Full Name>" [owner|member|viewer]
 *   npm run admin:users -- passwd <username> [password]
 *   npm run admin:users -- role <username> <owner|member|viewer>
 *   npm run admin:users -- disable <username>
 *   npm run admin:users -- enable <username>
 *   npm run admin:users -- delete <username>
 *
 * Deliberately a CLI and not a page in the panel: creating a login should
 * require access to this repo and its DATABASE_URL, not merely a session that
 * someone else left open. Passwords are generated here and printed once — they
 * are stored only as a pbkdf2 hash, so a lost one is reset, never recovered.
 * `passwd` will take one you have chosen instead, which is the weaker option
 * and therefore not the default: a password passed as an argument survives in
 * shell history and in whatever carried it to you.
 *
 * Uses `pg` directly rather than the Prisma client, because the client is
 * generated TypeScript that plain node cannot import.
 */
import pg from "pg";

const ITERATIONS = 210_000;
const ROLES = ["owner", "member", "viewer"];

function b64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256,
  );
  return new Uint8Array(bits);
}

/** Same format lib/password.ts reads: pbkdf2$<iterations>$<salt>$<hash> */
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

/** Ambiguous characters left out — these get read off a screen and retyped. */
function generatePassword(length = 16) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

const [cmd, ...args] = process.argv.slice(2);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run this from the repo root.");
  process.exit(1);
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const findId = async (username) => {
  const { rows } = await db.query(
    `select id, name from "AdminUser" where lower(username) = lower($1)`,
    [username],
  );
  if (!rows.length) {
    console.error(`No account called "${username}".`);
    await db.end();
    process.exit(1);
  }
  return rows[0];
};

try {
  switch (cmd) {
    case "list": {
      const { rows } = await db.query(
        `select username, name, role, active, "lastLoginAt"
         from "AdminUser" order by active desc, lower(name)`,
      );
      if (!rows.length) {
        console.log("No accounts yet. Create one with:\n  npm run admin:users -- add <username> \"<Name>\" owner");
        break;
      }
      for (const r of rows) {
        const last = r.lastLoginAt ? new Date(r.lastLoginAt).toISOString().slice(0, 16).replace("T", " ") : "never";
        console.log(
          `${r.active ? " " : "✗"} ${r.username.padEnd(16)} ${r.role.padEnd(7)} ${r.name.padEnd(24)} last login: ${last}`,
        );
      }
      break;
    }

    case "add": {
      const [username, name, role = "member"] = args;
      if (!username || !name) throw new Error('Usage: add <username> "<Full Name>" [role]');
      if (!ROLES.includes(role)) throw new Error(`Role must be one of: ${ROLES.join(", ")}`);
      const dup = await db.query(`select 1 from "AdminUser" where lower(username) = lower($1)`, [username]);
      if (dup.rowCount) throw new Error(`"${username}" already exists.`);
      const password = generatePassword();
      await db.query(
        `insert into "AdminUser" (username, name, "passwordHash", role) values ($1, $2, $3, $4)`,
        [username, name, await hashPassword(password), role],
      );
      console.log(`Created ${role} "${name}" (${username}).`);
      console.log(`Password: ${password}`);
      console.log("Shown once — it is stored only as a hash.");
      break;
    }

    case "passwd": {
      // A password may be given, or left out to have one generated. Given is
      // the weaker of the two — it ends up in shell history and in whatever
      // was used to pass it along — so the generated one stays the default
      // and choosing your own has to be deliberate.
      const [username, chosen] = args;
      const user = await findId(username);
      if (chosen !== undefined && chosen.length < 8) {
        throw new Error("A chosen password needs at least 8 characters.");
      }
      const password = chosen ?? generatePassword();
      await db.query(`update "AdminUser" set "passwordHash" = $1 where id = $2`, [
        await hashPassword(password),
        user.id,
      ]);
      if (chosen) {
        console.log(`Password updated for ${user.name}.`);
        console.log("Set from the command line, so clear it from your shell history.");
      } else {
        console.log(`New password for ${user.name}: ${password}`);
        console.log("Shown once — it is stored only as a hash.");
      }
      break;
    }

    case "role": {
      const [username, role] = args;
      if (!ROLES.includes(role)) throw new Error(`Role must be one of: ${ROLES.join(", ")}`);
      const user = await findId(username);
      await db.query(`update "AdminUser" set role = $1 where id = $2`, [role, user.id]);
      console.log(`${user.name} is now ${role}.`);
      break;
    }

    case "disable":
    case "enable": {
      const [username] = args;
      const user = await findId(username);
      const active = cmd === "enable";
      await db.query(`update "AdminUser" set active = $1 where id = $2`, [active, user.id]);
      console.log(`${user.name} ${active ? "enabled" : "disabled"}.`);
      break;
    }

    case "delete": {
      const [username] = args;
      const user = await findId(username);
      // Notes and history survive: their author columns are ON DELETE SET NULL,
      // and the panel shows those as "Removed account". Losing the record of
      // what happened along with the login would be the wrong trade.
      await db.query(`delete from "AdminUser" where id = $1`, [user.id]);
      console.log(`Deleted ${user.name}. Their notes and history are kept.`);
      break;
    }

    default:
      console.log(
        [
          "Usage:",
          "  npm run admin:users -- list",
          '  npm run admin:users -- add <username> "<Full Name>" [owner|member|viewer]',
          "  npm run admin:users -- passwd <username> [password]   (omit to generate one)",
          "  npm run admin:users -- role <username> <owner|member|viewer>",
          "  npm run admin:users -- disable|enable <username>",
          "  npm run admin:users -- delete <username>",
        ].join("\n"),
      );
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
