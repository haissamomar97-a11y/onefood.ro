import { expect, test } from "@playwright/test";

test("pagina de produs are SEO complet", async ({ page }) => {
  await page.goto("/produs/pled-tricotat-gros");
  await expect(page).toHaveTitle("Pled tricotat gros, 130 × 170 cm | Magia Casei");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://magiacasei.ro/produs/pled-tricotat-gros");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const product = ld.map((s) => JSON.parse(s)).find((d) => d["@type"] === "Product");
  expect(product.offers).toMatchObject({ price: "149.90", priceCurrency: "RON", availability: "https://schema.org/InStock" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("sitemap, robots și antete de securitate", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://magiacasei.ro/produs/pled-tricotat-gros");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /comanda");
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("fără scroll orizontal pe telefon", async ({ page }, info) => {
  test.skip(info.project.name !== "telefon");
  for (const url of ["/", "/produse", "/produs/pled-tricotat-gros", "/cos", "/contact"]) {
    await page.goto(url);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, url).toBeLessThanOrEqual(0);
  }
});
