export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="container-page prose-legal max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Text-model. Trebuie verificat și completat cu datele firmei înainte de lansare.
      </p>
      {children}
    </article>
  );
}
