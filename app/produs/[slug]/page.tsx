import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBack } from "@/components/icons";
import { ProductBuy } from "@/components/product-buy";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { JsonLd } from "@/lib/jsonld";
import { getCategory, getProduct, minPrice, products, productsInCategory } from "@/lib/products";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const desc = `${p.name} de la ${(minPrice(p) / 100).toFixed(0)} lei. ${p.short}. Livrare ${site.shipping.carrier}, plata cu cardul sau ramburs.`;
  return {
    title: p.name,
    description: desc.slice(0, 160),
    alternates: { canonical: `/produs/${p.slug}` },
    // Facebook/WhatsApp nu afișează SVG: până la pozele reale folosim imaginea de brand
    openGraph: { title: p.name, description: p.short, images: [p.image.endsWith(".svg") ? "/brand/og.png" : p.image], url: `/produs/${p.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const cat = getCategory(p.category);
  const related = productsInCategory(p.category).filter((r) => r.slug !== p.slug && r.tags.some((t) => p.tags.includes(t))).slice(0, 4);
  const more = related.length >= 2 ? related : productsInCategory(p.category).filter((r) => r.slug !== p.slug).slice(0, 4);

  return (
    <div className="container-page py-4 sm:py-6">
      <nav aria-label="Navigare" className="flex items-center gap-1 text-sm text-muted">
        <Link href={cat ? `/categorie/${cat.slug}` : "/produse"} className="-ml-2 flex items-center rounded-xl py-2 pr-3 pl-1 hover:bg-pine-50">
          <IconBack className="size-5" /> {cat?.short ?? "Produse"}
        </Link>
      </nav>

      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-12">
        <div className="relative -mx-4 aspect-[4/3] overflow-hidden bg-gold-100 sm:mx-0 sm:aspect-square sm:rounded-3xl md:sticky md:top-32 md:self-start">
          <ProductImage src={p.image} alt={p.name} priority sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        <div>
          <p className="text-sm font-medium text-gold-600">{p.short}</p>
          <h1 className="mt-1 font-display text-3xl leading-tight font-bold sm:text-4xl">{p.name}</h1>
          <div className="mt-4"><ProductBuy product={p} /></div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Ți-ar putea plăcea și</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {more.map((r) => <ProductCard key={r.slug} product={r} />)}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProductGroup",
          name: p.name,
          description: p.description,
          image: `${site.url}${p.image}`,
          productGroupID: p.slug,
          brand: { "@type": "Brand", name: site.name },
          variesBy: p.variants.length > 1 ? ["https://schema.org/size"] : undefined,
          hasVariant: p.variants.map((v) => ({
            "@type": "Product",
            name: `${p.name} ${v.label}`,
            sku: v.sku,
            size: v.label,
            image: `${site.url}${p.image}`,
            offers: {
              "@type": "Offer",
              url: `${site.url}/produs/${p.slug}`,
              priceCurrency: "RON",
              price: (v.priceBani / 100).toFixed(2),
              availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
          })),
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
