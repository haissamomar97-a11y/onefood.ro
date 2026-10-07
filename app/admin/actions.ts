"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, clientIp, endSession, requireAdmin, startSession } from "@/lib/admin-auth";
import { withStatus } from "@/lib/orders/service";
import { getOrderStore } from "@/lib/orders/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/types";
import { rateLimit } from "@/lib/rate-limit";

export async function login(_: unknown, fd: FormData): Promise<{ error: string }> {
  if (!rateLimit(`admin-login:${await clientIp()}`, 5, 15 * 60_000)) return { error: "Prea multe încercări. Așteaptă 15 minute." };
  if (!checkPassword(String(fd.get("password") ?? ""))) return { error: "Parolă greșită." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function updateOrder(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status")) as OrderStatus;
  const awb = String(fd.get("awb") ?? "").trim().slice(0, 40);
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || undefined;
  if (!(status in ORDER_STATUSES)) throw new Error("Status invalid");
  await getOrderStore()?.update(id, (o) => {
    let next = withStatus(o, status, note) ?? o;
    if (next === o && note) next = { ...o, history: [...(o.history ?? []), { at: new Date().toISOString(), status: o.status, note }] };
    const newAwb = awb || undefined;
    if (next === o && o.awb === newAwb) return null;
    return { ...next, awb: newAwb };
  });
  revalidatePath(`/admin/comenzi/${id}`);
  revalidatePath("/admin");
}
