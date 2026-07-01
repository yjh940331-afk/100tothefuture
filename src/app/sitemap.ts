import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/data";

export const runtime = "edge";

const base = "https://www.100tothefuture.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const staticPages = ["", "/pros", "/terms", "/privacy", "/policy/reviews"].map(
    (p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }),
  );
  const proPages = slugs.map((s) => ({
    url: `${base}/pros/${s}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...proPages];
}
