import type { MetadataRoute } from "next";

// User pages are intentionally absent: published pages carry a noindex tag, so
// they're deliberately kept out of the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://cahier.fyi", changeFrequency: "monthly", priority: 1 },
    { url: "https://cahier.fyi/terms", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://cahier.fyi/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];
}
