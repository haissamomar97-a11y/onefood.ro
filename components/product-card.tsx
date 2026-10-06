import Link from "next/link";
import type { Product } from "@/lib/products";
import { Price } from "./price";
import { ProductImage } from "./product-image";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-md">
      <div className="relative aspect-square bg-brand-50">
        <ProductImage src={product.image} alt={product.name} priority={priority} sizes="(min-width: 1024px) 25vw, 50vw" />
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 rounded-md bg-ink/80 px-2 py-1 text-xs font-semibold text-white">Stoc epuizat</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold sm:text-base">
          <Link href={`/produs/${product.slug}`} className="after:absolute after:inset-0">{product.name}</Link>
        </h3>
        <p className="line-clamp-1 text-xs text-muted sm:text-sm">{product.short}</p>
        <div className="mt-auto pt-1"><Price bani={product.priceBani} compareAt={product.compareAtBani} /></div>
      </div>
    </article>
  );
}
