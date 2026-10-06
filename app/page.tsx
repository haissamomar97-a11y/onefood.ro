import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/products";
import { site } from "@/lib/site";
import { JsonLd } from "@/lib/jsonld";

const faq = [
  { q: "Cum plătesc comanda?", a: "Plătești la livrare, cash sau cu cardul la curier (ramburs). Nu ai nimic de plătit în avans." },
  { q: "În cât timp primesc coletul?", a: `Livrarea durează de obicei ${site.shipping.deliveryDays}, prin curier, oriunde în România.` },
  { q: "Cât costă livrarea?", a: "Livrarea costă 19,99 lei și este gratuită pentru comenzile de peste 250 lei." },
  { q: "Pot returna un produs?", a: "Da. Ai 14 zile de la primire să returnezi produsele, fără să dai vreo explicație." },
];

export default function Home() {
  const featured = products.filter((p) => p.featured);
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-12 sm:py-20">
          <p className="text-sm font-semibold tracking-wide text-sage uppercase">Colecția de toamnă</p>
          <h1 className="mt-2 max-w-2xl text-4xl leading-tight font-bold sm:text-5xl">Fă din casa ta locul preferat.</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">{site.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/produse" className="btn-primary">Vezi toate produsele</Link>
            <Link href="#categorii" className="btn-outline">Alege o categorie</Link>
          </div>
        </div>
      </section>

      <section aria-label="Avantaje" className="container-page grid grid-cols-2 gap-3 py-6 text-sm sm:grid-cols-4">
        {[
          ["🚚", "Livrare 1–3 zile", "în toată țara"],
          ["💵", "Plata la livrare", "cash sau card"],
          ["↩️", "Retur 14 zile", "fără întrebări"],
          ["🎁", "Transport gratuit", "peste 250 lei"],
        ].map(([icon, title, sub]) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
            <span aria-hidden className="text-2xl">{icon}</span>
            <span><b className="block">{title}</b><span className="text-muted">{sub}</span></span>
          </div>
        ))}
      </section>

      <section id="categorii" className="container-page py-8">
        <h2 className="text-2xl font-bold">Categorii</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/categorie/${c.slug}`} className="rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-brand-500">
              <b className="block text-lg">{c.name}</b>
              <span className="text-sm text-muted">{c.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Cele mai iubite</h2>
          <Link href="/produse" className="text-sm font-semibold text-brand-700 underline">Vezi tot</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
        </div>
      </section>

      <section className="container-page py-8">
        <h2 className="text-2xl font-bold">Întrebări frecvente</h2>
        <div className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {faq.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer list-none font-semibold">{f.q}<span aria-hidden className="float-right group-open:rotate-45 transition">+</span></summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      </section>
    </>
  );
}
