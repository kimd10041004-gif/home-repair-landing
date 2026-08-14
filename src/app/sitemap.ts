import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

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
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
  }));
}
