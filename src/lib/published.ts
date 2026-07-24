// Shared lookup for a user's published page, used by the page itself,
// generateMetadata and the opengraph-image route. React cache() dedupes the
// query between the page render and its metadata; the OG image is a separate
// request and pays its own query.

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { document, user } from "@/lib/db/schema";
import { USERNAME_PATTERN } from "@/lib/usernames";

export const getPublishedPage = cache(async (username: string) => {
  if (!USERNAME_PATTERN.test(username)) return null;
  const [row] = await db
    .select({
      content: document.publishedContent,
      theme: document.publishedTheme,
    })
    .from(user)
    .innerJoin(document, eq(document.userId, user.id))
    .where(eq(user.username, username));
  if (!row?.content) return null;
  return row;
});

export function docTitle(content: string): string | null {
  return content.match(/^#\s+(.+?)\s*$/m)?.[1] ?? null;
}

// First body paragraph of the markdown, stripped down to plain text and
// clipped to meta-description length.
export function docDescription(content: string): string | null {
  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() && !/^(#{1,6}\s|[-*_]{3,}\s*$|>|\|)/.test(line.trim()))
    .slice(0, 2)
    .join(" ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}
