"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatLei } from "@/lib/money";
import { site } from "@/lib/site";
import { LAST_ORDER_KEY } from "../keys";

type Status = { id: string; status: string; payment: "cod" | "pending" | "paid" | "failed" | "chargeback"; paymentMethod: "card" | "ramburs"; totalBani: number };

export function Confirmation() {
  const params = useSearchParams();
  const [order, setOrder] = useState<Status | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const id = params.get("id") ?? params.get("orderId");

  useEffect(() => {
    try {
      const last = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) ?? "null");
      if (last?.email && (!id || last.id === id)) setEmail(last.email);
    } catch {}
    if (!id) return setMissing(true);
    let stop = false;
    let tries = 0;
    // la plata cu cardul, confirmarea NETOPIA poate sosi la câteva secunde după revenire
    const poll = async () => {
      const res = await fetch(`/api/comenzi/${encodeURIComponent(id)}`, { cache: "no-store" }).catch(() => null);
      if (stop) return;
      if (!res?.ok) return setMissing(true);
      const s: Status = await res.json();
      setOrder(s);
      if (s.paymentMethod === "card" && s.payment === "pending" && ++tries < 20) setTimeout(poll, 3000);
    };
    poll();
    return () => { stop = true; };
  }, [id]);

  if (missing) {
    return (
      <Shell icon="🎄" title="Mulțumim!">
        <p>Dacă ai plasat o comandă, vei primi confirmarea pe email. Pentru întrebări scrie-ne la {site.email}.</p>
      </Shell>
    );
  }
  if (!order) return <div className="container-page py-16 text-center text-muted">Verificăm comanda…</div>;

  if (order.paymentMethod === "card" && order.payment === "pending") {
    return (
      <Shell icon="⏳" title="Confirmăm plata…">
        <p>Așteptăm confirmarea de la banca ta. Durează de obicei câteva secunde.</p>
        <p className="text-sm">Comanda <b className="text-ink">{order.id}</b></p>
      </Shell>
    );
  }
  if (order.paymentMethod === "card" && order.payment === "failed") {
    return (
      <Shell icon="⚠️" title="Plata nu a fost finalizată">
        <p>Comanda <b className="text-ink">{order.id}</b> este salvată, dar plata cu cardul nu a reușit. Nu ți s-a reținut niciun ban.</p>
        <p>Poți încerca din nou sau ne poți scrie la {site.email} și o trecem pe plata ramburs.</p>
        <Link href="/cos" className="btn-primary mt-4">Înapoi la coș</Link>
      </Shell>
    );
  }
  return (
    <Shell icon="✓" title="Mulțumim pentru comandă!" ok>
      <p>Numărul comenzii: <b className="text-ink" data-testid="order-id">{order.id}</b></p>
      <p>
        {order.paymentMethod === "card" ? "Plătit cu cardul: " : "De plată la livrare: "}
        <b className="text-ink">{formatLei(order.totalBani)}</b>
      </p>
      <p>{email ? <>Confirmarea vine pe <b className="text-ink">{email}</b>. </> : null}Livrăm cu {site.shipping.carrier} în {site.shipping.deliveryDays}.</p>
    </Shell>
  );
}

function Shell({ icon, title, ok, children }: { icon: string; title: string; ok?: boolean; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-xl py-14 text-center">
      <div aria-hidden className={`mx-auto grid size-20 place-items-center rounded-full text-4xl ${ok ? "bg-pine-700 text-white" : "bg-gold-100"}`}>{icon}</div>
      <h1 className="mt-5 font-display text-3xl font-bold">{title}</h1>
      <div className="mt-4 space-y-2 text-muted">{children}</div>
      <Link href="/" className="btn-outline mt-8">Înapoi în magazin</Link>
    </div>
  );
}
