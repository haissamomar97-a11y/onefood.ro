// Limitare simplă pe instanță (fereastră fixă). Protejează împotriva spam-ului de comenzi.
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const entry = hits.get(key);
  if (!entry || entry.reset <= now) {
    if (hits.size > 10_000) hits.clear();
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}
