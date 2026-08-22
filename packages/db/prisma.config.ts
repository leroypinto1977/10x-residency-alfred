// Paths are resolved against this file rather than the working directory:
// every script that uses it runs from the repo root (`prisma generate
// --config packages/db/prisma.config.ts`), so a bare "prisma/schema.prisma"
// would look for the schema at the root and not find it.
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: path.join(here, "prisma/schema.prisma"),
  migrations: {
    path: path.join(here, "prisma/migrations"),
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
