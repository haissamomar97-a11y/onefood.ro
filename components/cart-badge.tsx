"use client";

import { useCart } from "./cart-provider";

export function CartBadge() {
  const { count, ready } = useCart();
  if (!ready || count === 0) return null;
  return (
    <span key={count} data-testid="cart-count" className="animate-pop absolute -top-1.5 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-berry-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
      {count}
    </span>
  );
}
