// Generează imagini provizorii (SVG) pentru produsele demo. Se înlocuiesc cu poze reale (.webp/.jpg).
import { writeFileSync } from "node:fs";
const palette = { bucatarie: ["#f4e8dc", "#b5643c"], decoratiuni: ["#efe6f2", "#8a5a96"], organizare: ["#e6efe6", "#6f8a6a"], textile: ["#f2ece2", "#a07a4a"] };
const icons = {
  bucatarie: '<path d="M200 120v160M180 120v50a20 20 0 0 0 40 0v-50M300 120c-25 0-35 40-35 80h35v80" stroke-width="14" fill="none" stroke-linecap="round"/>',
  decoratiuni: '<path d="M200 110c30 40 40 70 40 100a40 40 0 0 1-80 0c0-30 10-60 40-100Z" stroke-width="12" fill="none"/><path d="M150 300h100" stroke-width="12"/>',
  organizare: '<rect x="120" y="140" width="160" height="120" rx="12" stroke-width="12" fill="none"/><path d="M120 190h160M200 140v120" stroke-width="12"/>',
  textile: '<path d="M120 150h160v110H120Z" stroke-width="12" fill="none"/><path d="M120 180h160M120 210h160M120 240h160" stroke-width="6"/>',
};
const { products } = await import("../lib/products.ts");
for (const p of products) {
  const [bg, fg] = palette[p.category];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><g stroke="${fg}">${icons[p.category]}</g></svg>`;
  writeFileSync(`public/produse/${p.slug}.svg`, svg);
}
console.log(`${products.length} imagini generate`);
