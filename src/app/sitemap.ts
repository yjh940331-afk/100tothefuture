import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const staticPages = ["", "/bookings", "/pros", "/terms", "/privacy", "/policy/reviews"].map(
    (p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }),
  );
  const proPages = slugs.map((s) => ({
    url: `${SITE_URL}/pros/${s}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...proPages];
}
