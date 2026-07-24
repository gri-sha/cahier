// One migration runner for every environment. It reads DATABASE_URL exactly
// like the app (src/lib/db/index.ts) and picks the matching driver, so
// `bun run db:migrate` behaves identically against the local docker Postgres
// (test) and the Neon database (production) — same command, same migrations.
//
// Source of truth: src/lib/db/schema.ts. Change the schema, run
// `bun run db:generate` to emit a new SQL file under drizzle/, commit it, then
// `bun run db:migrate` applies every pending file. Migrations are versioned and
// idempotent (drizzle records applied ones in a __drizzle_migrations table), so
// this is safe to run on every deploy.
//
// Unlike `drizzle-kit push`, the Neon branch here goes over Neon's HTTP driver,
// so it also works inside the Vercel build where a raw TCP connection does not.

const MIGRATIONS_FOLDER = "./drizzle";

// Keep this in sync with LOCAL_DATABASE_URL in ./index.ts.
const LOCAL_DATABASE_URL = "postgres://cahier:cahier@localhost:5432/cahier";

async function main() {
  // || not ??: an unfilled .env.local line yields "", which must also fall back
  const url = process.env.DATABASE_URL || LOCAL_DATABASE_URL;
  const target = url.includes("neon.tech") ? "neon" : "postgres";
  console.log(`running migrations against ${target}…`);

  if (target === "neon") {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(drizzle(neon(url)), { migrationsFolder: MIGRATIONS_FOLDER });
  } else {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const db = drizzle(url);
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    await db.$client.end();
  }

  console.log("migrations applied ✓");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("migration failed:", err);
    process.exit(1);
  });
