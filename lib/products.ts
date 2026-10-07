import { importedProducts } from "./catalog.generated";

export type Category = { slug: string; name: string; short: string; description: string };

export type Variant = {
  id: string;
  sku: string;
  label: string;
  heightCm?: number;
  priceBani: number;
  stock: number;
  widthCm?: number | null;
  weightKg?: number | null;
  package?: string | null;
};

export type ImportedProduct = {
  slug: string;
  name: string;
  category: string;
  material: string;
  snow: boolean;
  tags: string[];
  featured: boolean;
  description: string;
  variantLabel?: string;
  variants: Variant[];
};

export type Product = ImportedProduct & { short: string; image: string };

const allCategories: Category[] = [
  {
    slug: "brazi",
    name: "Brazi de Crăciun artificiali",
    short: "Brazi",
    description: "Brazi artificiali realiști, de la brăduți de masă la brazi impresionanți de 2,3 m. Ace PE 3D sau PVC, verzi sau ninși, simpli sau gata decorați.",
  },
  { slug: "ghirlande", name: "Ghirlande", short: "Ghirlande", description: "Ghirlande pentru scări, șemineu, uși și ferestre." },
  { slug: "globuri", name: "Globuri", short: "Globuri", description: "Globuri și decorațiuni pentru brad." },
];

/** Filtre rapide în listă. */
export const FILTERS = [
  { id: "nins", label: "Ninși" },
  { id: "premium", label: "Ace PE 3D realiste" },
  { id: "decorat", label: "Gata decorați" },
  { id: "buturuga", label: "Pe buturugă" },
  { id: "slim", label: "Slim" },
  { id: "mini", label: "Mini / de masă" },
] as const;

const MATERIAL_SHORT: Record<string, string> = { "PE 3D": "Ace PE 3D realiste", PVC: "Ace PVC dese", "PVC + PE": "Ace PE 3D + PVC" };

function enrich(p: ImportedProduct): Product {
  const hs = p.variants.map((v) => v.heightCm).filter((h): h is number => !!h);
  const range = hs.length ? (Math.min(...hs) === Math.max(...hs) ? `${hs[0]} cm` : `${Math.min(...hs)}–${Math.max(...hs)} cm`) : "";
  const short = [MATERIAL_SHORT[p.material] ?? p.material, p.snow ? "nins" : null, range].filter(Boolean).join(" · ");
  return { ...p, short, image: `/produse/${p.slug}.svg` };
}

export const products: Product[] = importedProducts.map(enrich);

/** Doar categoriile care au produse. */
export const categories: Category[] = allCategories.filter((c) => products.some((p) => p.category === c.slug));

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function productsInCategory(slug: string): Product[] {
  return products.filter((p) => p.category === slug);
}

/** SKU = „slug~varianta” (stabil în coș chiar dacă se schimbă codul intern). */
export function skuOf(product: Product, variant: Variant): string {
  return `${product.slug}~${variant.id}`;
}

export function resolveSku(sku: string): { product: Product; variant: Variant } | undefined {
  const [slug, vid] = sku.split("~");
  const product = bySlug.get(slug);
  const variant = vid ? product?.variants.find((v) => v.id === vid) : product?.variants.length === 1 ? product.variants[0] : undefined;
  return product && variant ? { product, variant } : undefined;
}

export const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.priceBani));
export const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);
export const hasManyVariants = (p: Product) => p.variants.length > 1;
/** Varianta afișată implicit: 180 cm dacă există și e în stoc, altfel prima disponibilă. */
export function defaultVariant(p: Product): Variant {
  const inStock = p.variants.filter((v) => v.stock > 0);
  return inStock.find((v) => v.heightCm === 180) ?? inStock[0] ?? p.variants[0];
}
