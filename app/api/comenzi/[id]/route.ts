import { NextResponse } from "next/server";
import { getOrderStore } from "@/lib/orders/store";

export const runtime = "nodejs";

/** Status public minim pentru pagina de confirmare (fără date personale). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^MC-\d{6}-[0-9A-F]{6}$/.test(id)) return NextResponse.json({ error: "Comandă inexistentă" }, { status: 404 });
  const order = await getOrderStore()?.get(id);
  if (!order) return NextResponse.json({ error: "Comandă inexistentă" }, { status: 404 });
  return NextResponse.json({ id: order.id, status: order.status, payment: order.payment.state, paymentMethod: order.paymentMethod, totalBani: order.totalBani });
}
