// Server care simulează NETOPIA Payments pentru testele e2e:
// pornește plata, „pagina de plată” trimite notificarea (IPN) semnată către magazin și redirecționează clientul înapoi.
import { createHash, createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import http from "node:http";

const PORT = Number(process.env.MOCK_PORT ?? 3199);
const APP = process.env.APP_URL ?? "http://localhost:3100";
const KEY = readFileSync(new URL("../fixtures/netopia-test-private.pem", import.meta.url), "utf8");
const POS = "TEST-POS-SIGNATURE";
const pending = new Map();

function sign(body) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const h = b64({ alg: "RS512", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const p = b64({ iss: "NETOPIA Payments", aud: [POS], sub: createHash("sha512").update(body).digest("base64"), iat: now, exp: now + 600 });
  return `${h}.${p}.${createSign("RSA-SHA512").update(`${h}.${p}`).sign(KEY).toString("base64url")}`;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "GET" && url.pathname === "/") return res.end("mock netopia");
  if (req.method === "POST" && url.pathname === "/payment/card/start") {
    let raw = "";
    for await (const c of req) raw += c;
    if (req.headers.authorization !== "test-api-key") {
      res.writeHead(401, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: { code: "401", message: "bad key" } }));
    }
    const body = JSON.parse(raw);
    const id = body.order.orderID;
    pending.set(id, { amount: body.order.amount, redirectUrl: body.config.redirectUrl, decline: body.order.billing.firstName === "Refuz" });
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: { code: "101", message: "Redirect user to payment page" }, payment: { status: 1, ntpID: `NTP-${id}`, paymentURL: `http://localhost:${PORT}/pay?o=${id}` } }));
  }
  if (req.method === "GET" && url.pathname === "/pay") {
    const id = url.searchParams.get("o");
    const p = pending.get(id);
    if (!p) return res.writeHead(404).end();
    const ipn = JSON.stringify({ order: { orderID: id }, payment: { status: p.decline ? 12 : 3, amount: p.amount, ntpID: `NTP-${id}`, message: p.decline ? "Card refuzat" : "Aprobat" } });
    const r = await fetch(`${APP}/api/plata/netopia`, { method: "POST", headers: { "content-type": "application/json", "verification-token": sign(ipn) }, body: ipn });
    console.log("[mock-netopia] IPN", id, r.status);
    const back = new URL(p.redirectUrl);
    res.writeHead(302, { location: `${APP}${back.pathname}${back.search}` });
    return res.end();
  }
  res.writeHead(404).end();
}).listen(PORT, () => console.log(`mock netopia pe ${PORT}`));
