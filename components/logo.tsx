import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ className = "h-11 w-auto" }: { className?: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${site.name} — pagina principală`}>
      <Image src="/brand/logo.png" alt={site.name} width={400} height={132} priority className={className} />
    </Link>
  );
}
