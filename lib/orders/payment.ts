import { resolvePaymentAction, type IpnPayload } from "../netopia";
import { withStatus } from "./service";
import type { Order, OrderStore } from "./types";

export type IpnOutcome = { order: Order | null; becamePaid: boolean };

/**
 * Aplică o notificare NETOPIA verificată. Idempotent: NETOPIA reîncearcă și trimite câte o notificare
 * pentru fiecare încercare (clientul poate încerca alt card după un refuz), deci un refuz NU anulează comanda.
 */
export async function applyIpn(store: OrderStore, ipn: IpnPayload, now = new Date()): Promise<IpnOutcome> {
  const orderId = ipn.order?.orderID;
  const status = ipn.payment?.status;
  if (!orderId) return { order: null, becamePaid: false };
  let becamePaid = false;

  const order = await store.update(orderId, (o) => {
    if (o.paymentMethod !== "card") return null;
    const action = resolvePaymentAction(status);
    if (action === "unreadable") return null;
    const at = now.toISOString();
    const payment = { ...o.payment, ntpID: ipn.payment?.ntpID ?? o.payment.ntpID, netopiaStatus: Number(status), updatedAt: at };

    if (action === "approve") {
      // suma notificată e în lei (zecimal); comparăm în bani
      const paidBani = Math.round(Number(ipn.payment?.amount) * 100);
      if (paidBani !== o.totalBani) {
        console.error("[netopia] sumă diferită", o.id, paidBani, o.totalBani);
        return { ...o, payment: { ...payment, state: "pending" }, history: [...(o.history ?? []), { at, status: o.status, note: `Sumă plătită diferită: ${paidBani / 100} lei` }] };
      }
      if (o.payment.state === "paid") return null;
      becamePaid = true;
      const next = withStatus({ ...o, payment: { ...payment, state: "paid" } }, "noua", "Plată card confirmată", now);
      return next ?? { ...o, payment: { ...payment, state: "paid" } };
    }
    if (action === "chargeback") {
      return { ...o, payment: { ...payment, state: "chargeback" }, history: [...(o.history ?? []), { at, status: o.status, note: "Chargeback NETOPIA — verifică!" }] };
    }
    if (action === "reject") {
      if (o.payment.state === "paid") return null;
      const next = withStatus({ ...o, payment: { ...payment, state: "failed" } }, "plata_esuata", ipn.payment?.message, now);
      return next ?? { ...o, payment: { ...payment, state: "failed" } };
    }
    return { ...o, payment };
  });

  return { order, becamePaid };
}
