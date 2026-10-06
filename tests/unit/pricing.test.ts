import { describe, expect, it } from "vitest";
import { priceCart, shippingFor } from "@/lib/pricing";
import { site } from "@/lib/site";

describe("prețuri", () => {
  it("adaugă livrarea sub prag și o anulează peste prag", () => {
    expect(shippingFor(0)).toBe(0);
    expect(shippingFor(site.shipping.freeFromBani - 1)).toBe(site.shipping.costBani);
    expect(shippingFor(site.shipping.freeFromBani)).toBe(0);
  });

  it("calculează totalul din catalog, nu din client", () => {
    const t = priceCart([{ slug: "tocator-bambus-cu-canal", qty: 2 }]);
    expect(t.subtotalBani).toBe(5490 * 2);
    expect(t.totalBani).toBe(5490 * 2 + site.shipping.costBani);
  });

  it("ignoră produse inexistente, cantități invalide și produse fără stoc", () => {
    const t = priceCart([
      { slug: "nu-exista", qty: 1 },
      { slug: "tocator-bambus-cu-canal", qty: -3 },
      { slug: "fete-perna-catifea-set-2", qty: 1 },
    ]);
    expect(t.lines).toHaveLength(0);
    expect(t.totalBani).toBe(0);
  });
});
