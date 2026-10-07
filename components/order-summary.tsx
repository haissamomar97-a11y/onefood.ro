import { formatLei } from "@/lib/money";
import type { Totals } from "@/lib/pricing";
import { site } from "@/lib/site";

export function OrderSummary({ totals }: { totals: Totals }) {
  const missing = site.shipping.freeFromBani - totals.subtotalBani;
  const pct = Math.min(100, Math.round((totals.subtotalBani / site.shipping.freeFromBani) * 100));
  return (
    <dl className="space-y-2 text-sm">
      {missing > 0 ? (
        <div className="mb-3 rounded-2xl bg-gold-100 p-3 text-xs">
          Mai adaugă <b>{formatLei(missing)}</b> pentru <b>livrare gratuită</b>.
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gold-500" style={{ width: `${pct}%` }} /></div>
        </div>
      ) : (
        <p className="mb-3 rounded-2xl bg-pine-50 p-3 text-xs font-semibold text-pine-700">🎉 Ai livrare gratuită!</p>
      )}
      <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatLei(totals.subtotalBani)}</dd></div>
      <div className="flex justify-between">
        <dt className="text-muted">Livrare {site.shipping.carrier}</dt>
        <dd>{totals.shippingBani === 0 ? <span className="font-semibold text-pine-600">Gratuită</span> : formatLei(totals.shippingBani)}</dd>
      </div>
      <div className="flex justify-between border-t border-black/5 pt-2 text-base font-bold">
        <dt>Total</dt><dd data-testid="order-total">{formatLei(totals.totalBani)}</dd>
      </div>
      <p className="text-right text-xs text-muted">TVA inclus</p>
    </dl>
  );
}
