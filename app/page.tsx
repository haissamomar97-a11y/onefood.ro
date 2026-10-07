import Link from "next/link";
import { IconCard, IconCash, IconReturn, IconShield, IconTruck } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { formatLei } from "@/lib/money";
import { JsonLd } from "@/lib/jsonld";
import { FILTERS, minPrice, products } from "@/lib/products";
import { site } from "@/lib/site";

const faq = [
  { q: "Cum plătesc comanda?", a: "Online cu cardul, prin NETOPIA Payments (plată securizată 3-D Secure), sau ramburs — cash ori card la curier." },
  { q: "În cât timp primesc bradul?", a: `Livrăm cu ${site.shipping.carrier} în ${site.shipping.deliveryDays}, oriunde în România.` },
  { q: "Cât costă livrarea?", a: `Livrarea costă ${formatLei(site.shipping.costBani)} și este gratuită pentru comenzile de peste ${formatLei(site.shipping.freeFromBani)}.` },
  { q: "Ce diferență e între PVC și PE 3D?", a: "Acele PE 3D sunt turnate după ramuri reale și arată ca un brad natural. Acele PVC sunt mai moi și mai dese, la un preț mai mic. Mulți brazi combină ambele materiale." },
  { q: "Pot returna bradul?", a: "Da. Ai 14 zile de la primire să îl returnezi, fără să dai vreo explicație." },
];

const shortcuts = [
  { href: "/categorie/brazi", label: "Toți brazii", sub: `${products.length} modele` },
  ...FILTERS.filter((f) => products.some((p) => p.tags.includes(f.id))).slice(0, 5).map((f) => ({
    href: `/categorie/brazi?tip=${f.id}`,
    label: f.label,
    sub: `de la ${formatLei(Math.min(...products.filter((p) => p.tags.includes(f.id)).map(minPrice)))}`,
  })),
];

export default function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const cheapest = Math.min(...products.map(minPrice));
  return (
    <>
      <section className="snow relative overflow-hidden bg-pine-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#17553f_0%,transparent_60%)]" aria-hidden />
        <div className="container-page relative grid items-center gap-8 py-12 sm:py-20 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-300 uppercase backdrop-blur">Colecția de Crăciun {new Date().getFullYear()}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-bold sm:text-6xl">
              Bradul perfect,<br /><span className="text-gold-300">livrat acasă.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/80">
              Brazi artificiali realiști, de la {formatLei(cheapest)}. Verzi sau ninși, simpli sau gata decorați — arată impecabil an de an.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/categorie/brazi" className="btn-primary px-7">Alege bradul</Link>
              <Link href="#populare" className="btn border border-white/25 text-white hover:bg-white/10">Cei mai iubiți</Link>
            </div>
          </div>
          <div aria-hidden className="relative mx-auto hidden aspect-square w-full max-w-sm md:block">
            <div className="absolute inset-6 rounded-full bg-gold-500/15 blur-2xl" />
            <svg viewBox="0 0 200 220" className="relative drop-shadow-2xl">
              <path d="M100 10 40 90h22L28 140h26L14 195h172l-40-55h26l-34-50h22Z" fill="#1f6b4a" />
              <path d="M100 10 160 90h-22l34 50h-26l40 55H100Z" fill="#134a33" opacity=".6" />
              {[[70, 120], [125, 105], [95, 160], [55, 175], [145, 170], [110, 75]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="6" fill={i % 2 ? "#c8a24a" : "#c0322b"} />
              ))}
              <rect x="90" y="195" width="20" height="20" fill="#6b4a2e" />
              <path d="m100 0 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#e3c97f" />
            </svg>
          </div>
        </div>
      </section>

      <section aria-label="Avantaje" className="container-page -mt-6 relative">
        <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible">
          {[
            [IconTruck, `Livrare ${site.shipping.carrier}`, site.shipping.deliveryDays],
            [IconCard, "Plată cu cardul", "securizată NETOPIA"],
            [IconCash, "Sau ramburs", "plătești la livrare"],
            [IconReturn, "Retur 14 zile", "fără întrebări"],
          ].map(([Icon, title, sub]) => {
            const I = Icon as typeof IconTruck;
            return (
              <li key={title as string} className="flex min-w-56 items-center gap-3 rounded-3xl bg-white p-4 shadow-md ring-1 ring-black/5 sm:min-w-0">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-pine-50 text-pine-700"><I /></span>
                <span className="text-sm"><b className="block">{title as string}</b><span className="text-muted">{sub as string}</span></span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="container-page py-10">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Ce fel de brad cauți?</h2>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
          {shortcuts.map((s) => (
            <Link key={s.href} href={s.href} className="min-w-36 rounded-3xl bg-white p-4 ring-1 ring-black/5 transition hover:ring-pine-600 sm:min-w-0">
              <b className="block">{s.label}</b>
              <span className="text-sm text-muted">{s.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="populare" className="container-page scroll-mt-24 py-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Cei mai iubiți</h2>
          <Link href="/categorie/brazi" className="text-sm font-semibold text-berry-500">Vezi toți →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 rounded-[2rem] bg-pine-700 p-6 text-white sm:grid-cols-[auto_1fr] sm:items-center sm:p-10">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-gold-300"><IconShield className="size-8" /></span>
          <div>
            <h2 className="font-display text-2xl font-bold">Cumpără liniștit</h2>
            <p className="mt-1 text-white/80">
              Plata cu cardul se face pe pagina securizată NETOPIA — noi nu vedem datele cardului. Dacă bradul nu e cum te așteptai, îl returnezi în 14 zile.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Întrebări frecvente</h2>
        <div className="mt-4 divide-y divide-black/5 overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
          {faq.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}<span aria-hidden className="text-xl text-muted transition group-open:rotate-45">+</span>
              </summary>
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
