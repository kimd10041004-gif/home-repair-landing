import type { MetadataRoute } from "next";

const SITE_URL = "https://home-repair-landing.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/services",
    "/tenant-care",
    "/tenant-care/terms",
    "/tenant-care/as",
    "/smart-home",
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
