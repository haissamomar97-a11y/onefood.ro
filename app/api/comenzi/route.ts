import { after, NextResponse, type NextRequest } from "next/server";
import { cardPaymentsEnabled, startCardPayment } from "@/lib/netopia";
import { sendOrderEmails } from "@/lib/orders/email";
import { placeOrder } from "@/lib/orders/service";
import { getOrderStore } from "@/lib/orders/store";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!rateLimit(`order:${ip}`, Number(process.env.ORDER_RATE_LIMIT ?? 10), 10 * 60_000)) {
    return NextResponse.json({ error: "Prea multe încercări. Te rugăm să aștepți câteva minute." }, { status: 429 });
  }

  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 403 });
  }

  const store = getOrderStore();
  if (!store) {
    console.error("[comenzi] DATABASE_URL lipsește în producție — comenzile sunt dezactivate");
    return NextResponse.json(
      { error: "Comenzile online sunt temporar indisponibile. Te rugăm să ne suni sau să ne scrii pe email." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  if ((body as { paymentMethod?: string })?.paymentMethod === "card" && !cardPaymentsEnabled()) {
    return NextResponse.json({ error: "Plata cu cardul nu este disponibilă momentan. Alege plata la livrare." }, { status: 400 });
  }

  try {
    const result = await placeOrder(body, store);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, fieldErrors: result.fieldErrors }, { status: result.status });
    }
    const { order, created } = result;
    const summary = { id: order.id, totalBani: order.totalBani, email: order.customer.email, paymentMethod: order.paymentMethod };

    if (order.paymentMethod === "ramburs") {
      if (created) after(() => sendOrderEmails(order, store));
      return NextResponse.json(summary, { status: created ? 201 : 200 });
    }

    // Card: comanda e salvată; emailurile pleacă doar după confirmarea plății (IPN).
    if (order.payment.state === "paid") return NextResponse.json(summary);
    try {
      const { paymentURL, ntpID } = await startCardPayment(order);
      if (ntpID) await store.update(order.id, (o) => ({ ...o, payment: { ...o.payment, ntpID } }));
      return NextResponse.json({ ...summary, paymentURL }, { status: created ? 201 : 200 });
    } catch (e) {
      console.error("[netopia] start eșuat", order.id, e);
      return NextResponse.json(
        { error: "Nu am putut deschide pagina de plată. Încearcă din nou sau alege plata la livrare.", orderId: order.id },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("[comenzi] eroare la salvare", e);
    return NextResponse.json(
      { error: "Nu am putut înregistra comanda. Încearcă din nou; nu vei fi taxat de două ori." },
      { status: 500 },
    );
  }
}
