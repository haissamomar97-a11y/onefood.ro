import nodemailer, { type Transporter } from "nodemailer";
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

let transport: Transporter | null | undefined;

// SMTP generic: funcționează cu Newsman (sau orice alt furnizor SMTP).
function getTransport(): Transporter | null {
  if (transport !== undefined) return transport;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[comenzi] SMTP neconfigurat — emailurile de confirmare nu se trimit");
    return (transport = null);
  }
  const port = Number(SMTP_PORT ?? 587);
  transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465 && process.env.SMTP_HOST !== "localhost",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
  return transport;
}

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const t = getTransport();
  if (!t) return;
  await t.sendMail({
    from: process.env.ORDER_EMAIL_FROM ?? `${site.name} <comenzi@magiacasei.ro>`,
    to,
    subject,
    html,
    replyTo,
  });
}

/** Emailurile nu trebuie să blocheze sau să anuleze comanda: comanda e deja salvată. */
export async function sendOrderEmails(order: Order): Promise<void> {
  const results = await Promise.allSettled([
    send(order.customer.email, `Comanda ${order.id} a fost primită`, orderEmailHtml(order, false), site.email),
    send(process.env.ORDER_NOTIFY_TO ?? site.email, `Comandă nouă ${order.id} — ${formatLei(order.totalBani)}`, orderEmailHtml(order, true), order.customer.email),
  ]);
  for (const r of results) if (r.status === "rejected") console.error("[comenzi] email eșuat", order.id, r.reason);
}
