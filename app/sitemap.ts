import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/products";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  return [
    { url: u("/"), changeFrequency: "daily", priority: 1 },
    { url: u("/produse"), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({ url: u(`/categorie/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: u(`/produs/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...["/livrare-si-retur", "/termeni-si-conditii", "/confidentialitate", "/contact"].map((p) => ({ url: u(p), priority: 0.3 })),
  ];
}
