import type { Metadata } from "next";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Finalizează comanda", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutForm />;
}
