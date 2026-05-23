import type { MetadataRoute } from "next";
import { absoluteUrl, publicStaticRoutes } from "@/lib/seo";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = publicStaticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const toolRoutes = tools
    .filter((tool) => tool.status !== "coming-soon")
    .map((tool) => ({
      url: absoluteUrl(tool.href),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: tool.sitemapPriority ?? 0.8,
    }));

  return [...staticRoutes, ...toolRoutes].sort((a, b) =>
    a.url.localeCompare(b.url),
  );
}
