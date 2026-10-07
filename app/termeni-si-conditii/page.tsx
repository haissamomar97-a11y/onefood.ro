import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Termeni și condiții", alternates: { canonical: "/termeni-si-conditii" } };

export default function Page() {
  const c = site.company;
  return (
    <LegalPage title="Termeni și condiții">
      <h2>1. Cine suntem</h2>
      <p>Site-ul {site.url} este operat de {c.legalName}, CUI {c.cui}, nr. Reg. Com. {c.regCom}, cu sediul în {c.address}. Contact: {site.email}.</p>
      <h2>2. Comenzi</h2>
      <p>Prin trimiterea unei comenzi accepți acești termeni. Comanda este confirmată după ce te contactăm telefonic sau prin email. Ne rezervăm dreptul de a anula comenzile în caz de stoc insuficient sau date incomplete, cu informarea ta.</p>
      <h2>3. Prețuri și plată</h2>
      <p>Prețurile sunt exprimate în lei și includ TVA. Plata se face online cu cardul (prin NETOPIA Payments) sau la livrare (ramburs). Costul livrării este afișat înainte de trimiterea comenzii.</p>
      <h2>4. Livrare și retur</h2>
      <p>Condițiile de livrare și dreptul de retragere sunt descrise în pagina „Livrare și retur”.</p>
      <h2>5. Garanție</h2>
      <p>Produsele beneficiază de garanția legală de conformitate, conform legislației în vigoare.</p>
      <h2>6. Litigii</h2>
      <p>Eventualele neînțelegeri se rezolvă pe cale amiabilă. Poți apela și la ANPC sau la platforma europeană SOL (link-urile sunt în subsolul site-ului).</p>
    </LegalPage>
  );
}
