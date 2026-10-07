import { createHash, createPublicKey, createVerify } from "node:crypto";
import { site } from "./site";
import type { Order } from "./orders/types";

/**
 * Integrare NETOPIA Payments (API v2, pagina de plată găzduită de NETOPIA).
 * Clientul introduce cardul pe pagina NETOPIA (3-D Secure inclus); noi nu vedem niciodată datele cardului.
 */

export const NetopiaStatus = { PAID: 3, CONFIRMED: 5 } as const;
const SETTLED = [3, 5];
const FAILED = [4, 11, 12, 13, 17, 23];
const CHARGEBACK = [9, 10, 16];

export type PaymentAction = "approve" | "reject" | "chargeback" | "pending" | "unreadable";

export function resolvePaymentAction(status: unknown): PaymentAction {
  const s = Number(status);
  if (!s || !Number.isFinite(s)) return "unreadable";
  if (SETTLED.includes(s)) return "approve";
  if (CHARGEBACK.includes(s)) return "chargeback";
  if (FAILED.includes(s)) return "reject";
  return "pending";
}

type Config = { apiKey: string; posSignature: string; publicKey?: string; sandbox: boolean };

export function netopiaConfig(): Config | null {
  const { NETOPIA_API_KEY, NETOPIA_POS_SIGNATURE, NETOPIA_PUBLIC_KEY, NETOPIA_SANDBOX } = process.env;
  if (!NETOPIA_API_KEY || !NETOPIA_POS_SIGNATURE) return null;
  return {
    apiKey: NETOPIA_API_KEY,
    posSignature: NETOPIA_POS_SIGNATURE,
    publicKey: NETOPIA_PUBLIC_KEY,
    sandbox: NETOPIA_SANDBOX !== "0",
  };
}

export const cardPaymentsEnabled = () => netopiaConfig() !== null;

const baseUrl = (c: Config) =>
  process.env.NETOPIA_API_URL ?? (c.sandbox ? "https://secure.sandbox.netopia-payments.com" : "https://secure.mobilpay.ro/pay");

/** Pornește plata și întoarce URL-ul paginii NETOPIA unde redirecționăm clientul. */
export async function startCardPayment(order: Order, cfg = netopiaConfig()): Promise<{ paymentURL: string; ntpID?: string }> {
  if (!cfg) throw new Error("NETOPIA neconfigurat");
  const [firstName, ...rest] = order.customer.name.split(/\s+/);
  const lei = (bani: number) => Math.round(bani) / 100;
  const body = {
    config: {
      emailTemplate: "",
      notifyUrl: `${site.url}/api/plata/netopia`,
      redirectUrl: `${site.url}/comanda/confirmare?id=${encodeURIComponent(order.id)}`,
      language: "ro",
    },
    payment: { options: { installments: 0, bonus: 0 } },
    order: {
      posSignature: cfg.posSignature,
      dateTime: new Date().toISOString(),
      description: `Comanda ${order.id} - ${site.name}`,
      orderID: order.id,
      amount: lei(order.totalBani),
      currency: "RON",
      billing: {
        email: order.customer.email,
        phone: order.customer.phone,
        firstName,
        lastName: rest.join(" ") || firstName,
        city: order.customer.city,
        country: 642,
        countryName: "Romania",
        state: order.customer.county,
        postalCode: order.customer.postalCode,
        details: order.customer.address,
      },
      products: order.lines.map((l) => ({
        name: l.variant ? `${l.name} (${l.variant})` : l.name,
        code: l.sku,
        category: "Decoratiuni Craciun",
        price: lei(l.lineTotalBani),
        vat: 0,
      })),
    },
  };

  const res = await fetch(`${baseUrl(cfg)}/payment/card/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: cfg.apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: { code?: string; message?: string };
    payment?: { paymentURL?: string; ntpID?: string };
  };
  // „101” = redirecționează clientul spre pagina de plată. Nu înseamnă că s-a plătit.
  if (!res.ok || data.error?.code !== "101" || !data.payment?.paymentURL) {
    throw new Error(`NETOPIA start ${res.status}: ${data.error?.code ?? "?"} ${data.error?.message ?? ""}`.trim());
  }
  return { paymentURL: data.payment.paymentURL, ntpID: data.payment.ntpID };
}

export type IpnPayload = { order?: { orderID?: string }; payment?: { status?: number; ntpID?: string; amount?: number; message?: string } };

/**
 * Verifică notificarea (IPN) trimisă de NETOPIA: header-ul „Verification-token” e un JWT semnat RSA,
 * cu iss = „NETOPIA Payments”, aud = semnătura POS și sub = sha512(base64) al corpului exact primit.
 */
export function verifyIpn(rawBody: string, token: string | null, cfg = netopiaConfig()): IpnPayload {
  if (!cfg?.publicKey) throw new Error("Cheia publică NETOPIA lipsește");
  if (!token) throw new Error("Verification-token lipsă");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Token invalid");
  const [h, p, sig] = parts;
  const decode = (s: string) => JSON.parse(Buffer.from(s, "base64url").toString("utf8"));
  const header = decode(h);
  const algs: Record<string, string> = { RS256: "RSA-SHA256", RS512: "RSA-SHA512" };
  if (typeof header?.alg !== "string" || !Object.hasOwn(algs, header.alg)) throw new Error("Algoritm nesuportat");
  const key = createPublicKey(cfg.publicKey.replace(/\\n/g, "\n"));
  const v = createVerify(algs[header.alg]);
  v.update(`${h}.${p}`);
  if (!v.verify(key, Buffer.from(sig, "base64url"))) throw new Error("Semnătură invalidă");
  const claims = decode(p);
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== "NETOPIA Payments") throw new Error("Emitent invalid");
  if (typeof claims.exp === "number" && now > claims.exp) throw new Error("Token expirat");
  const aud = ([] as string[]).concat(claims.aud ?? []);
  if (!aud.includes(cfg.posSignature)) throw new Error("Token pentru alt POS");
  const hash = createHash("sha512").update(rawBody).digest("base64");
  if (hash !== claims.sub) throw new Error("Corpul nu corespunde semnăturii");
  return JSON.parse(rawBody) as IpnPayload;
}
