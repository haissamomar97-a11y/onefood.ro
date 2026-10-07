"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MAX_QTY_PER_LINE, type CartItem } from "@/lib/pricing";

const KEY = "mc-cart-v2";

type Toast = { id: number; text: string };

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  toast: Toast | null;
  add: (sku: string, qty: number, label: string) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

function load(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((i) => typeof i?.sku === "string" && Number.isInteger(i?.qty) && i.qty > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const setQty = useCallback((sku: string, qty: number) => {
    const q = Math.max(0, Math.min(MAX_QTY_PER_LINE, Math.floor(qty)));
    setItems((prev) => (q === 0 ? prev.filter((i) => i.sku !== sku) : prev.map((i) => (i.sku === sku ? { ...i, qty: q } : i))));
  }, []);

  const add = useCallback((sku: string, qty: number, label: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.sku === sku);
      if (found) return prev.map((i) => (i.sku === sku ? { ...i, qty: Math.min(MAX_QTY_PER_LINE, i.qty + qty) } : i));
      return [...prev, { sku, qty: Math.min(MAX_QTY_PER_LINE, qty) }];
    });
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text: label });
    timer.current = setTimeout(() => setToast(null), 3500);
    navigator.vibrate?.(15);
  }, []);

  const remove = useCallback((sku: string) => setItems((prev) => prev.filter((i) => i.sku !== sku)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, toast, count: items.reduce((s, i) => s + i.qty, 0), add, setQty, remove, clear }),
    [items, ready, toast, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart în afara CartProvider");
  return ctx;
}
