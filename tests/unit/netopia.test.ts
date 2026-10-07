import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { verifyIpn } from "@/lib/netopia";
import { FileOrderStore } from "@/lib/orders/file-store";
import { applyIpn } from "@/lib/orders/payment";
import { placeOrder } from "@/lib/orders/service";
import { signIpn, TEST_POS, TEST_PUBLIC_KEY } from "../fixtures/netopia-sign";
import { validOrder } from "../fixtures/orders";

const cfg = { apiKey: "k", posSignature: TEST_POS, publicKey: TEST_PUBLIC_KEY, sandbox: true };
const ipnBody = (orderID: string, status: number, amount: number) =>
  JSON.stringify({ order: { orderID }, payment: { status, amount, ntpID: "NTP-1", message: "test" } });

describe("verificarea notificării NETOPIA (IPN)", () => {
  const body = ipnBody("MC-1", 3, 10);

  it("acceptă o notificare semnată corect", () => {
    expect(verifyIpn(body, signIpn(body), cfg).payment?.status).toBe(3);
  });

  it("respinge: corp modificat, alt POS, alt emitent, token lipsă, cheie greșită", () => {
    const tok = signIpn(body);
    expect(() => verifyIpn(body.replace('"status":3', '"status":5'), tok, cfg)).toThrow();
    expect(() => verifyIpn(body, signIpn(body, { pos: "ALT-POS" }), cfg)).toThrow();
    expect(() => verifyIpn(body, signIpn(body, { iss: "Hacker" }), cfg)).toThrow();
    expect(() => verifyIpn(body, null, cfg)).toThrow();
    const [h, p] = tok.split(".");
    expect(() => verifyIpn(body, `${h}.${p}.AAAA`, cfg)).toThrow();
  });
});

describe("aplicarea plății pe comandă", () => {
  let store: FileOrderStore;
  beforeEach(() => {
    store = new FileOrderStore(path.join(mkdtempSync(path.join(tmpdir(), "mc-")), "orders.json"));
  });
  const cardOrder = async () => {
    const r = await placeOrder(validOrder({ paymentMethod: "card" }), store);
    if (!r.ok) throw new Error(r.error);
    return r.order;
  };
  const ipn = (id: string, status: number, lei: number) => JSON.parse(ipnBody(id, status, lei));

  it("refuz, apoi plată reușită cu alt card → comandă plătită, o singură dată", async () => {
    const o = await cardOrder();
    const lei = o.totalBani / 100;
    expect((await applyIpn(store, ipn(o.id, 12, lei))).order?.status).toBe("plata_esuata");
    const paid = await applyIpn(store, ipn(o.id, 3, lei));
    expect(paid.becamePaid).toBe(true);
    expect(paid.order).toMatchObject({ status: "noua", payment: { state: "paid", ntpID: "NTP-1" } });
    // NETOPIA retrimite notificarea: nu se schimbă nimic
    const again = await applyIpn(store, ipn(o.id, 5, lei));
    expect(again.becamePaid).toBe(false);
    // un refuz întârziat nu anulează o comandă deja plătită
    expect((await applyIpn(store, ipn(o.id, 12, lei))).order?.payment.state).toBe("paid");
  });

  it("nu marchează plătită dacă suma diferă", async () => {
    const o = await cardOrder();
    const r = await applyIpn(store, ipn(o.id, 3, 1));
    expect(r.becamePaid).toBe(false);
    expect(r.order?.payment.state).toBe("pending");
  });

  it("ignoră comenzile ramburs și comenzile necunoscute", async () => {
    const r = await placeOrder(validOrder(), store);
    if (!r.ok) throw new Error(r.error);
    expect((await applyIpn(store, ipn(r.order.id, 3, r.order.totalBani / 100))).order?.payment.state).toBe("cod");
    expect((await applyIpn(store, ipn("MC-000000-XXXXXX", 3, 1))).order).toBeNull();
  });
});
