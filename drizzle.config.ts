import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  driver: "better-sqlite3" as any,
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/savorstack.db",
  },
  verbose: true,
  strict: true,
} satisfies Config;
