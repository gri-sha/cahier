import { ogCard, ogSize } from "@/lib/og-card";
import { defaultTheme } from "@/lib/themes";

export const alt = "cahier — your cv as a clean link";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({ theme: defaultTheme, title: "cahier", path: "" });
}
