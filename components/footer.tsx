import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 bg-pine-800 text-sm text-white/80">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="h-14 w-auto" />
          <p className="mt-3">{site.tagline}.</p>
          <p className="mt-3"><a className="text-gold-300 underline" href={`mailto:${site.email}`}>{site.email}</a></p>
        </div>
        <div>
          <p className="font-semibold text-white">Magazin</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-white" href="/produse">Toate produsele</Link></li>
            {categories.map((c) => (
              <li key={c.slug}><Link className="hover:text-white" href={`/categorie/${c.slug}`}>{c.short}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Informații</p>
          <ul className="mt-3 space-y-2">
            <li><Link className="hover:text-white" href="/livrare-si-retur">Livrare și retur</Link></li>
            <li><Link className="hover:text-white" href="/termeni-si-conditii">Termeni și condiții</Link></li>
            <li><Link className="hover:text-white" href="/confidentialitate">Politica de confidențialitate</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Protecția consumatorului</p>
          <ul className="mt-3 space-y-2">
            <li><a className="hover:text-white" href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer">ANPC – Soluționarea alternativă a litigiilor</a></li>
            <li><a className="hover:text-white" href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">Soluționarea online a litigiilor (SOL)</a></li>
          </ul>
          <p className="mt-4 text-xs">Plăți securizate prin NETOPIA Payments · Livrare {site.shipping.carrier}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {site.company.legalName} · CUI {site.company.cui} · {site.company.regCom}
      </div>
    </footer>
  );
}
