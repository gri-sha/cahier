import Link from "next/link";
import { ThemeSync } from "@/components/theme-sync";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <ThemeSync theme={null} />
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
          <h1 className="settle heading hero">404</h1>
          <p className="settle base on-line-mid" style={{ animationDelay: "0.08s" }}>
            no page at this address.
          </p>
          <p className="settle base on-line-mid text-fg-55" style={{ animationDelay: "0.14s" }}>
            maybe it was never published.
          </p>
          <p className="settle on-line-mid mt-8" style={{ animationDelay: "0.2s" }}>
            <Link href="/" className="btn base">
              &lt;- cahier
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
