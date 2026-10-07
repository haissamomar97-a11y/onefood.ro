import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Politica de confidențialitate", alternates: { canonical: "/confidentialitate" } };

export default function Page() {
  return (
    <LegalPage title="Politica de confidențialitate">
      <h2>Ce date colectăm</h2>
      <p>Pentru a livra comanda colectăm: nume, telefon, email și adresa de livrare. Nu colectăm și nu vedem datele cardului — acestea sunt introduse direct pe pagina securizată NETOPIA.</p>
      <h2>De ce le folosim</h2>
      <p>Datele sunt folosite exclusiv pentru procesarea și livrarea comenzii (temei legal: executarea contractului) și pentru obligațiile fiscale.</p>
      <h2>Cui le transmitem</h2>
      <p>Doar firmei de curierat ({site.shipping.carrier}) care livrează coletul, procesatorului de plăți NETOPIA Payments (pentru plățile cu cardul) și furnizorilor tehnici (găzduire, email), care le prelucrează în numele nostru. Dacă te abonezi la newsletter, adresa de email este transmisă furnizorului nostru de email marketing (Newsman).</p>
      <h2>Cât timp le păstrăm</h2>
      <p>Pe durata necesară procesării comenzii și apoi cât impune legislația fiscală.</p>
      <h2>Drepturile tale</h2>
      <p>Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție. Scrie-ne la {site.email}. Poți depune plângere la ANSPDCP (dataprotection.ro).</p>
      <h2>Cookie-uri</h2>
      <p>Site-ul nu folosește cookie-uri de urmărire. Coșul de cumpărături este salvat doar local, în browserul tău.</p>
    </LegalPage>
  );
}
