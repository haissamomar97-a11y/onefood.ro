import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Pagina nu există</h1>
      <p className="mt-2 text-muted">Poate produsul a fost mutat. Încearcă din catalog.</p>
      <Link href="/produse" className="btn-primary mt-6">Vezi produsele</Link>
    </div>
  );
}
