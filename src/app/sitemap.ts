import type { MetadataRoute } from "next";

const SITE_URL = "https://www.bandeutjipsuri.co.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/services",
    "/tenant-care",
    "/tenant-care/terms",
    "/tenant-care/as",
    "/smart-home",
    "/airbnb-setup",
    "/reviews",
    "/guide",
    "/estimate",
    "/about",
    "/demolition-support",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    ...(["", "/about", "/estimate"].includes(route) ? { lastModified: "2026-11-12" } : {}),
  }));
}
