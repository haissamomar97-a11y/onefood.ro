"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { OrderSummary } from "@/components/order-summary";
import { counties } from "@/lib/counties";
import { formatLei } from "@/lib/money";
import { priceCart } from "@/lib/pricing";

type Errors = Record<string, string>;

const IDEM_KEY = "mc-checkout-key";
export const LAST_ORDER_KEY = "mc-last-order";

// Aceeași cheie la reîncercări => serverul nu creează comenzi duble (dublu-click, rețea slabă).
function idempotencyKey(): string {
  try {
    const existing = sessionStorage.getItem(IDEM_KEY);
    if (existing) return existing;
    const k = crypto.randomUUID();
    sessionStorage.setItem(IDEM_KEY, k);
    return k;
  } catch {
    return crypto.randomUUID();
  }
}

export function CheckoutForm() {
  const { items, ready, clear } = useCart();
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const totals = priceCart(items);

  if (!ready) return <div className="container-page py-16 text-center text-muted">Se încarcă…</div>;
  if (totals.lines.length === 0 && !submitting) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Coșul tău este gol</h1>
        <Link href="/produse" className="btn-primary mt-6">Vezi produsele</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "");
    setSubmitting(true);
    setFormError("");
    setErrors({});
    try {
      const res = await fetch("/api/comenzi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey(),
          customer: {
            name: get("name"),
            phone: get("phone"),
            email: get("email"),
            county: get("county"),
            city: get("city"),
            address: get("address"),
            postalCode: get("postalCode"),
            notes: get("notes"),
          },
          items: totals.lines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
          paymentMethod: "ramburs",
          acceptTerms: fd.get("acceptTerms") === "on",
          website: get("website"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fe: Errors = {};
        for (const [k, v] of Object.entries((data.fieldErrors ?? {}) as Errors)) fe[k.replace(/^customer\./, "")] = v;
        setErrors(fe);
        setFormError(data.error ?? "A apărut o eroare. Încearcă din nou.");
        const first = Object.keys(fe)[0];
        if (first) document.getElementsByName(first)[0]?.focus();
        else window.scrollTo({ top: 0, behavior: "smooth" });
        setSubmitting(false);
        return;
      }
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(data));
        sessionStorage.removeItem(IDEM_KEY);
      } catch {}
      router.replace(`/comanda/confirmare`);
      clear();
    } catch {
      setFormError("Nu ne-am putut conecta. Verifică internetul și apasă din nou — comanda nu va fi dublată.");
      setSubmitting(false);
    }
  }

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input id={name} name={name} className="field" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} {...props} />
      {errors[name] && <p id={`${name}-err`} className="mt-1 text-sm text-red-700">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">Finalizează comanda</h1>
      {formError && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{formError}</div>
      )}
      <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <fieldset className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4">
            <legend className="px-1 text-lg font-semibold">Date de contact</legend>
            {field("name", "Nume și prenume", { autoComplete: "name", required: true })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("phone", "Telefon", { type: "tel", inputMode: "tel", autoComplete: "tel", required: true, placeholder: "07xx xxx xxx" })}
              {field("email", "Email", { type: "email", inputMode: "email", autoComplete: "email", required: true })}
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4">
            <legend className="px-1 text-lg font-semibold">Adresa de livrare</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="county" className="text-sm font-medium">Județ</label>
                <select id="county" name="county" className="field" autoComplete="address-level1" defaultValue="" required aria-invalid={!!errors.county}>
                  <option value="" disabled>Alege județul</option>
                  {counties.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.county && <p className="mt-1 text-sm text-red-700">{errors.county}</p>}
              </div>
              {field("city", "Localitate", { autoComplete: "address-level2", required: true })}
            </div>
            {field("address", "Stradă, număr, bloc, scară, apartament", { autoComplete: "street-address", required: true })}
            {field("postalCode", "Cod poștal (opțional)", { inputMode: "numeric", autoComplete: "postal-code", maxLength: 6 })}
            <div>
              <label htmlFor="notes" className="text-sm font-medium">Observații pentru curier (opțional)</label>
              <textarea id="notes" name="notes" rows={2} maxLength={500} className="field py-2" />
            </div>
            {/* capcană pentru boți */}
            <div aria-hidden className="absolute -left-[9999px]">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-stone-200 bg-white p-4">
            <legend className="px-1 text-lg font-semibold">Metoda de plată</legend>
            <label className="flex items-center gap-3 rounded-xl border-2 border-brand-500 bg-brand-50 p-3">
              <input type="radio" name="payment" value="ramburs" defaultChecked className="size-5 accent-brand-600" />
              <span><b>Plata la livrare (ramburs)</b><br /><span className="text-sm text-muted">Cash sau card, direct la curier.</span></span>
            </label>
          </fieldset>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-stone-200 bg-white p-4 md:sticky md:top-24">
          <h2 className="text-lg font-semibold">Comanda ta</h2>
          <ul className="space-y-2 text-sm">
            {totals.lines.map((l) => (
              <li key={l.product.slug} className="flex justify-between gap-2">
                <span>{l.product.name} <span className="text-muted">× {l.qty}</span></span>
                <span className="shrink-0">{formatLei(l.lineTotalBani)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary totals={totals} />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="acceptTerms" className="mt-0.5 size-5 shrink-0 accent-brand-600" aria-invalid={!!errors.acceptTerms} />
            <span>
              Am citit și sunt de acord cu <Link href="/termeni-si-conditii" target="_blank" className="underline">termenii și condițiile</Link> și{" "}
              <Link href="/confidentialitate" target="_blank" className="underline">politica de confidențialitate</Link>.
            </span>
          </label>
          {errors.acceptTerms && <p className="text-sm text-red-700">{errors.acceptTerms}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Se trimite comanda…" : `Trimite comanda · ${formatLei(totals.totalBani)}`}
          </button>
          <p className="text-center text-xs text-muted">Comanda cu obligație de plată. Plătești doar la primirea coletului.</p>
        </aside>
      </form>
    </div>
  );
}
