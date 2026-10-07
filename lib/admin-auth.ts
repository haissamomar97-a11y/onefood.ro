import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "mc_admin";
const TTL_S = 7 * 24 * 3600;

function secret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 12) return null; // parolă lipsă sau prea scurtă => panou dezactivat
  return `${process.env.ADMIN_SESSION_SECRET ?? ""}:${pw}`;
}

const sign = (s: string, exp: number) => createHmac("sha256", s).update(`admin:${exp}`).digest("base64url");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const adminEnabled = () => secret() !== null;

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && adminEnabled() && safeEqual(createHmac("sha256", "k").update(input).digest("hex"), createHmac("sha256", "k").update(pw).digest("hex"));
}

export async function startSession() {
  const s = secret();
  if (!s) throw new Error("Admin dezactivat");
  const exp = Math.floor(Date.now() / 1000) + TTL_S;
  (await cookies()).set(COOKIE, `${exp}.${sign(s, exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TTL_S,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const s = secret();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!s || !raw) return false;
  const [expStr, sig] = raw.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now() / 1000 || !sig) return false;
  return safeEqual(sig, sign(s, exp));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
}
