import Link from "next/link";
import { headers } from "next/headers";
import { GithubLogo } from "@phosphor-icons/react/ssr";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { document } from "@/lib/db/schema";
import { isThemeName, type ThemeName } from "@/lib/themes";
import { ThemeSync } from "@/components/theme-sync";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  let theme: ThemeName | null = null;
  if (session) {
    const [doc] = await db
      .select({ theme: document.theme })
      .from(document)
      .where(eq(document.userId, session.user.id));
    if (doc && isThemeName(doc.theme)) theme = doc.theme;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "cahier",
    url: "https://cahier.fyi",
    description: "Your CV as a clean link. One markdown file, published at cahier.fyi/you.",
  };

  return (
    <div data-theme={theme ?? undefined} className="min-h-dvh bg-bg text-fg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ThemeSync theme={theme} />
      <main className="ruling relative min-h-dvh">
        <div
          aria-hidden
          className="absolute inset-y-0 w-px bg-fg-20"
          style={{ left: "var(--margin-x)" }}
        />
        <div
          className="landing-top relative pr-6 pb-16"
          style={{
            paddingLeft: "calc(var(--margin-x) + clamp(1.25rem, 4vw, 3rem))",
          }}
        >
          <h1 className="settle heading hero">cahier</h1>
          <p className="settle base on-line-mid" style={{ animationDelay: "0.08s" }}>
            your cv as a clean link.
          </p>
          <p className="settle minor on-line-mid text-fg-55" style={{ animationDelay: "0.14s" }}>
            one markdown file, published at <span className="text-fg">cahier.fyi/you</span>
          </p>
          <p className="settle on-line-mid mt-8" style={{ animationDelay: "0.2s" }}>
            <Link href={session ? "/edit" : "/start"} className="btn base">
              start -&gt;
            </Link>
          </p>
        </div>

        <footer
          className="landing-foot settle minor flex flex-col items-end pr-6 pl-5 text-fg-55"
          style={{ animationDelay: "0.26s" }}
        >
          <a
            href="https://github.com/gri-sha/cahier"
            target="_blank"
            rel="noreferrer"
            aria-label="source on github"
            className="btn minor flex h-line items-center gap-1-5"
          >
            <GithubLogo size="1.25em" weight="fill" />
            github.com/gri-sha/cahier
          </a>
          <a href="mailto:hello@cahier.fyi" className="btn minor flex h-line items-center">
            hello@cahier.fyi
          </a>
          <div className="flex h-line flex-wrap items-center justify-end gap-x-5">
            <Link href="/privacy" className="btn minor">
              privacy
            </Link>
            <Link href="/terms" className="btn minor">
              terms
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
