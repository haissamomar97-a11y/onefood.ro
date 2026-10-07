"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { OrderSummary } from "@/components/order-summary";
import { ProductImage } from "@/components/product-image";
import { QtyStepper } from "@/components/qty-stepper";
import { formatLei } from "@/lib/money";
import { MAX_QTY_PER_LINE, priceCart } from "@/lib/pricing";

export function CartView() {
  const { items, ready, setQty, remove } = useCart();
  const totals = priceCart(items);

  if (!ready) return <div className="container-page py-16 text-center text-muted">Se încarcă coșul…</div>;

  if (totals.lines.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-5xl" aria-hidden>🎄</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Coșul tău este gol</h1>
        <p className="mt-2 text-muted">Hai să găsim bradul potrivit pentru casa ta.</p>
        <Link href="/categorie/brazi" className="btn-primary mt-6">Vezi brazii</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="font-display text-3xl font-bold">Coșul tău</h1>
      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_340px] md:gap-8">
        <ul className="space-y-3">
          {totals.lines.map(({ sku, product: p, variant: v, qty, lineTotalBani }) => (
            <li key={sku} className="flex gap-3 rounded-3xl bg-white p-3 ring-1 ring-black/5 sm:gap-4 sm:p-4" data-testid="cart-line">
              <Link href={`/produs/${p.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-gold-100">
                <ProductImage src={p.image} alt="" sizes="96px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link href={`/produs/${p.slug}`} className="line-clamp-2 leading-snug font-semibold">{p.name}</Link>
                {p.variants.length > 1 && <span className="text-sm text-muted">{v.label}</span>}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <QtyStepper small value={qty} max={Math.min(MAX_QTY_PER_LINE, v.stock)} onChange={(n) => setQty(sku, n)} label={`Cantitate ${p.name}`} />
                  <span className="font-bold">{formatLei(lineTotalBani)}</span>
                </div>
              </div>
              <button type="button" className="-mt-1 -mr-1 self-start rounded-xl p-2 text-muted hover:bg-black/5" onClick={() => remove(sku)} aria-label={`Elimină ${p.name}`}>✕</button>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-3xl bg-white p-5 ring-1 ring-black/5 md:sticky md:top-32">
          <OrderSummary totals={totals} />
          <Link href="/comanda" className="btn-primary mt-4 hidden w-full md:flex">Finalizează comanda</Link>
          <Link href="/categorie/brazi" className="mt-3 block text-center text-sm underline">Continuă cumpărăturile</Link>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-16 z-30 p-3 md:hidden">
        <Link href="/comanda" className="btn-primary w-full shadow-lg">Finalizează comanda · {formatLei(totals.totalBani)}</Link>
      </div>
      <div aria-hidden className="h-16 md:hidden" />
    </div>
  );
}
