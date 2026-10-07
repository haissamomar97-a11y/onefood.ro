import type { Metadata } from "next";
import { Suspense } from "react";
import { products } from "@/lib/products";
import { SearchView } from "./search-view";

export const metadata: Metadata = { title: "Caută", robots: { index: false }, alternates: { canonical: "/cautare" } };

export default function SearchPage() {
  return (
    <div className="container-page py-6">
      <Suspense>
        <SearchView products={products} />
      </Suspense>
    </div>
  );
}
