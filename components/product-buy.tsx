"use client";

import { useState } from "react";
import { formatLei } from "@/lib/money";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import { defaultVariant, skuOf, type Product } from "@/lib/products";
import { site } from "@/lib/site";
import { useCart } from "./cart-provider";
import { IconCard, IconCash, IconReturn, IconTruck } from "./icons";
import { QtyStepper } from "./qty-stepper";

export function ProductBuy({ product }: { product: Product }) {
  const { add } = useCart();
  const [variant, setVariant] = useState(() => defaultVariant(product));
  const [qty, setQty] = useState(1);
  const max = Math.min(MAX_QTY_PER_LINE, variant.stock);
  const out = variant.stock === 0;
  const label = product.variants.length > 1 ? `${product.name} · ${variant.label}` : product.name;

  function addToCart() {
    if (out) return;
    add(skuOf(product, variant), Math.min(qty, max), label);
  }

  const specs: [string, string | null | undefined][] = [
    ["Înălțime", variant.heightCm ? `${variant.heightCm} cm` : null],
    ["Diametru la bază", variant.widthCm ? `${variant.widthCm} cm` : null],
    ["Material ace", product.material],
    ["Efect nins", product.snow ? "Da" : "Nu"],
    ["Greutate", variant.weightKg ? `${String(variant.weightKg).replace(".", ",")} kg` : null],
    ["Dimensiune colet", variant.package ? `${variant.package.replace(/x/g, " × ")} mm` : null],
  ];

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-pine-700" data-testid="product-price">{formatLei(variant.priceBani)}</span>
        <span className="text-xs text-muted">TVA inclus</span>
      </div>
      <p className={`mt-1 text-sm font-medium ${out ? "text-muted" : variant.stock <= 5 ? "text-berry-600" : "text-pine-600"}`}>
        {out ? "Stoc epuizat pentru această înălțime" : variant.stock <= 5 ? `● Ultimele ${variant.stock} bucăți` : "● În stoc, livrare în " + site.shipping.deliveryDays}
      </p>

      {product.variants.length > 1 && (
        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold">{product.variantLabel ?? "Variantă"}: <span className="font-normal text-muted">{variant.label}</span></legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const active = v.id === variant.id;
              return (
                <button key={v.id} type="button" aria-pressed={active} onClick={() => { setVariant(v); setQty(1); }}
                  className={`relative min-w-20 rounded-2xl border-2 px-3 py-2 text-left transition ${active ? "border-pine-700 bg-pine-50" : "border-black/10 bg-white hover:border-pine-600"} ${v.stock === 0 ? "opacity-50" : ""}`}>
                  <span className="block text-sm font-semibold">{v.label}</span>
                  <span className="block text-xs text-muted">{v.stock === 0 ? "epuizat" : formatLei(v.priceBani)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-6 hidden gap-3 md:flex">
        <QtyStepper value={qty} max={Math.max(1, max)} onChange={setQty} />
        <button type="button" className="btn-primary flex-1" onClick={addToCart} disabled={out}>
          {out ? "Stoc epuizat" : "Adaugă în coș"}
        </button>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 text-xs sm:text-sm">
        <li className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5"><IconTruck className="size-5 shrink-0 text-pine-600" />Livrare {site.shipping.carrier} {site.shipping.deliveryDays}</li>
        <li className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5"><IconCard className="size-5 shrink-0 text-pine-600" />Plată securizată cu cardul</li>
        <li className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5"><IconCash className="size-5 shrink-0 text-pine-600" />Sau ramburs la livrare</li>
        <li className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5"><IconReturn className="size-5 shrink-0 text-pine-600" />Retur în 14 zile</li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold">Descriere</h2>
      <p className="mt-2 leading-relaxed text-muted">{product.description}</p>

      <h2 className="mt-6 font-display text-xl font-semibold">Specificații</h2>
      <dl className="mt-2 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white text-sm ring-1 ring-black/5">
        {specs.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
        ))}
      </dl>

      {/* bară fixă pe telefon, ca într-o aplicație */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 p-3">
          <div className="min-w-0">
            <p className="text-lg leading-tight font-bold text-pine-700">{formatLei(variant.priceBani)}</p>
            {product.variants.length > 1 && <p className="text-xs text-muted">{variant.label}</p>}
          </div>
          <button type="button" className="btn-primary flex-1" onClick={addToCart} disabled={out}>{out ? "Stoc epuizat" : "Adaugă în coș"}</button>
        </div>
      </div>
      <div aria-hidden className="h-24 md:hidden" />
    </div>
  );
}
