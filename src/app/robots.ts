import type { MetadataRoute } from "next";

const SITE_URL = "https://bandeutjipsuri.co.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
// production deploy trigger
