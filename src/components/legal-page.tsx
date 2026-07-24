import Link from "next/link";
import { ThemeSync } from "@/components/theme-sync";
import type { ThemeName } from "@/lib/themes";

// Shared shell for /terms and /privacy: the margin rule, a heading, and
// dated body copy. Sections are minor mono labels over base paragraphs —
// website text styles only, no doc typography. Painted in the signed-in
// user's theme (passed as `theme`), or the default paper theme when it's null.

export function LegalPage({
  title,
  updated,
  theme,
  children,
}: {
  title: string;
  updated: string;
  theme: ThemeName | null;
  children: React.ReactNode;
}) {
  return (
    <div data-theme={theme ?? undefined} className="min-h-dvh bg-bg text-fg">
      <ThemeSync theme={theme} />
      <main className="relative min-h-dvh">
        <div
          aria-hidden
          className="absolute inset-y-0 w-px bg-fg-20"
          style={{ left: "var(--margin-x)" }}
        />
        <div
          className="relative max-w-xl pt-16 pr-6 pb-24"
          style={{
            paddingLeft: "calc(var(--margin-x) + clamp(1.25rem, 4vw, 3rem))",
          }}
        >
          <p>
            <Link href="/" className="btn minor text-fg-55">
              &lt;- cahier
            </Link>
          </p>
          <h1 className="heading mt-8">{title}</h1>
          <p className="minor mt-1 text-fg-55">last updated: {updated}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

export function LegalSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="minor text-fg-55">{label}</h2>
      <div className="base mt-2 space-y-3">{children}</div>
    </section>
  );
}
