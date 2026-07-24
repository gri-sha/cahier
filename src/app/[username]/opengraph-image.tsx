import { ogCard, ogSize } from "@/lib/og-card";
import { defaultTheme, isThemeName } from "@/lib/themes";
import { docTitle, getPublishedPage } from "@/lib/published";

export const alt = "cahier — your cv as a clean link";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const page = await getPublishedPage(username);
  const theme = page?.theme && isThemeName(page.theme) ? page.theme : defaultTheme;
  return ogCard({
    theme,
    title: (page?.content && docTitle(page.content)) || "cahier",
    path: username,
  });
}
