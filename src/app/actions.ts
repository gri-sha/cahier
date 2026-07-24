"use server";

import { createHash, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { document, user, verification } from "@/lib/db/schema";
import { sendCodeEmail } from "@/lib/email";
import { defaultTheme, isThemeName, type ThemeName } from "@/lib/themes";
import { normalizeUsername, usernameError } from "@/lib/usernames";

const MAX_CONTENT = 120_000;

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function saveDraft(content: string): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };
  if (typeof content !== "string" || content.length > MAX_CONTENT) {
    return { ok: false, error: "document is over the 120k character limit" };
  }
  await db
    .insert(document)
    .values({ userId, content, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: document.userId,
      set: { content, updatedAt: new Date() },
    });
  return { ok: true };
}

export async function setTheme(theme: string): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };
  if (!isThemeName(theme)) return { ok: false, error: "unknown theme" };
  await db
    .insert(document)
    .values({ userId, theme, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: document.userId,
      set: { theme, updatedAt: new Date() },
    });
  return { ok: true };
}

export async function publish(): Promise<
  Result<{ publishedContent: string; publishedTheme: ThemeName }>
> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };

  const [owner] = await db.select().from(user).where(eq(user.id, userId));
  if (!owner?.username) return { ok: false, error: "pick a username first" };

  const [doc] = await db.select().from(document).where(eq(document.userId, userId));
  if (!doc || doc.content.trim() === "") {
    return { ok: false, error: "nothing to publish yet" };
  }

  await db
    .update(document)
    .set({
      publishedContent: doc.content,
      publishedTheme: doc.theme,
      publishedAt: new Date(),
    })
    .where(eq(document.userId, userId));

  revalidatePath(`/${owner.username}`);
  return {
    ok: true,
    publishedContent: doc.content,
    publishedTheme: doc.theme as ThemeName,
  };
}

export async function unpublish(): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };

  const [owner] = await db.select().from(user).where(eq(user.id, userId));
  await db
    .update(document)
    .set({ publishedContent: null, publishedTheme: null, publishedAt: null })
    .where(eq(document.userId, userId));

  if (owner?.username) revalidatePath(`/${owner.username}`);
  return { ok: true };
}

export async function claimUsername(raw: string): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };

  const name = normalizeUsername(raw);
  const invalid = usernameError(name);
  if (invalid) return { ok: false, error: invalid };

  const [owner] = await db.select().from(user).where(eq(user.id, userId));
  if (!owner) return { ok: false, error: "signed out — reload the page" };
  if (owner.username) return { ok: false, error: "username already set" };

  try {
    await db.update(user).set({ username: name, updatedAt: new Date() }).where(eq(user.id, userId));
  } catch {
    // unique constraint: someone got there first
    return { ok: false, error: "taken — try another" };
  }

  // create the (empty) document row up front, on the default theme
  await db.insert(document).values({ userId, theme: defaultTheme }).onConflictDoNothing();

  return { ok: true };
}

export async function updateUsername(raw: string): Promise<Result<{ username: string }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };

  const name = normalizeUsername(raw);
  const invalid = usernameError(name);
  if (invalid) return { ok: false, error: invalid };

  const [owner] = await db.select().from(user).where(eq(user.id, userId));
  if (!owner) return { ok: false, error: "signed out — reload the page" };
  if (owner.username === name) return { ok: true, username: name };

  try {
    await db.update(user).set({ username: name, updatedAt: new Date() }).where(eq(user.id, userId));
  } catch {
    return { ok: false, error: "taken — try another" };
  }

  // the public URL moved: refresh the old address and the new one
  const [doc] = await db
    .select({ publishedContent: document.publishedContent })
    .from(document)
    .where(eq(document.userId, userId));
  if (doc?.publishedContent) {
    if (owner.username) revalidatePath(`/${owner.username}`);
    revalidatePath(`/${name}`);
  }

  return { ok: true, username: name };
}

const EMAIL_CHANGE_ID = (userId: string) => `email-change:${userId}`;

type EmailChallenge = { email: string; code: string; attempts: number };

// Total code submissions allowed per challenge, right or wrong.
const MAX_CODE_ATTEMPTS = 5;

// Minimum gap between sending email-change codes for one account. Server
// actions don't pass through better-auth's rate limiter (that only guards
// /api/auth/*), so without this a signed-in user could loop this action to
// email-bomb any address from our verified domain and burn Resend quota.
const EMAIL_CHANGE_COOLDOWN_MS = 45_000;

function codesMatch(expected: string, given: string): boolean {
  // Hashing first gives equal-length buffers, so the comparison leaks nothing
  // about where the guess diverges.
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(given).digest();
  return timingSafeEqual(a, b);
}

export async function requestEmailChange(rawEmail: string): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };

  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "that doesn't look like an email" };
  }

  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  if (existing?.id === userId) {
    return { ok: false, error: "that's already your email" };
  }
  if (existing) {
    return { ok: false, error: "that email already has an account" };
  }

  // Throttle: reject if this account was sent a code within the cooldown. A
  // pending challenge row exists at most once per user (we delete-then-insert
  // below), so its createdAt is the last-sent time.
  const [prior] = await db
    .select({ createdAt: verification.createdAt })
    .from(verification)
    .where(eq(verification.identifier, EMAIL_CHANGE_ID(userId)));
  if (prior && Date.now() - prior.createdAt.getTime() < EMAIL_CHANGE_COOLDOWN_MS) {
    return { ok: false, error: "hold on — a code was just sent" };
  }

  const challenge: EmailChallenge = {
    email,
    code: String(randomInt(100000, 1000000)),
    attempts: 0,
  };
  const id = randomUUID();
  await db.delete(verification).where(eq(verification.identifier, EMAIL_CHANGE_ID(userId)));
  await db.insert(verification).values({
    id,
    identifier: EMAIL_CHANGE_ID(userId),
    value: JSON.stringify(challenge),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  try {
    await sendCodeEmail(email, challenge.code);
  } catch {
    // roll back so the cooldown doesn't trap the user on a failed send
    await db.delete(verification).where(eq(verification.id, id));
    return { ok: false, error: "couldn't send the code — try again" };
  }
  return { ok: true };
}

export async function confirmEmailChange(rawCode: string): Promise<Result<{ email: string }>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };

  const [row] = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, EMAIL_CHANGE_ID(userId)));
  if (!row) return { ok: false, error: "no pending change — start again" };

  const drop = () => db.delete(verification).where(eq(verification.id, row.id));

  if (row.expiresAt < new Date()) {
    await drop();
    return { ok: false, error: "code expired — start again" };
  }

  // Consume an attempt atomically before checking the code: concurrent
  // submissions serialize on the row lock and re-check the guard, so the
  // cap can't be raced past with parallel requests the way a read-modify-
  // write of the JSON blob could.
  const [updated] = await db
    .update(verification)
    .set({
      value: sql`(${verification.value}::jsonb || jsonb_build_object('attempts', (${verification.value}::jsonb->>'attempts')::int + 1))::text`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(verification.id, row.id),
        sql`(${verification.value}::jsonb->>'attempts')::int < ${MAX_CODE_ATTEMPTS}`,
      ),
    )
    .returning({ value: verification.value });
  if (!updated) {
    await drop();
    return { ok: false, error: "too many tries — start again" };
  }

  // `updated.value` holds the post-increment count (the UPDATE above already
  // bumped it), so on the 5th wrong guess attempts === MAX and we retire the
  // challenge; earlier wrong guesses just report the mismatch.
  const challenge = JSON.parse(updated.value) as EmailChallenge;
  if (!codesMatch(challenge.code, rawCode.trim())) {
    if (challenge.attempts >= MAX_CODE_ATTEMPTS) {
      await drop();
      return { ok: false, error: "too many tries — start again" };
    }
    return { ok: false, error: "that code didn't match" };
  }

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, challenge.email));
  if (existing && existing.id !== userId) {
    await drop();
    return { ok: false, error: "that email already has an account" };
  }

  await db
    .update(user)
    .set({ email: challenge.email, emailVerified: true, updatedAt: new Date() })
    .where(eq(user.id, userId));
  await drop();
  return { ok: true, email: challenge.email };
}

export async function deleteAccount(): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "signed out — reload the page" };

  const [owner] = await db.select().from(user).where(eq(user.id, userId));
  if (!owner) return { ok: false, error: "signed out — reload the page" };

  const [doc] = await db
    .select({ publishedContent: document.publishedContent })
    .from(document)
    .where(eq(document.userId, userId));

  // any pending email-change challenge isn't FK'd to the user — drop it
  await db.delete(verification).where(eq(verification.identifier, EMAIL_CHANGE_ID(userId)));
  // sessions, provider accounts and the document cascade with the user row
  await db.delete(user).where(eq(user.id, userId));

  // the page was live: refresh its path so the cached version disappears
  if (owner.username && doc?.publishedContent) revalidatePath(`/${owner.username}`);
  return { ok: true };
}

// After OTP sign-in the client needs to know where to go next.
export async function postSignInStep(): Promise<"edit" | "username"> {
  const userId = await requireUserId();
  if (!userId) return "username";
  const [owner] = await db.select().from(user).where(eq(user.id, userId));
  return owner?.username ? "edit" : "username";
}
