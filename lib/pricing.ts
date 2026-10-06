import { getProduct, type Product } from "./products";
import { site } from "./site";

export const MAX_QTY_PER_LINE = 10;

export type CartItem = { slug: string; qty: number };
export type PricedLine = { product: Product; qty: number; lineTotalBani: number };
export type Totals = { lines: PricedLine[]; subtotalBani: number; shippingBani: number; totalBani: number };

export function shippingFor(subtotalBani: number): number {
  if (subtotalBani === 0) return 0;
  return subtotalBani >= site.shipping.freeFromBani ? 0 : site.shipping.costBani;
}

// Prețurile se iau mereu din catalog, niciodată de la client.
export function priceCart(items: CartItem[]): Totals {
  const lines: PricedLine[] = [];
  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) continue;
    const qty = Math.max(0, Math.min(Math.floor(item.qty), MAX_QTY_PER_LINE, product.stock));
    if (qty === 0) continue;
    lines.push({ product, qty, lineTotalBani: product.priceBani * qty });
  }
  const subtotalBani = lines.reduce((s, l) => s + l.lineTotalBani, 0);
  const shippingBani = shippingFor(subtotalBani);
  return { lines, subtotalBani, shippingBani, totalBani: subtotalBani + shippingBani };
}
