import type { Customer } from "../order-schema";

export type OrderLine = { slug: string; name: string; unitPriceBani: number; qty: number; lineTotalBani: number };

export type Order = {
  id: string;
  idempotencyKey: string;
  createdAt: string;
  status: "noua";
  paymentMethod: "ramburs";
  customer: Customer;
  lines: OrderLine[];
  subtotalBani: number;
  shippingBani: number;
  totalBani: number;
};

export interface OrderStore {
  /** Salvează comanda. Dacă există deja una cu aceeași cheie de idempotență, o întoarce pe aceea. */
  save(order: Order): Promise<{ order: Order; created: boolean }>;
  get(id: string): Promise<Order | null>;
}
