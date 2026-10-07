import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { formatLei } from "@/lib/money";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Livrare și retur", alternates: { canonical: "/livrare-si-retur" } };

export default function Page() {
  const s = site.shipping;
  return (
    <LegalPage title="Livrare și retur">
      <h2>Livrare</h2>
      <p>Livrăm prin curier {s.carrier} în toată România, în {s.deliveryDays} de la confirmarea comenzii.</p>
      <ul>
        <li>Cost livrare: {formatLei(s.costBani)}.</li>
        <li>Livrare gratuită pentru comenzile de peste {formatLei(s.freeFromBani)}.</li>
        <li>Pentru livrare înainte de Crăciun, plasează comanda până pe {new Date(s.christmasCutoff).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}.</li>
      </ul>
      <h2>Plata</h2>
      <ul>
        <li><b>Card online</b> — Visa sau Mastercard, prin NETOPIA Payments, cu autentificare 3-D Secure. Datele cardului sunt introduse doar pe pagina securizată NETOPIA; noi nu le vedem și nu le stocăm.</li>
        <li><b>Ramburs</b> — plătești curierului la livrare, cash sau card.</li>
      </ul>
      <h2>Dreptul de retragere (retur în 14 zile)</h2>
      <p>
        Conform OUG 34/2014, ai dreptul să te retragi din contract în termen de 14 zile de la primirea produselor, fără a
        preciza motivul. Pentru retur, scrie-ne la {site.email} cu numărul comenzii. Returnăm banii în cel mult 14 zile de
        la primirea notificării — pe card (pentru plățile online) sau prin transfer bancar (pentru ramburs).
      </p>
      <p>Produsele trebuie returnate complete, în ambalajul original, în starea în care au fost primite. Costul transportului pentru retur este suportat de client.</p>
    </LegalPage>
  );
}
