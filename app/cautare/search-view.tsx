"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { IconSearch } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function SearchView({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return products.filter((p) => {
      const hay = norm([p.name, p.short, p.description, p.material, ...p.tags, ...p.variants.map((v) => v.label)].join(" "));
      return terms.every((t) => hay.includes(t));
    });
  }, [q, products]);

  return (
    <div>
      <form role="search" onSubmit={(e) => { e.preventDefault(); router.replace(`/cautare?q=${encodeURIComponent(q)}`); }} className="relative">
        <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Caută: nins, 180 cm, PE 3D…"
          aria-label="Caută produse"
          enterKeyHint="search"
          className="block h-14 w-full rounded-2xl bg-white pr-4 pl-12 text-base shadow-sm ring-1 ring-black/10 focus:ring-2 focus:ring-pine-600 focus:outline-none"
        />
      </form>
      {q.trim() === "" ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {["nins", "180 cm", "PE 3D", "buturugă", "fructe roșii", "ghiveci"].map((s) => (
            <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-black/10">{s}</button>
          ))}
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted" aria-live="polite">{results.length} rezultate pentru „{q}”</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {results.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
