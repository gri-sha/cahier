import type { MetadataRoute } from "next";

// User pages are NOT disallowed here: they must stay crawlable so bots can
// see their noindex meta tag (a robots.txt block would hide it).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/edit", "/start", "/api/"],
    },
    sitemap: "https://cahier.fyi/sitemap.xml",
  };
}
