import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { JsonLd } from "@/lib/jsonld";
import { getCategory, getProduct, products, productsInCategory } from "@/lib/products";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.short} ${p.description}`.slice(0, 160),
    alternates: { canonical: `/produs/${p.slug}` },
    openGraph: { title: p.name, description: p.short, images: [p.image], url: `/produs/${p.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const cat = getCategory(p.category);
  const related = productsInCategory(p.category).filter((r) => r.slug !== p.slug).slice(0, 4);

  return (
    <div className="container-page py-6">
      <nav aria-label="Navigare" className="text-sm text-muted">
        <Link href="/" className="hover:underline">Acasă</Link> /{" "}
        {cat && <Link href={`/categorie/${cat.slug}`} className="hover:underline">{cat.name}</Link>}
      </nav>

      <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
          <ProductImage src={p.image} alt={p.name} priority sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div>
          <h1 className="text-2xl leading-tight font-bold sm:text-3xl">{p.name}</h1>
          <p className="mt-2 text-muted">{p.short}</p>
          <div className="mt-4"><Price bani={p.priceBani} compareAt={p.compareAtBani} large /></div>
          <p className={`mt-1 text-sm font-medium ${p.stock > 0 ? "text-sage" : "text-muted"}`}>
            {p.stock > 5 ? "● În stoc" : p.stock > 0 ? `● Ultimele ${p.stock} bucăți` : "Stoc epuizat"}
          </p>
          <div className="mt-6"><AddToCart slug={p.slug} stock={p.stock} /></div>
          <ul className="mt-4 space-y-1 rounded-2xl bg-brand-50 p-4 text-sm">
            <li>🚚 Livrare în {site.shipping.deliveryDays}, gratuită peste 250 lei</li>
            <li>💵 Plata la livrare, cash sau card</li>
            <li>↩️ Retur gratuit în 14 zile</li>
          </ul>
          <h2 className="mt-8 text-lg font-semibold">Descriere</h2>
          <p className="mt-2 leading-relaxed text-muted">{p.description}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
            {p.details.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Poate te interesează și</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.slug} product={r} />)}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.description,
          image: `${site.url}${p.image}`,
          sku: p.slug,
          brand: { "@type": "Brand", name: site.name },
          offers: {
            "@type": "Offer",
            url: `${site.url}/produs/${p.slug}`,
            priceCurrency: "RON",
            price: (p.priceBani / 100).toFixed(2),
            availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "RO" },
              shippingRate: { "@type": "MonetaryAmount", value: (site.shipping.costBani / 100).toFixed(2), currency: "RON" },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "RO",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 14,
            },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: site.url },
            ...(cat ? [{ "@type": "ListItem", position: 2, name: cat.name, item: `${site.url}/categorie/${cat.slug}` }] : []),
            { "@type": "ListItem", position: cat ? 3 : 2, name: p.name },
          ],
        }}
      />
    </div>
  );
}
