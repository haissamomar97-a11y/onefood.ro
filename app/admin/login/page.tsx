import { redirect } from "next/navigation";
import { adminEnabled, isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="font-display text-2xl font-bold">Administrare comenzi</h1>
      {adminEnabled() ? <LoginForm /> : <p className="mt-4 text-muted">Panoul e dezactivat. Setează variabila ADMIN_PASSWORD (minim 12 caractere).</p>}
    </div>
  );
}
