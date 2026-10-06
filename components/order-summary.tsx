import { formatLei } from "@/lib/money";
import type { Totals } from "@/lib/pricing";
import { site } from "@/lib/site";

export function OrderSummary({ totals }: { totals: Totals }) {
  const missing = site.shipping.freeFromBani - totals.subtotalBani;
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatLei(totals.subtotalBani)}</dd></div>
      <div className="flex justify-between">
        <dt>Livrare</dt>
        <dd>{totals.shippingBani === 0 ? <span className="font-semibold text-sage">Gratuită</span> : formatLei(totals.shippingBani)}</dd>
      </div>
      {missing > 0 && (
        <p className="rounded-lg bg-brand-50 p-2 text-xs">Mai adaugă produse de <b>{formatLei(missing)}</b> și livrarea e gratuită.</p>
      )}
      <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold">
        <dt>Total</dt><dd data-testid="order-total">{formatLei(totals.totalBani)}</dd>
      </div>
    </dl>
  );
}
