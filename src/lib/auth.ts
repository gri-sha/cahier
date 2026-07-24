import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";
import { sendCodeEmail } from "./email";

// The dev fallback must never reach production: it's committed to the repo,
// and passing it as a custom secret would bypass better-auth's own known-
// default check, silently signing session cookies with a public value.
if (!process.env.BETTER_AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET must be set in production");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "cahier-dev-only-secret",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // Persist the rate-limit counters in Postgres. The default in-memory store
  // is per-instance, so on serverless (Vercel) each concurrent lambda keeps
  // its own tally and the OTP-send cap (3/60s) is trivially exceeded across
  // cold starts. A shared DB store makes the limit real. Requires the
  // rate_limit table (see schema.ts) — apply migrations before deploying.
  rateLimit: { storage: "database" },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      async sendVerificationOTP({ email, otp }) {
        await sendCodeEmail(email, otp);
      },
    }),
  ],
});
