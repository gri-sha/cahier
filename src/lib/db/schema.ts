import { bigint, boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// better-auth core tables (user, session, account, verification) and its
// rate_limit store, plus the one-per-account document. Postgres everywhere:
// docker compose locally, Neon on Vercel — see src/lib/db/index.ts.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  username: text("username").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// better-auth's shared rate-limit store, enabled via rateLimit.storage in
// src/lib/auth.ts. Column/field names must match better-auth's rateLimit
// model (id, key, count, lastRequest); lastRequest is an epoch-ms number.
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: bigint("last_request", { mode: "number" }),
});

// One markdown document per account, keyed by the owner. `content`/`theme`
// are the draft; the published* columns are the snapshot served at
// /username. publishedContent IS NOT NULL <=> the page is live.
export const document = pgTable("document", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull().default(""),
  theme: text("theme").notNull().default("paper"),
  publishedContent: text("published_content"),
  publishedTheme: text("published_theme"),
  publishedAt: timestamp("published_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
