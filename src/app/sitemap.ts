import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/data";
import { GOLF_INFO_CATEGORIES } from "@/lib/golf-info";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const lastModified = new Date();
  const staticPages = [
    ["", 1],
    ["/request", 0.9],
    ["/pros", 0.9],
    ["/quiz", 0.75],
    ["/info", 0.75],
    ["/terms", 0.25],
    ["/privacy", 0.25],
    ["/policy/reviews", 0.25],
  ].map(([p, priority]) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: Number(priority),
    lastModified,
  }));
  const infoPages = GOLF_INFO_CATEGORIES.map((category) => ({
    url: `${SITE_URL}/info/${category.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.65,
    lastModified,
  }));
  const proPages = slugs.map((s) => ({
    url: `${SITE_URL}/pros/${s}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified,
  }));
  return [...staticPages, ...infoPages, ...proPages];
}
