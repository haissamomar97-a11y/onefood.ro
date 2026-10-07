import { formatLei } from "@/lib/money";

export function Price({ bani, from, large }: { bani: number; from?: boolean; large?: boolean }) {
  return (
    <span className={`font-bold text-pine-700 ${large ? "text-3xl" : "text-base sm:text-lg"}`}>
      {from && <span className="mr-1 text-xs font-medium text-muted sm:text-sm">de la</span>}
      {formatLei(bani)}
    </span>
  );
}
