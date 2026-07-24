import { defineConfig } from "drizzle-kit";

// No DATABASE_URL -> the local docker compose Postgres.
// With DATABASE_URL (Neon in production) -> that connection instead.

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://cahier:cahier@localhost:5432/cahier",
  },
});
