import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmation } from "./confirmation";

export const metadata: Metadata = { title: "Comanda ta", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-muted">Se încarcă…</div>}>
      <Confirmation />
    </Suspense>
  );
}
