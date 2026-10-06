export type Category = { slug: string; name: string; description: string };

export type Product = {
  slug: string;
  name: string;
  category: string;
  priceBani: number;
  compareAtBani?: number;
  short: string;
  description: string;
  details: string[];
  image: string;
  stock: number;
  featured?: boolean;
};

export const categories: Category[] = [
  { slug: "bucatarie", name: "Bucătărie", description: "Ustensile și accesorii care fac gătitul mai simplu." },
  { slug: "decoratiuni", name: "Decorațiuni", description: "Detalii care schimbă atmosfera unei camere." },
  { slug: "organizare", name: "Organizare", description: "Soluții pentru o casă ordonată, fără efort." },
  { slug: "textile", name: "Textile", description: "Pleduri, perne și prosoape moi, de calitate." },
];

// Produse demonstrative — se înlocuiesc cu produsele reale (nume, prețuri, poze, stoc).
export const products: Product[] = [
  {
    slug: "set-ustensile-silicon-bambus",
    name: "Set ustensile silicon și bambus (6 piese)",
    category: "bucatarie",
    priceBani: 8990,
    compareAtBani: 11990,
    short: "Nu zgârie tigăile, rezistă la 230°C.",
    description: "Set complet de ustensile din silicon alimentar cu mânere din bambus, potrivit pentru tigăi antiaderente.",
    details: ["6 piese + suport", "Silicon alimentar fără BPA", "Rezistent până la 230°C", "Se spală în mașina de vase"],
    image: "/produse/set-ustensile-silicon-bambus.svg",
    stock: 40,
    featured: true,
  },
  {
    slug: "tocator-bambus-cu-canal",
    name: "Tocător din bambus cu canal pentru suc",
    category: "bucatarie",
    priceBani: 5490,
    short: "Robust, igienic, ușor de întreținut.",
    description: "Tocător mare din bambus natural, cu canal pe margine care oprește scurgerea sucurilor.",
    details: ["45 × 30 cm", "Bambus natural", "Canal pentru suc", "Mânere laterale"],
    image: "/produse/tocator-bambus-cu-canal.svg",
    stock: 25,
  },
  {
    slug: "set-recipiente-sticla-ermetice",
    name: "Set 5 recipiente din sticlă cu capac ermetic",
    category: "bucatarie",
    priceBani: 12990,
    compareAtBani: 15990,
    short: "Pentru cuptor, microunde și congelator.",
    description: "Recipiente din sticlă borosilicată cu capace ermetice, ideale pentru meal-prep și păstrarea alimentelor.",
    details: ["5 mărimi", "Sticlă borosilicată", "Capace cu 4 cleme", "Fără BPA"],
    image: "/produse/set-recipiente-sticla-ermetice.svg",
    stock: 30,
    featured: true,
  },
  {
    slug: "lumanare-parfumata-vanilie",
    name: "Lumânare parfumată Vanilie & Lemn de santal",
    category: "decoratiuni",
    priceBani: 6990,
    short: "Ceară de soia, ardere 45 de ore.",
    description: "Lumânare din ceară de soia naturală, cu fitil din bumbac și parfum cald de vanilie și santal.",
    details: ["Ardere ~45 ore", "Ceară de soia", "Fitil din bumbac", "Borcan din sticlă reutilizabil"],
    image: "/produse/lumanare-parfumata-vanilie.svg",
    stock: 60,
    featured: true,
  },
  {
    slug: "vaza-ceramica-minimalista",
    name: "Vază din ceramică, model minimalist",
    category: "decoratiuni",
    priceBani: 7990,
    short: "Finisaj mat, lucrată manual.",
    description: "Vază din ceramică cu finisaj mat, potrivită pentru flori uscate sau proaspete.",
    details: ["Înălțime 25 cm", "Ceramică", "Finisaj mat", "Etanșă"],
    image: "/produse/vaza-ceramica-minimalista.svg",
    stock: 15,
  },
  {
    slug: "instalatie-luminoasa-led-10m",
    name: "Instalație luminoasă LED alb cald, 10 m",
    category: "decoratiuni",
    priceBani: 4990,
    compareAtBani: 6490,
    short: "100 LED-uri, 8 moduri, cu telecomandă.",
    description: "Instalație LED cu lumină caldă, pentru interior, cu 8 moduri de iluminare și temporizator.",
    details: ["10 m, 100 LED-uri", "Alimentare USB", "Telecomandă inclusă", "Temporizator 6h"],
    image: "/produse/instalatie-luminoasa-led-10m.svg",
    stock: 80,
    featured: true,
  },
  {
    slug: "organizator-sertar-bambus",
    name: "Organizator extensibil pentru sertar, bambus",
    category: "organizare",
    priceBani: 6490,
    short: "Se adaptează sertarelor între 33 și 53 cm.",
    description: "Organizator extensibil pentru tacâmuri și ustensile, din bambus, cu 7 compartimente.",
    details: ["Extensibil 33–53 cm", "7 compartimente", "Bambus", "Picioare antiderapante"],
    image: "/produse/organizator-sertar-bambus.svg",
    stock: 35,
  },
  {
    slug: "set-cutii-depozitare-pliabile",
    name: "Set 3 cutii de depozitare pliabile",
    category: "organizare",
    priceBani: 7490,
    short: "Material textil rezistent, cu mânere.",
    description: "Cutii pliabile pentru dulap sau rafturi, din material textil rezistent, cu mânere pentru transport.",
    details: ["3 bucăți", "33 × 33 × 33 cm", "Pliabile", "Mânere laterale"],
    image: "/produse/set-cutii-depozitare-pliabile.svg",
    stock: 50,
  },
  {
    slug: "suport-condimente-rotativ",
    name: "Suport rotativ pentru condimente, 16 borcane",
    category: "organizare",
    priceBani: 9990,
    compareAtBani: 12990,
    short: "Borcane din sticlă și etichete incluse.",
    description: "Suport rotativ cu 16 borcane din sticlă, capace cu dozator și etichete pentru condimente.",
    details: ["16 borcane incluse", "Rotire 360°", "Etichete incluse", "Ocupă puțin spațiu"],
    image: "/produse/suport-condimente-rotativ.svg",
    stock: 20,
  },
  {
    slug: "pled-tricotat-gros",
    name: "Pled tricotat gros, 130 × 170 cm",
    category: "textile",
    priceBani: 14990,
    compareAtBani: 18990,
    short: "Moale și cald, ideal pentru serile de toamnă.",
    description: "Pled tricotat cu fir gros, foarte moale, perfect pentru canapea sau pat.",
    details: ["130 × 170 cm", "Fir acrilic moale", "Se spală la 30°C", "Disponibil în crem"],
    image: "/produse/pled-tricotat-gros.svg",
    stock: 18,
    featured: true,
  },
  {
    slug: "set-prosoape-bumbac-egiptean",
    name: "Set 4 prosoape din bumbac egiptean",
    category: "textile",
    priceBani: 11990,
    short: "Absorbante și pufoase, 600 g/m².",
    description: "Set de prosoape din bumbac egiptean 100%, cu densitate 600 g/m², pentru baie.",
    details: ["2 × 70×140 cm, 2 × 50×90 cm", "Bumbac egiptean 100%", "600 g/m²", "Se spală la 60°C"],
    image: "/produse/set-prosoape-bumbac-egiptean.svg",
    stock: 22,
  },
  {
    slug: "fete-perna-catifea-set-2",
    name: "Set 2 fețe de pernă din catifea",
    category: "textile",
    priceBani: 5990,
    short: "Catifea moale, fermoar ascuns.",
    description: "Fețe de pernă decorative din catifea, cu fermoar ascuns, pentru perne de 45 × 45 cm.",
    details: ["45 × 45 cm", "Catifea", "Fermoar ascuns", "2 bucăți"],
    image: "/produse/fete-perna-catifea-set-2.svg",
    stock: 0,
  },
];

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
