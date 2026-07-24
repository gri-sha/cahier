import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultTheme, isThemeName } from "@/lib/themes";
import { docDescription, docTitle, getPublishedPage } from "@/lib/published";
import { ThemeSync } from "@/components/theme-sync";
import { Doc } from "@/components/doc";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const page = await getPublishedPage(username);
  if (!page?.content) return {};
  const title = docTitle(page.content) ?? username;
  const description = docDescription(page.content) ?? `${username}'s cv, published on cahier.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/${username}` },
    openGraph: {
      title,
      description,
      url: `/${username}`,
      siteName: "cahier",
      type: "profile",
    },
    twitter: { card: "summary_large_image", title, description },
    // published pages are deliberately kept out of search indexes
    robots: { index: false, follow: false },
  };
}

export default async function PublishedPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const page = await getPublishedPage(username);
  if (!page?.content) notFound();

  const theme = page.theme && isThemeName(page.theme) ? page.theme : defaultTheme;

  return (
    <div data-theme={theme} className="min-h-dvh bg-bg text-fg">
      <ThemeSync theme={theme} />
      <main className="published-main">
        <Doc content={page.content} />
      </main>
    </div>
  );
}
