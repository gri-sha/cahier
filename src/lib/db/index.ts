import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Neon over HTTP when DATABASE_URL points at Neon (production on Vercel).
// Otherwise -> regular Postgres over TCP: docker compose up -d (local dev).
// Same postgres dialect and schema either way; only the driver differs.

const LOCAL_DATABASE_URL = "postgres://cahier:cahier@localhost:5432/cahier";

type Db = NodePgDatabase<typeof schema>;

const globals = globalThis as unknown as { __cahierDb?: Promise<Db> };

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url?.includes("neon.tech")) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    // Neon's query interface is API-compatible for everything we use.
    return drizzle(neon(url), { schema }) as unknown as Db;
  }
  const { drizzle } = await import("drizzle-orm/node-postgres");
  // || not ??: an unfilled .env.local line yields "", which must also fall back
  return drizzle(url || LOCAL_DATABASE_URL, { schema });
}

// Single pool across hot reloads.
export const db = await (globals.__cahierDb ??= createDb());
