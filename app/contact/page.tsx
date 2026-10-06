import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: `Contactează echipa ${site.name}.`, alternates: { canonical: "/contact" } };

export default function Page() {
  const c = site.company;
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-muted">Răspundem în aceeași zi lucrătoare.</p>
      <div className="mt-6 space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
        <p>📧 <a className="font-semibold underline" href={`mailto:${site.email}`}>{site.email}</a></p>
        <p>📞 <a className="font-semibold underline" href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a></p>
        <p className="text-sm text-muted">{c.legalName} · CUI {c.cui} · {c.regCom} · {c.address}</p>
      </div>
    </div>
  );
}
