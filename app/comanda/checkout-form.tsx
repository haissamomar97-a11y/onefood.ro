"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { IconBack, IconCard, IconCash, IconShield } from "@/components/icons";
import { OrderSummary } from "@/components/order-summary";
import { counties } from "@/lib/counties";
import { formatLei } from "@/lib/money";
import { priceCart } from "@/lib/pricing";
import { LAST_ORDER_KEY } from "./keys";

type Errors = Record<string, string>;

const IDEM_KEY = "mc-checkout-key";

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

export function CheckoutForm({ cardEnabled }: { cardEnabled: boolean }) {
  const { items, ready, clear } = useCart();
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<"card" | "ramburs">(cardEnabled ? "card" : "ramburs");
  const totals = priceCart(items);

  if (!ready) return <div className="container-page py-16 text-center text-muted">Se încarcă…</div>;
  if (totals.lines.length === 0 && !submitting) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Coșul tău este gol</h1>
        <Link href="/categorie/brazi" className="btn-primary mt-6">Vezi brazii</Link>
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
          items: totals.lines.map((l) => ({ sku: l.sku, qty: l.qty })),
          paymentMethod: payment,
          acceptTerms: fd.get("acceptTerms") === "on",
          newsletter: fd.get("newsletter") === "on",
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
      clear();
      if (data.paymentURL) {
        window.location.assign(data.paymentURL); // pagina securizată NETOPIA
        return;
      }
      router.replace(`/comanda/confirmare?id=${encodeURIComponent(data.id)}`);
    } catch {
      setFormError("Nu ne-am putut conecta. Verifică internetul și apasă din nou — comanda nu va fi dublată.");
      setSubmitting(false);
    }
  }

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input id={name} name={name} className="field" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} {...props} />
      {errors[name] && <p id={`${name}-err`} className="mt-1 text-sm text-berry-600">{errors[name]}</p>}
    </div>
  );

  const payOption = (id: "card" | "ramburs", title: string, sub: string, Icon: typeof IconCard) => (
    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${payment === id ? "border-pine-700 bg-pine-50" : "border-black/10 bg-white"}`}>
      <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="size-5 accent-pine-700" />
      <Icon className="size-6 shrink-0 text-pine-700" />
      <span><b className="block">{title}</b><span className="text-sm text-muted">{sub}</span></span>
    </label>
  );

  return (
    <div className="container-page py-4 sm:py-8">
      <Link href="/cos" className="-ml-2 inline-flex items-center rounded-xl py-2 pr-3 pl-1 text-sm text-muted hover:bg-pine-50"><IconBack className="size-5" /> Înapoi la coș</Link>
      <h1 className="mt-1 font-display text-3xl font-bold">Finalizează comanda</h1>
      {formError && <div role="alert" className="mt-4 rounded-2xl border border-berry-500/30 bg-berry-500/10 p-3 text-berry-600">{formError}</div>}
      <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-6 md:grid-cols-[1fr_360px] md:gap-8">
        <div className="space-y-5">
          <fieldset className="space-y-4 rounded-3xl bg-white p-5 ring-1 ring-black/5">
            <legend className="float-left mb-1 font-display text-lg font-semibold">1. Date de contact</legend>
            <div className="clear-both" />
            {field("name", "Nume și prenume", { autoComplete: "name", required: true })}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("phone", "Telefon", { type: "tel", inputMode: "tel", autoComplete: "tel", required: true, placeholder: "07xx xxx xxx" })}
              {field("email", "Email", { type: "email", inputMode: "email", autoComplete: "email", required: true })}
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-3xl bg-white p-5 ring-1 ring-black/5">
            <legend className="float-left mb-1 font-display text-lg font-semibold">2. Adresa de livrare</legend>
            <div className="clear-both" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="county" className="text-sm font-medium">Județ</label>
                <select id="county" name="county" className="field" autoComplete="address-level1" defaultValue="" required aria-invalid={!!errors.county}>
                  <option value="" disabled>Alege județul</option>
                  {counties.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.county && <p className="mt-1 text-sm text-berry-600">{errors.county}</p>}
              </div>
              {field("city", "Localitate", { autoComplete: "address-level2", required: true })}
            </div>
            {field("address", "Stradă, număr, bloc, scară, apartament", { autoComplete: "street-address", required: true })}
            {field("postalCode", "Cod poștal (opțional)", { inputMode: "numeric", autoComplete: "postal-code", maxLength: 6 })}
            <div>
              <label htmlFor="notes" className="text-sm font-medium">Observații pentru curier (opțional)</label>
              <textarea id="notes" name="notes" rows={2} maxLength={500} className="field py-3" />
            </div>
            <div aria-hidden className="absolute -left-[9999px]">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
          </fieldset>

          <fieldset className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-black/5">
            <legend className="float-left mb-1 font-display text-lg font-semibold">3. Plata</legend>
            <div className="clear-both" />
            {cardEnabled && payOption("card", "Card online", "Visa, Mastercard — plată securizată NETOPIA", IconCard)}
            {payOption("ramburs", "Ramburs la livrare", "Plătești curierului, cash sau card", IconCash)}
          </fieldset>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl bg-white p-5 ring-1 ring-black/5 md:sticky md:top-28">
          <h2 className="font-display text-lg font-semibold">Comanda ta</h2>
          <ul className="space-y-2 text-sm">
            {totals.lines.map((l) => (
              <li key={l.sku} className="flex justify-between gap-2">
                <span>{l.product.name}{l.product.variants.length > 1 && <span className="text-muted"> · {l.variant.label}</span>} <span className="text-muted">× {l.qty}</span></span>
                <span className="shrink-0">{formatLei(l.lineTotalBani)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary totals={totals} />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="acceptTerms" className="mt-0.5 size-5 shrink-0 accent-pine-700" aria-invalid={!!errors.acceptTerms} />
            <span>
              Sunt de acord cu <Link href="/termeni-si-conditii" target="_blank" className="underline">termenii și condițiile</Link> și{" "}
              <Link href="/confidentialitate" target="_blank" className="underline">politica de confidențialitate</Link>.
            </span>
          </label>
          {errors.acceptTerms && <p className="text-sm text-berry-600">{errors.acceptTerms}</p>}
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" name="newsletter" className="mt-0.5 size-5 shrink-0 accent-pine-700" />
            <span>Vreau să primesc oferte și noutăți pe email (opțional).</span>
          </label>
          <button type="submit" className="btn-primary w-full text-base" disabled={submitting}>
            {submitting ? "Se trimite…" : payment === "card" ? `Plătește ${formatLei(totals.totalBani)}` : `Trimite comanda · ${formatLei(totals.totalBani)}`}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <IconShield className="size-4" /> {payment === "card" ? "Vei fi redirecționat pe pagina securizată NETOPIA." : "Comandă cu obligație de plată la livrare."}
          </p>
        </aside>
      </form>
    </div>
  );
}
