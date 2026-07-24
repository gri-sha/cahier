import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { document } from "@/lib/db/schema";
import { isThemeName, type ThemeName } from "@/lib/themes";

// The theme to paint the legal pages (/terms, /privacy) in: the signed-in
// user's own theme, or null to fall through to the default (always paper —
// see themeCss in src/lib/themes.ts). Reading the session makes any page that
// calls this render dynamically.
export async function currentUserTheme(): Promise<ThemeName | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const [doc] = await db
    .select({ theme: document.theme })
    .from(document)
    .where(eq(document.userId, session.user.id));
  return doc && isThemeName(doc.theme) ? doc.theme : null;
}
