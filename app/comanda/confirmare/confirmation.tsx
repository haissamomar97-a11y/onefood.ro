"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatLei } from "@/lib/money";
import { site } from "@/lib/site";
import { LAST_ORDER_KEY } from "../checkout-form";

type LastOrder = { id: string; totalBani: number; email: string };

export function Confirmation() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="container-page max-w-xl py-16 text-center">
      <div aria-hidden className="mx-auto grid size-16 place-items-center rounded-full bg-sage text-3xl text-white">✓</div>
      <h1 className="mt-4 text-3xl font-bold">Mulțumim pentru comandă!</h1>
      {order ? (
        <div className="mt-4 space-y-2 text-muted">
          <p>Numărul comenzii: <b className="text-ink" data-testid="order-id">{order.id}</b></p>
          <p>Total de plată la livrare: <b className="text-ink">{formatLei(order.totalBani)}</b></p>
          <p>Confirmarea vine pe <b className="text-ink">{order.email}</b>. Te vom contacta telefonic pentru confirmarea livrării.</p>
        </div>
      ) : (
        <p className="mt-4 text-muted">Comanda ta a fost înregistrată. Pentru întrebări, scrie-ne la {site.email}.</p>
      )}
      <Link href="/produse" className="btn-primary mt-8">Continuă cumpărăturile</Link>
    </div>
  );
}
