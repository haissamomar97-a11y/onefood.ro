"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-provider";
import { IconCheck } from "./icons";

export function CartToast() {
  const { toast } = useCart();
  const path = usePathname();
  if (!toast) return null;
  const onProduct = path.startsWith("/produs/");
  return (
    <div role="status" aria-live="polite" className={`fixed inset-x-3 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:w-96 ${onProduct ? "bottom-24" : "bottom-20"}`}>
      <div key={toast.id} className="animate-toast flex items-center gap-3 rounded-2xl bg-pine-800 p-3 pl-4 text-white shadow-xl">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-500 text-pine-900"><IconCheck className="size-5" /></span>
        <span className="min-w-0 flex-1 text-sm"><b className="block">Adăugat în coș</b><span className="line-clamp-1 text-white/80">{toast.text}</span></span>
        <Link href="/cos" className="shrink-0 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-pine-800">Vezi coșul</Link>
      </div>
    </div>
  );
}
