import { describe, expect, it } from "vitest";
import { priceCart, shippingFor } from "@/lib/pricing";
import { products, resolveSku, skuOf } from "@/lib/products";
import { site } from "@/lib/site";

describe("catalog", () => {
  it("are toate produsele din Excel, cu SKU-uri unice", () => {
    const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
    expect(skus).toHaveLength(57);
    expect(new Set(skus).size).toBe(57);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it("rezolvă SKU-urile din coș", () => {
    const p = products[0];
    const v = p.variants[1];
    expect(resolveSku(skuOf(p, v))).toEqual({ product: p, variant: v });
    expect(resolveSku("nu-exista~180")).toBeUndefined();
    expect(resolveSku(`${p.slug}~999`)).toBeUndefined();
  });
});

describe("prețuri", () => {
  it("adaugă livrarea sub prag și o anulează peste prag", () => {
    expect(shippingFor(0)).toBe(0);
    expect(shippingFor(site.shipping.freeFromBani - 1)).toBe(site.shipping.costBani);
    expect(shippingFor(site.shipping.freeFromBani)).toBe(0);
  });

  it("calculează totalul din catalog (Lidia 150 cm = 149 lei)", () => {
    const t = priceCart([{ sku: "brad-artificial-lidia-varfuri-albe~150", qty: 1 }]);
    expect(t.subtotalBani).toBe(14900);
    expect(t.totalBani).toBe(14900 + site.shipping.costBani);
  });

  it("ignoră produse inexistente, cantități invalide și peste stoc", () => {
    const t = priceCart([
      { sku: "nu-exista~150", qty: 1 },
      { sku: "brad-artificial-lidia-varfuri-albe~150", qty: -3 },
      { sku: "brad-artificial-lidia-varfuri-albe~150", qty: 9 }, // stoc 5
    ]);
    expect(t.lines).toHaveLength(1);
    expect(t.lines[0].qty).toBe(5);
  });
});
