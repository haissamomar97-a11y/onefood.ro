import type { Customer, PaymentMethod } from "../order-schema";

export type OrderLine = {
  sku: string;
  slug: string;
  name: string;
  variant?: string;
  unitPriceBani: number;
  qty: number;
  lineTotalBani: number;
};

export const ORDER_STATUSES = {
  asteapta_plata: "Așteaptă plata",
  noua: "Nouă",
  confirmata: "Confirmată",
  expediata: "Expediată",
  livrata: "Livrată",
  anulata: "Anulată",
  plata_esuata: "Plată eșuată",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUSES;

export type PaymentInfo = {
  /** paid = încasat (card), pending = așteaptă, failed = ultima încercare a eșuat, cod = ramburs */
  state: "cod" | "pending" | "paid" | "failed" | "chargeback";
  ntpID?: string;
  netopiaStatus?: number;
  updatedAt?: string;
};

export type Order = {
  id: string;
  idempotencyKey: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  payment: PaymentInfo;
  newsletter?: boolean;
  customer: Customer;
  lines: OrderLine[];
  subtotalBani: number;
  shippingBani: number;
  totalBani: number;
  awb?: string;
  /** Emailurile de confirmare au fost trimise (o singură dată). */
  emailsSent?: boolean;
  history?: { at: string; status: OrderStatus; note?: string }[];
};

export interface OrderStore {
  /** Salvează comanda. Dacă există deja una cu aceeași cheie de idempotență, o întoarce pe aceea. */
  save(order: Order): Promise<{ order: Order; created: boolean }>;
  get(id: string): Promise<Order | null>;
  /** Cele mai noi comenzi întâi. */
  list(limit?: number): Promise<Order[]>;
  /** Modificare atomică: `fn` primește comanda curentă și întoarce noua versiune (sau null = fără schimbare). */
  update(id: string, fn: (o: Order) => Order | null): Promise<Order | null>;
}
