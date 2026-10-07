"use client";

import { useEffect, useMemo, useState } from "react";
import { FILTERS, minPrice, type Product } from "@/lib/products";
import { ProductCard } from "./product-card";

const HEIGHTS = [
  { id: "mini", label: "Sub 1 m", test: (h: number) => h < 100 },
  { id: "150", label: "150 cm", test: (h: number) => h >= 140 && h < 170 },
  { id: "180", label: "180 cm", test: (h: number) => h >= 170 && h < 195 },
  { id: "200", label: "200–210 cm", test: (h: number) => h >= 195 && h < 215 },
  { id: "220", label: "220–230 cm", test: (h: number) => h >= 215 },
];

type Sort = "recomandate" | "pret-asc" | "pret-desc";

export function ProductGrid({ products }: { products: Product[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const [height, setHeight] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("recomandate");

  // ?tip=nins din linkurile de pe prima pagină (citit după încărcare, ca lista să rămână în HTML-ul static pentru SEO)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tip");
    if (t && FILTERS.some((f) => f.id === t)) setTag(t);
  }, []);

  const availableTags = FILTERS.filter((f) => products.some((p) => p.tags.includes(f.id)));
  const availableHeights = HEIGHTS.filter((h) => products.some((p) => p.variants.some((v) => v.heightCm && h.test(v.heightCm))));

  const list = useMemo(() => {
    const ht = HEIGHTS.find((h) => h.id === height);
    let l = products.filter((p) => (!tag || p.tags.includes(tag)) && (!ht || p.variants.some((v) => v.heightCm && ht.test(v.heightCm))));
    const inStock = (p: Product) => Number(p.variants.some((v) => v.stock > 0));
    if (sort === "pret-asc") l = [...l].sort((a, b) => minPrice(a) - minPrice(b));
    else if (sort === "pret-desc") l = [...l].sort((a, b) => minPrice(b) - minPrice(a));
    else l = [...l].sort((a, b) => inStock(b) - inStock(a) || Number(b.featured) - Number(a.featured));
    return l;
  }, [products, tag, height, sort]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-pine-700 text-white" : "bg-white text-ink ring-1 ring-black/10 hover:ring-pine-600"}`;

  return (
    <div>
      {availableTags.length > 0 && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2" role="group" aria-label="Tip">
          <button type="button" className={chip(!tag)} onClick={() => setTag(null)} aria-pressed={!tag}>Toate</button>
          {availableTags.map((f) => (
            <button key={f.id} type="button" className={chip(tag === f.id)} onClick={() => setTag(tag === f.id ? null : f.id)} aria-pressed={tag === f.id}>{f.label}</button>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        {availableHeights.length > 1 ? (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Înălțime">
            {availableHeights.map((h) => (
              <button key={h.id} type="button" onClick={() => setHeight(height === h.id ? null : h.id)} aria-pressed={height === h.id}
                className={`shrink-0 rounded-xl border px-3 py-1.5 text-sm ${height === h.id ? "border-berry-500 bg-berry-500/10 font-semibold text-berry-600" : "border-black/10 bg-white"}`}>
                {h.label}
              </button>
            ))}
          </div>
        ) : <span />}
        <label className="flex items-center gap-2 text-sm text-muted">
          Sortare
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-ink">
            <option value="recomandate">Recomandate</option>
            <option value="pret-asc">Preț crescător</option>
            <option value="pret-desc">Preț descrescător</option>
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-muted" aria-live="polite">{list.length} {list.length === 1 ? "produs" : "produse"}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {list.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
      </div>
      {list.length === 0 && (
        <p className="py-12 text-center text-muted">Niciun produs nu se potrivește filtrelor. <button type="button" className="underline" onClick={() => { setTag(null); setHeight(null); }}>Resetează filtrele</button></p>
      )}
    </div>
  );
}
