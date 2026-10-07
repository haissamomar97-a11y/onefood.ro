"use client";

export function QtyStepper({ value, max, onChange, label = "Cantitate", small }: { value: number; max: number; onChange: (n: number) => void; label?: string; small?: boolean }) {
  const h = small ? "h-10" : "h-12";
  return (
    <div className={`flex ${h} items-center rounded-2xl bg-white ring-1 ring-black/10`} role="group" aria-label={label}>
      <button type="button" className="h-full w-10 text-xl disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Scade cantitatea">−</button>
      <span className="w-7 text-center font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className="h-full w-10 text-xl disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Crește cantitatea">+</button>
    </div>
  );
}
