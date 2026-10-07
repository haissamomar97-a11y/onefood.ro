import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { CartBadge } from "./cart-badge";
import { IconBag, IconSearch } from "./icons";
import { Logo } from "./logo";

function daysUntil(iso: string) {
  return Math.ceil((new Date(`${iso}T23:59:59+02:00`).getTime() - Date.now()) / 86_400_000);
}

export function Header() {
  const cutoff = site.shipping.christmasCutoff;
  const d = daysUntil(cutoff);
  const promo =
    d > 0 && d <= 60
      ? `🎄 Comandă până pe ${new Date(cutoff).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })} pentru livrare înainte de Crăciun`
      : `🚚 Livrare gratuită cu ${site.shipping.carrier} la comenzi peste ${site.shipping.freeFromBani / 100} lei`;
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-cream/90 backdrop-blur-md">
      <div className="bg-pine-700 px-4 py-1.5 text-center text-xs font-medium text-gold-100 sm:text-sm">{promo}</div>
      <div className="container-page flex h-14 items-center justify-between gap-4 sm:h-16">
        <Logo />
        <nav aria-label="Categorii" className="hidden items-center gap-1 md:flex">
          <Link href="/produse" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-pine-50">Toate produsele</Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/categorie/${c.slug}`} className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-pine-50">{c.short}</Link>
          ))}
          <Link href="/contact" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-pine-50">Contact</Link>
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/cautare" aria-label="Caută" className="grid size-11 place-items-center rounded-xl hover:bg-pine-50"><IconSearch /></Link>
          <Link href="/cos" aria-label="Coșul de cumpărături" className="relative hidden size-11 place-items-center rounded-xl hover:bg-pine-50 md:grid">
            <span className="relative"><IconBag /><CartBadge /></span>
          </Link>
        </div>
      </div>
    </header>
  );
}
