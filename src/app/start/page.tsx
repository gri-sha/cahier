import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { ThemeSync } from "@/components/theme-sync";
import { StartFlow } from "./start-flow";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "start",
  robots: { index: false, follow: false },
};

export default async function StartPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  let initialStep: "email" | "username" = "email";
  if (session) {
    const [row] = await db
      .select({ username: user.username })
      .from(user)
      .where(eq(user.id, session.user.id));
    if (row?.username) redirect("/edit");
    // signed in, no username yet: resume where they left off
    initialStep = "username";
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <ThemeSync theme={null} />
      <main className="relative min-h-dvh">
        <div
          aria-hidden
          className="absolute inset-y-0 w-px bg-fg-20"
          style={{ left: "var(--margin-x)" }}
        />
        <div
          className="landing-top relative max-w-md pr-6 pb-16"
          style={{
            paddingLeft: "calc(var(--margin-x) + clamp(1.25rem, 4vw, 3rem))",
          }}
        >
          <StartFlow initialStep={initialStep} />
        </div>
      </main>
    </div>
  );
}
