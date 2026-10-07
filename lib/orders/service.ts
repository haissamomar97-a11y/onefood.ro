import { randomBytes } from "node:crypto";
import { orderRequestSchema } from "../order-schema";
import { priceCart } from "../pricing";
import { resolveSku } from "../products";
import type { Order, OrderStatus, OrderStore } from "./types";

export type PlaceOrderResult =
  | { ok: true; order: Order; created: boolean }
  | { ok: false; status: number; error: string; fieldErrors?: Record<string, string> };

function newOrderId(now: Date): string {
  const d = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `MC-${d}-${rand}`;
}

export async function placeOrder(input: unknown, store: OrderStore, now = new Date()): Promise<PlaceOrderResult> {
  const parsed = orderRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { ok: false, status: 400, error: "Verifică datele din formular.", fieldErrors };
  }
  const req = parsed.data;
  if (req.website) return { ok: false, status: 400, error: "Cerere invalidă." };

  // comasăm liniile duplicate și verificăm stocul înainte de a calcula prețul
  const merged = new Map<string, number>();
  for (const it of req.items) merged.set(it.sku, (merged.get(it.sku) ?? 0) + it.qty);
  for (const [sku, qty] of merged) {
    const found = resolveSku(sku);
    if (!found) return { ok: false, status: 409, error: "Un produs din coș nu mai este disponibil. Reîncarcă pagina coșului." };
    const { product, variant } = found;
    const name = variant.id === "std" ? product.name : `${product.name} (${variant.label})`;
    if (variant.stock < qty)
      return { ok: false, status: 409, error: variant.stock === 0 ? `„${name}” nu mai este în stoc.` : `Mai avem doar ${variant.stock} buc. din „${name}”.` };
  }

  const totals = priceCart([...merged].map(([sku, qty]) => ({ sku, qty })));
  if (totals.lines.length === 0) return { ok: false, status: 400, error: "Coșul este gol." };

  const card = req.paymentMethod === "card";
  const status: OrderStatus = card ? "asteapta_plata" : "noua";
  const order: Order = {
    id: newOrderId(now),
    idempotencyKey: req.idempotencyKey,
    createdAt: now.toISOString(),
    status,
    paymentMethod: req.paymentMethod,
    payment: { state: card ? "pending" : "cod" },
    newsletter: req.newsletter,
    customer: req.customer,
    lines: totals.lines.map((l) => ({
      sku: l.sku,
      slug: l.product.slug,
      name: l.product.name,
      variant: l.variant.id === "std" ? undefined : l.variant.label,
      unitPriceBani: l.variant.priceBani,
      qty: l.qty,
      lineTotalBani: l.lineTotalBani,
    })),
    subtotalBani: totals.subtotalBani,
    shippingBani: totals.shippingBani,
    totalBani: totals.totalBani,
    history: [{ at: now.toISOString(), status }],
  };

  const saved = await store.save(order);
  return { ok: true, ...saved };
}

/** Schimbare de status cu istoric. Întoarce null dacă nu s-a schimbat nimic. */
export function withStatus(o: Order, status: OrderStatus, note?: string, now = new Date()): Order | null {
  if (o.status === status) return null;
  return { ...o, status, history: [...(o.history ?? []), { at: now.toISOString(), status, note }] };
}
