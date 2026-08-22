/**
 * The Prisma client, shared by both apps.
 *
 * The landing site writes leads here; the admin app reads and annotates them.
 * One module means the row shape is defined once and the two cannot drift.
 *
 * Built lazily rather than at module scope: DATABASE_URL is absent while Next
 * collects page data during a build, and a client constructed at import time
 * would throw there. The getter is also what keeps a single instance across
 * hot reloads in development, where each reload otherwise opens a new pool
 * until Postgres refuses connections.
 */

import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  __founder10xPrisma: PrismaClient | undefined;
};

/** True when a database is configured at all. */
export function isConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg(url) });
}

/**
 * A Proxy rather than an eager instance, so importing this module is free and
 * the client is only built on the first property access — by which time the
 * environment is loaded.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = (globalForPrisma.__founder10xPrisma ??= create());
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
