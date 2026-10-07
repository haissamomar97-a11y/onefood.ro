import Image from "next/image";

export function ProductImage({ src, alt, priority, sizes, className = "" }: { src: string; alt: string; priority?: boolean; sizes: string; className?: string }) {
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={src.endsWith(".svg")} className={`object-cover ${className}`} />;
}
