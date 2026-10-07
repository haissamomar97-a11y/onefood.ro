import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { formatLei } from "@/lib/money";
import { getOrderStore } from "@/lib/orders/store";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { updateOrder } from "../../actions";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const o = await getOrderStore()?.get((await params).id);
  if (!o) notFound();
  const c = o.customer;
  return (
    <div className="space-y-5">
      <Link href="/admin" className="text-sm text-muted underline">← Toate comenzile</Link>
      <h1 className="font-display text-3xl font-bold">{o.id}</h1>
      <p className="text-muted">{new Date(o.createdAt).toLocaleString("ro-RO")} · {o.paymentMethod === "card" ? `Card NETOPIA — ${o.payment.state === "paid" ? "PLĂTIT" : o.payment.state}${o.payment.ntpID ? ` (ntpID ${o.payment.ntpID})` : ""}` : "Ramburs"}</p>
      {o.payment.state === "chargeback" && <p className="rounded-2xl bg-berry-500/10 p-3 font-semibold text-berry-600">Atenție: chargeback înregistrat la NETOPIA.</p>}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
          <h2 className="font-semibold">Client și livrare</h2>
          <p className="mt-2">{c.name}</p>
          <p><a className="underline" href={`tel:${c.phone}`}>{c.phone}</a> · <a className="underline" href={`mailto:${c.email}`}>{c.email}</a></p>
          <p className="mt-2">{c.address}<br />{c.city}, jud. {c.county} {c.postalCode}</p>
          {c.notes && <p className="mt-2 rounded-xl bg-gold-100 p-2 text-sm">📝 {c.notes}</p>}
          {o.newsletter && <p className="mt-2 text-sm text-muted">✓ A acceptat newsletter</p>}
        </section>
        <section className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
          <h2 className="font-semibold">Produse</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {o.lines.map((l) => (
              <li key={l.sku} className="flex justify-between gap-2"><span>{l.name}{l.variant && ` · ${l.variant}`} × {l.qty}</span><span>{formatLei(l.lineTotalBani)}</span></li>
            ))}
            <li className="flex justify-between border-t border-black/5 pt-1"><span>Livrare</span><span>{formatLei(o.shippingBani)}</span></li>
            <li className="flex justify-between font-bold"><span>Total</span><span>{formatLei(o.totalBani)}</span></li>
          </ul>
        </section>
      </div>

      <form action={updateOrder} className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-black/5">
        <h2 className="font-semibold">Actualizează</h2>
        <input type="hidden" name="id" value={o.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Status
            <select name="status" defaultValue={o.status} className="field">
              {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="text-sm">AWB Sameday
            <input name="awb" defaultValue={o.awb ?? ""} className="field" placeholder="ex. 1ONB..." />
          </label>
        </div>
        <label className="block text-sm">Notă internă (opțional)<input name="note" className="field" /></label>
        <button className="btn-dark">Salvează</button>
      </form>

      <section className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
        <h2 className="font-semibold">Istoric</h2>
        <ol className="mt-2 space-y-1 text-sm text-muted">
          {(o.history ?? []).map((h, i) => (
            <li key={i}>{new Date(h.at).toLocaleString("ro-RO")} — <b className="text-ink">{ORDER_STATUSES[h.status]}</b>{h.note && ` · ${h.note}`}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
