import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { categories, getCategory, productsInCategory } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategory((await params).slug);
  if (!cat) return {};
  return { title: cat.name, description: `${cat.description} Plata la livrare și retur în 14 zile.`, alternates: { canonical: `/categorie/${cat.slug}` } };
}

export default async function CategoryPage({ params }: Props) {
  const cat = getCategory((await params).slug);
  if (!cat) notFound();
  const list = productsInCategory(cat.slug);
  return (
    <div className="container-page py-8">
      <nav aria-label="Navigare" className="text-sm text-muted">
        <Link href="/" className="hover:underline">Acasă</Link> / <span>{cat.name}</span>
      </nav>
      <h1 className="mt-2 text-3xl font-bold">{cat.name}</h1>
      <p className="mt-1 text-muted">{cat.description}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {list.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
      </div>
    </div>
  );
}
