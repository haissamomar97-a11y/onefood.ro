import type { Metadata } from "next";
import { cardPaymentsEnabled } from "@/lib/netopia";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Finalizează comanda", robots: { index: false } };

// dinamic: metoda de plată cu cardul apare imediat ce cheile NETOPIA sunt setate
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return <CheckoutForm cardEnabled={cardPaymentsEnabled()} />;
}
