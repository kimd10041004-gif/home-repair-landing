import type { MetadataRoute } from "next";

const SITE_URL = "https://bandeutjipsuri.co.kr";

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
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
