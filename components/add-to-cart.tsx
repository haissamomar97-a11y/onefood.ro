"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import { useCart } from "./cart-provider";

export function AddToCart({ slug, stock }: { slug: string; stock: number }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const max = Math.min(MAX_QTY_PER_LINE, stock);

  if (stock === 0) {
    return <p className="rounded-xl bg-stone-100 p-4 font-medium">Momentan stoc epuizat. Revino curând!</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <QtyStepper value={qty} max={max} onChange={setQty} />
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={() => {
            add(slug, qty);
            setAdded(true);
          }}
        >
          Adaugă în coș
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-6 text-sm">
        {added && (
          <>
            ✓ Adăugat în coș.{" "}
            <Link href="/cos" className="font-semibold text-brand-700 underline">Vezi coșul și finalizează comanda</Link>
          </>
        )}
      </p>
    </div>
  );
}

export function QtyStepper({ value, max, onChange, label = "Cantitate" }: { value: number; max: number; onChange: (n: number) => void; label?: string }) {
  return (
    <div className="flex h-12 items-center rounded-xl border border-stone-300" role="group" aria-label={label}>
      <button type="button" className="h-full w-11 text-xl disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Scade cantitatea">−</button>
      <span className="w-8 text-center font-semibold" aria-live="polite">{value}</span>
      <button type="button" className="h-full w-11 text-xl disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Crește cantitatea">+</button>
    </div>
  );
}
