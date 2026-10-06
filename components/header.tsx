import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { CartLink } from "./cart-link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="bg-sage px-4 py-1.5 text-center text-xs font-medium text-white sm:text-sm">
        Livrare gratuită la comenzi peste 250 lei · Plata la livrare · Retur 14 zile
      </div>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-brand-700" aria-label={`${site.name} — pagina principală`}>
          ✦ {site.name}
        </Link>
        <nav aria-label="Categorii" className="hidden gap-1 md:flex">
          {categories.map((c) => (
            <Link key={c.slug} href={`/categorie/${c.slug}`} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-50">
              {c.name}
            </Link>
          ))}
        </nav>
        <CartLink />
      </div>
      <nav aria-label="Categorii (mobil)" className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        <Link href="/produse" className="shrink-0 rounded-full border border-stone-200 px-4 py-2 text-sm font-medium">Toate</Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/categorie/${c.slug}`} className="shrink-0 rounded-full border border-stone-200 px-4 py-2 text-sm font-medium">
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
