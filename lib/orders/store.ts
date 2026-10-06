import { FileOrderStore } from "./file-store";
import { PostgresOrderStore } from "./postgres-store";
import type { OrderStore } from "./types";

let store: OrderStore | null | undefined;

/**
 * Alege unde se salvează comenzile. În producție FĂRĂ bază de date întoarce null,
 * iar API-ul refuză comanda — mai bine un mesaj de eroare decât o comandă pierdută
 * (pe Vercel fișierele locale se șterg).
 */
export function getOrderStore(): OrderStore | null {
  if (store !== undefined) return store;
  if (process.env.DATABASE_URL) store = new PostgresOrderStore(process.env.DATABASE_URL);
  else if (process.env.NODE_ENV !== "production" || process.env.ALLOW_FILE_ORDER_STORE === "1") store = new FileOrderStore();
  else store = null;
  return store;
}
