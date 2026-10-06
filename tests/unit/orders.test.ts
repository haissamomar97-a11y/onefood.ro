import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { FileOrderStore } from "@/lib/orders/file-store";
import { orderEmailHtml } from "@/lib/orders/email";
import { placeOrder } from "@/lib/orders/service";
import { site } from "@/lib/site";

const valid = () => ({
  idempotencyKey: crypto.randomUUID(),
  customer: {
    name: "Ion Popescu",
    phone: "0722 123 456",
    email: "Ion@Example.com",
    county: "Cluj",
    city: "Cluj-Napoca",
    address: "Str. Memorandumului nr. 1, ap. 2",
    postalCode: "400114",
    notes: "",
  },
  items: [{ slug: "pled-tricotat-gros", qty: 2 }],
  paymentMethod: "ramburs",
  acceptTerms: true,
  website: "",
});

let store: FileOrderStore;
beforeEach(() => {
  store = new FileOrderStore(path.join(mkdtempSync(path.join(tmpdir(), "mc-")), "orders.json"));
});

describe("plasarea comenzii", () => {
  it("salvează o comandă validă cu prețurile din catalog", async () => {
    const r = await placeOrder(valid(), store);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.created).toBe(true);
    expect(r.order.id).toMatch(/^MC-\d{6}-[0-9A-F]{6}$/);
    expect(r.order.subtotalBani).toBe(14990 * 2);
    expect(r.order.shippingBani).toBe(0); // peste 250 lei
    expect(r.order.customer.phone).toBe("0722123456");
    expect(r.order.customer.email).toBe("ion@example.com");
    expect(await store.get(r.order.id)).toEqual(r.order);
  });

  it("nu dublează comanda la retrimitere (dublu-click / rețea slabă)", async () => {
    const body = valid();
    const a = await placeOrder(body, store);
    const b = await placeOrder(body, store);
    const [c, d] = await Promise.all([placeOrder(body, store), placeOrder(body, store)]);
    expect(a.ok && b.ok && c.ok && d.ok).toBe(true);
    if (!a.ok || !b.ok || !c.ok || !d.ok) return;
    expect(b.created).toBe(false);
    expect(new Set([a.order.id, b.order.id, c.order.id, d.order.id]).size).toBe(1);
  });

  it("ignoră orice preț trimis de client", async () => {
    const body = { ...valid(), items: [{ slug: "pled-tricotat-gros", qty: 1, priceBani: 1 }] };
    const r = await placeOrder(body, store);
    expect(r.ok && r.order.totalBani).toBe(14990 + site.shipping.costBani);
  });

  it("întoarce erori pe câmp pentru date invalide", async () => {
    const body = valid();
    body.customer.phone = "123";
    body.customer.email = "nu-e-email";
    (body as { acceptTerms: boolean }).acceptTerms = false;
    const r = await placeOrder(body, store);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.status).toBe(400);
    expect(Object.keys(r.fieldErrors ?? {})).toEqual(expect.arrayContaining(["customer.phone", "customer.email", "acceptTerms"]));
  });

  it("refuză produse fără stoc sau peste stoc", async () => {
    const out = await placeOrder({ ...valid(), items: [{ slug: "fete-perna-catifea-set-2", qty: 1 }] }, store);
    expect(out.ok || out.status).toBe(409);
    const over = await placeOrder({ ...valid(), items: [{ slug: "vaza-ceramica-minimalista", qty: 10 }, { slug: "vaza-ceramica-minimalista", qty: 10 }] }, store);
    expect(over.ok || over.status).toBe(409);
  });

  it("respinge boții (câmpul capcană completat)", async () => {
    const r = await placeOrder({ ...valid(), website: "http://spam" }, store);
    expect(r.ok).toBe(false);
  });

  it("escapează HTML-ul din datele clientului în email", async () => {
    const body = valid();
    body.customer.notes = "<script>alert(1)</script>";
    const r = await placeOrder(body, store);
    if (!r.ok) throw new Error("comanda trebuia acceptată");
    expect(orderEmailHtml(r.order, true)).not.toContain("<script>");
  });
});
