import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { JsonLd } from "@/lib/jsonld";
import { categories, getCategory, productsInCategory } from "@/lib/products";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategory((await params).slug);
  if (!cat) return {};
  return { title: cat.name, description: cat.description.slice(0, 160), alternates: { canonical: `/categorie/${cat.slug}` } };
}

export default async function CategoryPage({ params }: Props) {
  const cat = getCategory((await params).slug);
  if (!cat) notFound();
  const list = productsInCategory(cat.slug);
  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{cat.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{cat.description}</p>
      <div className="mt-5"><ProductGrid products={list} /></div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/produs/${p.slug}`, name: p.name })),
        }}
      />
    </div>
  );
}
