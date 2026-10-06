import { formatLei } from "../money";
import { site } from "../site";
import type { Order } from "./types";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function orderEmailHtml(order: Order, forShop: boolean): string {
  const c = order.customer;
  const rows = order.lines
    .map((l) => `<tr><td>${esc(l.name)} × ${l.qty}</td><td align="right">${formatLei(l.lineTotalBani)}</td></tr>`)
    .join("");
  return `<div style="font-family:Arial,sans-serif;max-width:560px">
<h2>${forShop ? "Comandă nouă" : "Mulțumim pentru comandă!"} — ${order.id}</h2>
${forShop ? "" : `<p>Bună, ${esc(c.name)}! Am primit comanda ta și te contactăm telefonic pentru confirmare. Livrare estimată: ${site.shipping.deliveryDays}.</p>`}
<table width="100%" cellpadding="6" style="border-collapse:collapse">${rows}
<tr><td>Livrare</td><td align="right">${order.shippingBani ? formatLei(order.shippingBani) : "Gratuită"}</td></tr>
<tr><td><b>Total (plata la livrare)</b></td><td align="right"><b>${formatLei(order.totalBani)}</b></td></tr></table>
<p><b>Livrare:</b> ${esc(c.name)}, ${esc(c.phone)}<br>${esc(c.address)}, ${esc(c.city)}, jud. ${esc(c.county)} ${esc(c.postalCode)}</p>
${c.notes ? `<p><b>Observații:</b> ${esc(c.notes)}</p>` : ""}
${forShop ? `<p>Email client: ${esc(c.email)}</p>` : `<p>Întrebări? Scrie-ne la ${site.email}.</p>`}
</div>`;
}

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ORDER_EMAIL_FROM ?? `${site.name} <comenzi@magiacasei.ro>`,
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/** Emailurile nu trebuie să blocheze sau să anuleze comanda: comanda e deja salvată. */
export async function sendOrderEmails(order: Order): Promise<void> {
  const results = await Promise.allSettled([
    send(order.customer.email, `Comanda ${order.id} a fost primită`, orderEmailHtml(order, false), site.email),
    send(process.env.ORDER_NOTIFY_TO ?? site.email, `Comandă nouă ${order.id} — ${formatLei(order.totalBani)}`, orderEmailHtml(order, true), order.customer.email),
  ]);
  for (const r of results) if (r.status === "rejected") console.error("[comenzi] email eșuat", order.id, r.reason);
}
