import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-brand-50 text-sm">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-brand-700">✦ {site.name}</p>
          <p className="mt-2 text-muted">{site.tagline}.</p>
          <p className="mt-3">
            <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <div>
          <p className="font-semibold">Categorii</p>
          <ul className="mt-2 space-y-2">
            {categories.map((c) => (
              <li key={c.slug}><Link className="hover:underline" href={`/categorie/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Informații</p>
          <ul className="mt-2 space-y-2">
            <li><Link className="hover:underline" href="/livrare-si-retur">Livrare și retur</Link></li>
            <li><Link className="hover:underline" href="/termeni-si-conditii">Termeni și condiții</Link></li>
            <li><Link className="hover:underline" href="/confidentialitate">Politica de confidențialitate</Link></li>
            <li><Link className="hover:underline" href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Protecția consumatorului</p>
          <ul className="mt-2 space-y-2">
            <li><a className="hover:underline" href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer">ANPC – Soluționarea alternativă a litigiilor</a></li>
            <li><a className="hover:underline" href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">Soluționarea online a litigiilor (SOL)</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.company.legalName} · CUI {site.company.cui} · {site.company.regCom}
      </div>
    </footer>
  );
}
