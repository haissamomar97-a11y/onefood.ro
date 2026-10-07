import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getOrderStore } from "@/lib/orders/store";

export const runtime = "nodejs";

const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // protecție împotriva formulelor în Excel
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "neautorizat" }, { status: 401 });
  const status = req.nextUrl.searchParams.get("status");
  const orders = ((await getOrderStore()?.list(5000)) ?? []).filter((o) => !status || o.status === status);
  const head = ["Comanda", "Data", "Status", "Plata", "Nume", "Telefon", "Email", "Judet", "Localitate", "Adresa", "Cod postal", "Produse", "Total lei", "Ramburs lei", "AWB", "Observatii"];
  const rows = orders.map((o) => [
    o.id, o.createdAt, o.status, o.paymentMethod === "card" ? `card ${o.payment.state}` : "ramburs",
    o.customer.name, o.customer.phone, o.customer.email, o.customer.county, o.customer.city, o.customer.address, o.customer.postalCode,
    o.lines.map((l) => `${l.qty}x ${l.name}${l.variant ? ` ${l.variant}` : ""}`).join("; "),
    (o.totalBani / 100).toFixed(2), o.paymentMethod === "ramburs" ? (o.totalBani / 100).toFixed(2) : "0.00", o.awb ?? "", o.customer.notes,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="comenzi-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
