import type { Metadata } from "next";
import { Confirmation } from "./confirmation";

export const metadata: Metadata = { title: "Comanda a fost trimisă", robots: { index: false } };

export default function ConfirmationPage() {
  return <Confirmation />;
}
