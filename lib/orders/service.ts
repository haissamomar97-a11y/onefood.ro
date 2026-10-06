import { randomBytes } from "node:crypto";
import { orderRequestSchema } from "../order-schema";
import { priceCart } from "../pricing";
import { getProduct } from "../products";
import type { Order, OrderStore } from "./types";

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
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, status: 400, error: "Verifică datele din formular.", fieldErrors };
  }
  const req = parsed.data;
  if (req.website) return { ok: false, status: 400, error: "Cerere invalidă." };

  // comasăm liniile duplicate și verificăm stocul înainte de a calcula prețul
  const merged = new Map<string, number>();
  for (const it of req.items) merged.set(it.slug, (merged.get(it.slug) ?? 0) + it.qty);
  for (const [slug, qty] of merged) {
    const p = getProduct(slug);
    if (!p) return { ok: false, status: 409, error: "Un produs din coș nu mai este disponibil. Reîncarcă pagina coșului." };
    if (p.stock < qty)
      return { ok: false, status: 409, error: p.stock === 0 ? `„${p.name}” nu mai este în stoc.` : `Mai avem doar ${p.stock} buc. din „${p.name}”.` };
  }

  const totals = priceCart([...merged].map(([slug, qty]) => ({ slug, qty })));
  if (totals.lines.length === 0) return { ok: false, status: 400, error: "Coșul este gol." };

  const order: Order = {
    id: newOrderId(now),
    idempotencyKey: req.idempotencyKey,
    createdAt: now.toISOString(),
    status: "noua",
    paymentMethod: "ramburs",
    customer: req.customer,
    lines: totals.lines.map((l) => ({
      slug: l.product.slug,
      name: l.product.name,
      unitPriceBani: l.product.priceBani,
      qty: l.qty,
      lineTotalBani: l.lineTotalBani,
    })),
    subtotalBani: totals.subtotalBani,
    shippingBani: totals.shippingBani,
    totalBani: totals.totalBani,
  };

  const saved = await store.save(order);
  return { ok: true, ...saved };
}
