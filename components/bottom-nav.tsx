"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartBadge } from "./cart-badge";
import { IconBag, IconGrid, IconHome, IconPhone, IconSearch } from "./icons";

const tabs = [
  { href: "/", label: "Acasă", Icon: IconHome, match: (p: string) => p === "/" },
  { href: "/produse", label: "Produse", Icon: IconGrid, match: (p: string) => p.startsWith("/produse") || p.startsWith("/categorie") },
  { href: "/cautare", label: "Caută", Icon: IconSearch, match: (p: string) => p.startsWith("/cautare") },
  { href: "/cos", label: "Coș", Icon: IconBag, match: (p: string) => p.startsWith("/cos") },
  { href: "/contact", label: "Contact", Icon: IconPhone, match: (p: string) => p.startsWith("/contact") },
];

// Bară de navigare tip aplicație, doar pe telefon. Ascunsă unde pagina are propriul buton fix (produs, comandă).
export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/produs/") || path.startsWith("/comanda") || path.startsWith("/admin")) return null;
  return (
    <nav aria-label="Navigare principală" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(path);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? "text-berry-500" : "text-muted"}`}>
                <span className="relative">
                  <Icon className="size-6" />
                  {href === "/cos" && <CartBadge />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Spațiu sub conținut, ca bara de jos să nu-l acopere. */
export function BottomNavSpacer() {
  const path = usePathname();
  if (path.startsWith("/produs/") || path.startsWith("/comanda") || path.startsWith("/admin")) return null;
  return <div aria-hidden className="h-20 md:hidden" />;
}
