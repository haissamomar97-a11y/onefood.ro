import Link from "next/link";
import { site } from "@/lib/site";

// Logo provizoriu — se înlocuiește cu fișierul logo-ului real (public/logo.svg).
export function Logo({ light }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${site.name} — pagina principală`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <path d="M16 3 6 17h5l-6 8h22l-6-8h5Z" fill={light ? "#e3c97f" : "#0f3d2e"} />
        <rect x="14" y="25" width="4" height="4" rx="1" fill={light ? "#e3c97f" : "#a8832f"} />
        <circle cx="16" cy="3.5" r="2.2" fill="#c8a24a" />
      </svg>
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-pine-700"}`}>{site.name}</span>
    </Link>
  );
}
