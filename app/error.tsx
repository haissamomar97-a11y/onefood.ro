"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Ceva n-a mers bine</h1>
      <p className="mt-2 text-muted">Coșul tău este în siguranță. Încearcă din nou.</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">Reîncearcă</button>
    </div>
  );
}
