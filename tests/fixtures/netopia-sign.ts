import { createHash, createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
export const TEST_PRIVATE_KEY = readFileSync(path.join(dir, "netopia-test-private.pem"), "utf8");
export const TEST_PUBLIC_KEY = readFileSync(path.join(dir, "netopia-test-public.pem"), "utf8");
export const TEST_POS = "TEST-POS-SIGNATURE";

/** Semnează un corp IPN exact cum face NETOPIA (JWT RS512 în header-ul Verification-token). */
export function signIpn(body: string, { pos = TEST_POS, key = TEST_PRIVATE_KEY, iss = "NETOPIA Payments" } = {}) {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const header = b64({ alg: "RS512", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64({ iss, aud: [pos], sub: createHash("sha512").update(body).digest("base64"), iat: now, exp: now + 600 });
  const sig = createSign("RSA-SHA512").update(`${header}.${payload}`).sign(key).toString("base64url");
  return `${header}.${payload}.${sig}`;
}
