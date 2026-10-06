import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Toate produsele",
  description: "Toate articolele pentru casă: bucătărie, decorațiuni, organizare și textile. Plata la livrare.",
  alternates: { canonical: "/produse" },
};

export default function AllProducts() {
  const sorted = [...products].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">Toate produsele</h1>
      <p className="mt-1 text-muted">{products.length} produse</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {sorted.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
      </div>
    </div>
  );
}
