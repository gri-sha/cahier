import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import { themeCss } from "@/lib/themes";
import { GridOverlay } from "@/components/grid-overlay";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cahier.fyi"),
  title: {
    default: "cahier: your cv as a clean link",
    template: "cahier: %s",
  },
  description: "Your CV as a clean link. One markdown file, published at cahier.fyi/you.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "cahier",
    type: "website",
    url: "/",
    title: "cahier: your cv as a clean link",
    description: "Your CV as a clean link. One markdown file, published at cahier.fyi/you.",
  },
  // title/description fall back to the openGraph values above; only the card
  // type needs stating so links render as a large image rather than a summary.
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body>
        {children}
        {/* layout inspector — dev only, never attached for real visitors */}
        {process.env.NODE_ENV === "development" && <GridOverlay />}
      </body>
    </html>
  );
}
