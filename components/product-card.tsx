import Link from "next/link";
import { hasManyVariants, minPrice, totalStock, type Product } from "@/lib/products";
import { Price } from "./price";
import { ProductImage } from "./product-image";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const out = totalStock(product) === 0;
  const tag = product.snow ? "Nins" : product.tags.includes("decorat") ? "Decorat" : product.tags.includes("premium") ? "PE 3D" : null;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-gold-100">
        <ProductImage src={product.image} alt={product.name} priority={priority} sizes="(min-width: 1024px) 25vw, 50vw" className="transition duration-500 group-hover:scale-105" />
        {tag && <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-pine-700 backdrop-blur">{tag}</span>}
        {out && <span className="absolute inset-x-2.5 bottom-2.5 rounded-xl bg-ink/80 px-2 py-1.5 text-center text-xs font-semibold text-white">Stoc epuizat</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
          <Link href={`/produs/${product.slug}`} className="after:absolute after:inset-0">{product.name}</Link>
        </h3>
        <p className="line-clamp-1 text-xs text-muted">{product.short}</p>
        <div className="mt-auto pt-2"><Price bani={minPrice(product)} from={hasManyVariants(product)} /></div>
      </div>
    </article>
  );
}
