"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="text-sm font-medium">Parolă</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.error && <p role="alert" className="text-sm text-berry-600">{state.error}</p>}
      <button className="btn-dark w-full" disabled={pending}>{pending ? "Se verifică…" : "Intră"}</button>
    </form>
  );
}
