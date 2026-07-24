import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { document, user } from "@/lib/db/schema";
import { defaultTheme, isThemeName } from "@/lib/themes";
import { Editor } from "./editor";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "edit",
  robots: { index: false, follow: false },
};

export default async function EditPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/start");

  const [owner] = await db.select().from(user).where(eq(user.id, session.user.id));
  if (!owner?.username) redirect("/start");

  let [doc] = await db.select().from(document).where(eq(document.userId, owner.id));
  if (!doc) {
    await db.insert(document).values({ userId: owner.id }).onConflictDoNothing();
    [doc] = await db.select().from(document).where(eq(document.userId, owner.id));
  }

  return (
    <Editor
      username={owner.username}
      email={owner.email}
      initialContent={doc.content}
      initialTheme={isThemeName(doc.theme) ? doc.theme : defaultTheme}
      initialPublished={{
        content: doc.publishedContent,
        theme: doc.publishedTheme,
      }}
    />
  );
}
