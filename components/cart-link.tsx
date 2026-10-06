"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cos"
      className="relative inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 font-medium hover:bg-brand-50"
      aria-label={`Coșul de cumpărături, ${count} produse`}
    >
      <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span className="hidden sm:inline">Coș</span>
      {ready && count > 0 && (
        <span data-testid="cart-count" className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
