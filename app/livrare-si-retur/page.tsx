import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Livrare și retur", alternates: { canonical: "/livrare-si-retur" } };

export default function Page() {
  return (
    <LegalPage title="Livrare și retur">
      <h2>Livrare</h2>
      <p>Livrăm prin curier în toată România, în {site.shipping.deliveryDays} de la confirmarea comenzii.</p>
      <ul>
        <li>Cost livrare: 19,99 lei.</li>
        <li>Livrare gratuită pentru comenzile de peste 250 lei.</li>
        <li>Plata se face la livrare (ramburs), cash sau cu cardul la curier.</li>
      </ul>
      <h2>Dreptul de retragere (retur în 14 zile)</h2>
      <p>
        Conform OUG 34/2014, ai dreptul să te retragi din contract în termen de 14 zile de la primirea produselor, fără a
        preciza motivul. Pentru retur, scrie-ne la {site.email} cu numărul comenzii. Returnăm banii în cel mult 14 zile de
        la primirea notificării, prin transfer bancar.
      </p>
      <p>Produsele trebuie returnate în starea în care au fost primite. Costul transportului pentru retur este suportat de client.</p>
    </LegalPage>
  );
}
