import { after, NextResponse, type NextRequest } from "next/server";
import { verifyIpn } from "@/lib/netopia";
import { sendOrderEmails } from "@/lib/orders/email";
import { applyIpn } from "@/lib/orders/payment";
import { getOrderStore } from "@/lib/orders/store";

export const runtime = "nodejs";

/** Notificarea (IPN) trimisă de NETOPIA după fiecare încercare de plată. */
export async function POST(req: NextRequest) {
  const raw = await req.text(); // corpul exact, pentru verificarea semnăturii
  let ipn;
  try {
    ipn = verifyIpn(raw, req.headers.get("verification-token"));
  } catch (e) {
    console.error("[netopia] IPN respins:", (e as Error).message);
    return NextResponse.json({ errorCode: 1, errorMessage: "invalid" }, { status: 400 });
  }
  const store = getOrderStore();
  if (!store) return NextResponse.json({ errorCode: 1 }, { status: 503 });
  try {
    const { order, becamePaid } = await applyIpn(store, ipn);
    if (order && becamePaid) after(() => sendOrderEmails(order, store));
    return NextResponse.json({ errorCode: 0 });
  } catch (e) {
    console.error("[netopia] IPN eroare", e);
    return NextResponse.json({ errorCode: 1 }, { status: 500 }); // NETOPIA va reîncerca
  }
}
