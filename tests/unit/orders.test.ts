import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { orderEmailHtml } from "@/lib/orders/email";
import { FileOrderStore } from "@/lib/orders/file-store";
import { placeOrder } from "@/lib/orders/service";
import { site } from "@/lib/site";

import { validOrder } from "../fixtures/orders";

const SKU = "brad-artificial-kovalivska-vip-verde~180"; // 749 lei, stoc 15

let store: FileOrderStore;
beforeEach(() => {
  store = new FileOrderStore(path.join(mkdtempSync(path.join(tmpdir(), "mc-")), "orders.json"));
});

describe("plasarea comenzii", () => {
  it("salvează o comandă ramburs cu prețurile din catalog", async () => {
    const r = await placeOrder(validOrder(), store);
    if (!r.ok) throw new Error(r.error);
    expect(r.created).toBe(true);
    expect(r.order.id).toMatch(/^MC-\d{6}-[0-9A-F]{6}$/);
    expect(r.order.status).toBe("noua");
    expect(r.order.payment.state).toBe("cod");
    expect(r.order.subtotalBani).toBe(74900 * 2);
    expect(r.order.shippingBani).toBe(0);
    expect(r.order.lines[0]).toMatchObject({ sku: SKU, variant: "180 cm", unitPriceBani: 74900 });
    expect(r.order.customer).toMatchObject({ phone: "0722123456", email: "ion@example.com" });
    expect(await store.get(r.order.id)).toEqual(r.order);
  });

  it("comanda cu cardul așteaptă plata", async () => {
    const r = await placeOrder(validOrder({ paymentMethod: "card" }), store);
    if (!r.ok) throw new Error(r.error);
    expect(r.order.status).toBe("asteapta_plata");
    expect(r.order.payment.state).toBe("pending");
  });

  it("nu dublează comanda la retrimitere (dublu-click / rețea slabă)", async () => {
    const body = validOrder();
    const results = await Promise.all([placeOrder(body, store), placeOrder(body, store), placeOrder(body, store)]);
    const ids = results.map((r) => (r.ok ? r.order.id : r.error));
    expect(new Set(ids).size).toBe(1);
    expect(results.filter((r) => r.ok && r.created)).toHaveLength(1);
    expect(await store.list()).toHaveLength(1);
  });

  it("ignoră orice preț trimis de client", async () => {
    const r = await placeOrder(validOrder({ items: [{ sku: "brad-artificial-lidia-varfuri-albe~150", qty: 1, priceBani: 1 }] }), store);
    expect(r.ok && r.order.totalBani).toBe(14900 + site.shipping.costBani);
  });

  it("întoarce erori pe câmp pentru date invalide", async () => {
    const body = validOrder({ acceptTerms: false });
    body.customer.phone = "123";
    body.customer.email = "nu-e-email";
    const r = await placeOrder(body, store);
    if (r.ok) throw new Error("trebuia respinsă");
    expect(r.status).toBe(400);
    expect(Object.keys(r.fieldErrors ?? {})).toEqual(expect.arrayContaining(["customer.phone", "customer.email", "acceptTerms"]));
  });

  it("refuză peste stoc (inclusiv linii duplicate) și SKU-uri inexistente", async () => {
    const over = await placeOrder(validOrder({ items: [{ sku: "brad-artificial-belgian-verde~230", qty: 2 }, { sku: "brad-artificial-belgian-verde~230", qty: 2 }] }), store);
    expect(over.ok || over.status).toBe(409);
    const ghost = await placeOrder(validOrder({ items: [{ sku: "brad-inexistent~180", qty: 1 }] }), store);
    expect(ghost.ok || ghost.status).toBe(409);
  });

  it("respinge boții (câmpul capcană completat)", async () => {
    expect((await placeOrder(validOrder({ website: "http://spam" }), store)).ok).toBe(false);
  });

  it("escapează HTML-ul din datele clientului în email", async () => {
    const body = validOrder();
    body.customer.notes = "<script>alert(1)</script>";
    const r = await placeOrder(body, store);
    if (!r.ok) throw new Error(r.error);
    expect(orderEmailHtml(r.order, true)).not.toContain("<script>");
  });
});
