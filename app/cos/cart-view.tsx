"use client";

import Link from "next/link";
import { QtyStepper } from "@/components/add-to-cart";
import { useCart } from "@/components/cart-provider";
import { OrderSummary } from "@/components/order-summary";
import { ProductImage } from "@/components/product-image";
import { formatLei } from "@/lib/money";
import { MAX_QTY_PER_LINE, priceCart } from "@/lib/pricing";

export function CartView() {
  const { items, ready, setQty, remove } = useCart();
  const totals = priceCart(items);

  if (!ready) return <div className="container-page py-16 text-center text-muted">Se încarcă coșul…</div>;

  if (totals.lines.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Coșul tău este gol</h1>
        <p className="mt-2 text-muted">Descoperă produsele noastre pentru casă.</p>
        <Link href="/produse" className="btn-primary mt-6">Vezi produsele</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 pb-32 md:pb-8">
      <h1 className="text-3xl font-bold">Coșul tău</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {totals.lines.map(({ product: p, qty, lineTotalBani }) => (
            <li key={p.slug} className="flex gap-3 p-3 sm:gap-4 sm:p-4" data-testid="cart-line">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-brand-50 sm:size-24">
                <ProductImage src={p.image} alt="" sizes="96px" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Link href={`/produs/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
                <span className="text-sm text-muted">{formatLei(p.priceBani)} / buc.</span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <QtyStepper value={qty} max={Math.min(MAX_QTY_PER_LINE, p.stock)} onChange={(n) => setQty(p.slug, n)} label={`Cantitate ${p.name}`} />
                  <span className="font-bold">{formatLei(lineTotalBani)}</span>
                </div>
                <button type="button" className="self-start text-sm text-muted underline" onClick={() => remove(p.slug)}>Elimină</button>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-4">
          <OrderSummary totals={totals} />
          <Link href="/comanda" className="btn-primary mt-4 hidden w-full md:flex">Finalizează comanda</Link>
          <Link href="/produse" className="mt-3 block text-center text-sm underline">Continuă cumpărăturile</Link>
        </aside>
      </div>
      {/* buton fix pe mobil, mereu la îndemâna degetului */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white p-3 md:hidden">
        <Link href="/comanda" className="btn-primary w-full">Finalizează comanda · {formatLei(totals.totalBani)}</Link>
      </div>
    </div>
  );
}
