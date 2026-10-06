import { formatLei } from "@/lib/money";

export function Price({ bani, compareAt, large }: { bani: number; compareAt?: number; large?: boolean }) {
  return (
    <span className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold text-brand-700 ${large ? "text-3xl" : "text-lg"}`}>{formatLei(bani)}</span>
      {compareAt && compareAt > bani && (
        <>
          <s className="text-sm text-muted" aria-label={`Preț vechi ${formatLei(compareAt)}`}>{formatLei(compareAt)}</s>
          <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-xs font-semibold text-brand-700">
            -{Math.round((1 - bani / compareAt) * 100)}%
          </span>
        </>
      )}
    </span>
  );
}
