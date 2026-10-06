import { after, NextResponse, type NextRequest } from "next/server";
import { sendOrderEmails } from "@/lib/orders/email";
import { placeOrder } from "@/lib/orders/service";
import { getOrderStore } from "@/lib/orders/store";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (!rateLimit(`order:${ip}`, 10, 10 * 60_000)) {
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

  try {
    const result = await placeOrder(body, store);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, fieldErrors: result.fieldErrors }, { status: result.status });
    }
    const { order, created } = result;
    if (created) after(() => sendOrderEmails(order));
    return NextResponse.json(
      { id: order.id, totalBani: order.totalBani, email: order.customer.email },
      { status: created ? 201 : 200 },
    );
  } catch (e) {
    console.error("[comenzi] eroare la salvare", e);
    return NextResponse.json(
      { error: "Nu am putut înregistra comanda. Încearcă din nou; nu vei fi taxat de două ori." },
      { status: 500 },
    );
  }
}
