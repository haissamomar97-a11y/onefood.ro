import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Toate produsele",
  description: "Toți brazii de Crăciun artificiali: verzi, ninși, cu ace PE 3D sau PVC, de la 35 cm la 230 cm. Plata cu cardul sau ramburs.",
  alternates: { canonical: "/produse" },
};

export default function AllProducts() {
  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Toate produsele</h1>
      <div className="mt-4"><ProductGrid products={products} /></div>
    </div>
  );
}
