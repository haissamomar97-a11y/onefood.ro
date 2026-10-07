import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { formatLei } from "@/lib/money";
import { getOrderStore } from "@/lib/orders/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/types";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const badge: Record<OrderStatus, string> = {
  asteapta_plata: "bg-gold-100 text-gold-600",
  noua: "bg-berry-500 text-white",
  confirmata: "bg-pine-100 text-pine-700",
  expediata: "bg-sky-100 text-sky-800",
  livrata: "bg-pine-700 text-white",
  anulata: "bg-stone-200 text-stone-600",
  plata_esuata: "bg-stone-200 text-stone-600",
};

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const all = (await getOrderStore()?.list(500)) ?? [];
  const list = status ? all.filter((o) => o.status === status) : all.filter((o) => o.status !== "plata_esuata");
  const counts = Object.fromEntries(Object.keys(ORDER_STATUSES).map((s) => [s, all.filter((o) => o.status === s).length]));
  const today = new Date().toISOString().slice(0, 10);
  const todays = all.filter((o) => o.createdAt.startsWith(today) && o.status !== "plata_esuata" && o.status !== "asteapta_plata");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Comenzi</h1>
        <div className="flex gap-2">
          <a href={`/admin/export${status ? `?status=${status}` : ""}`} className="btn-outline min-h-10 text-sm">Export CSV</a>
          <form action={logout}><button className="btn-outline min-h-10 text-sm">Ieșire</button></form>
        </div>
      </div>
      <p className="mt-1 text-muted">Azi: {todays.length} comenzi · {formatLei(todays.reduce((s, o) => s + o.totalBani, 0))}</p>
      <nav className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        <Link href="/admin" className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${!status ? "bg-pine-700 text-white" : "bg-white ring-1 ring-black/10"}`}>Active</Link>
        {Object.entries(ORDER_STATUSES).map(([k, v]) => (
          <Link key={k} href={`/admin?status=${k}`} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${status === k ? "bg-pine-700 text-white" : "bg-white ring-1 ring-black/10"}`}>
            {v} ({counts[k]})
          </Link>
        ))}
      </nav>
      <ul className="mt-4 divide-y divide-black/5 overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
        {list.length === 0 && <li className="p-6 text-center text-muted">Nicio comandă.</li>}
        {list.map((o) => (
          <li key={o.id}>
            <Link href={`/admin/comenzi/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:bg-pine-50">
              <span className="font-mono text-sm font-semibold">{o.id}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[o.status]}`}>{ORDER_STATUSES[o.status]}</span>
              <span className="text-xs text-muted">{o.paymentMethod === "card" ? (o.payment.state === "paid" ? "💳 plătit" : `💳 ${o.payment.state}`) : "💵 ramburs"}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{o.customer.name} · {o.customer.city}</span>
              <span className="text-sm text-muted">{new Date(o.createdAt).toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" })}</span>
              <span className="font-semibold">{formatLei(o.totalBani)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
