import { listUsers } from "@founder10x/db";
import { requireOwner } from "@/lib/session";

export const dynamic = "force-dynamic";

function when(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

/**
 * Read-only on purpose.
 *
 * Accounts are created and changed from the CLI (`npm run admin:users`),
 * which means adding a colleague requires shell access to this repo rather
 * than a session in the panel. A stolen owner session can then read the board
 * but cannot mint itself a second way back in. This page exists so you can see
 * who has access and when they last used it.
 */
export default async function TeamPage() {
  await requireOwner();
  const users = await listUsers();

  return (
    <main className="mx-auto max-w-[900px] px-5 py-6">
      <header className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Team</h1>
        <a href="/" className="tap text-xs underline underline-offset-2" style={{ color: "var(--muted)" }}>
          Back to leads
        </a>
      </header>

      <div className="rounded-lg border overflow-x-auto" style={{ background: "var(--surface)" }}>
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="text-xs" style={{ color: "var(--muted)" }}>
              {["Name", "Username", "Role", "Active", "Last login", "Added"].map((h) => (
                <th key={h} className="font-medium px-3 py-2 border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2 text-xs" style={{ color: "var(--muted)" }}>
                  {u.username}
                </td>
                <td className="px-3 py-2 text-xs">{u.role}</td>
                <td className="px-3 py-2 text-xs" style={{ color: u.active ? "var(--won)" : "var(--faint)" }}>
                  {u.active ? "yes" : "no"}
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: "var(--muted)" }}>
                  {when(u.lastLoginAt)}
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: "var(--faint)" }}>
                  {when(u.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
        Accounts are managed from the repo with <code>npm run admin:users</code> — add, passwd,
        role, deactivate, delete. Deliberately not from this page: a stolen session should not be
        able to create a second way in.
      </p>
    </main>
  );
}
