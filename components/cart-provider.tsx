"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_QTY_PER_LINE, type CartItem } from "@/lib/pricing";

const KEY = "mc-cart-v1";

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

function load(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((i) => typeof i?.slug === "string" && Number.isInteger(i?.qty) && i.qty > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setItems(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* navigare privată: coșul rămâne doar în memorie */
    }
  }, [items, ready]);

  const setQty = useCallback((slug: string, qty: number) => {
    const q = Math.max(0, Math.min(MAX_QTY_PER_LINE, Math.floor(qty)));
    setItems((prev) => (q === 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, qty: q } : i))));
  }, []);

  const add = useCallback((slug: string, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === slug);
      if (found) return prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(MAX_QTY_PER_LINE, i.qty + qty) } : i));
      return [...prev, { slug, qty: Math.min(MAX_QTY_PER_LINE, qty) }];
    });
  }, []);

  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, count: items.reduce((s, i) => s + i.qty, 0), add, setQty, remove, clear }),
    [items, ready, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart în afara CartProvider");
  return ctx;
}
