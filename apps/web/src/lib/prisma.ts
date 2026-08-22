/**
 * Kept as a re-export so the service layer's `@/lib/prisma` imports do not all
 * have to change. The client itself now lives in packages/db, because the
 * admin app reads the same tables and two clients would mean two definitions
 * of the same rows.
 */
export { prisma, isConfigured } from "@founder10x/db";
