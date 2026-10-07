import { expect, test } from "@playwright/test";

test("pagina de produs are SEO complet", async ({ page }) => {
  await page.goto("/produs/brad-artificial-kovalivska-vip-verde");
  await expect(page).toHaveTitle("Brad artificial Kovalivska VIP, verde | Magia Casei");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://magiacasei.ro/produs/brad-artificial-kovalivska-vip-verde");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /de la 529 lei/);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
  const group = ld.find((d) => d["@type"] === "ProductGroup");
  expect(group.hasVariant).toHaveLength(3);
  expect(group.hasVariant[1].offers).toMatchObject({ price: "749.00", priceCurrency: "RON", availability: "https://schema.org/InStock" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("listele de produse sunt în HTML-ul static (indexabile)", async ({ request }) => {
  const html = await (await request.get("/categorie/brazi")).text();
  expect(html).toContain("Brad artificial Royal, ramuri cu cleme");
  expect(html).toContain("Brăduț Vienna în ghiveci");
});

test("sitemap, robots și antete de securitate", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://magiacasei.ro/produs/brad-artificial-lidia-varfuri-albe");
  expect(sitemap).not.toContain("ghirlande"); // categoriile goale nu apar
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  const h = (await request.get("/")).headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("pe telefon: bară de navigare jos, fără scroll orizontal", async ({ page }, info) => {
  test.skip(info.project.name !== "telefon");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navigare principală" });
  await expect(nav).toBeVisible();
  await nav.getByRole("link", { name: "Produse" }).click();
  await expect(page).toHaveURL(/\/produse/);
  for (const url of ["/", "/produse", "/categorie/brazi", "/produs/brad-artificial-belgian-nins", "/cos", "/cautare", "/contact", "/comanda"]) {
    await page.goto(url);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, url).toBeLessThanOrEqual(0);
  }
});

test("căutarea găsește după cuvinte fără diacritice", async ({ page }) => {
  await page.goto("/cautare");
  await page.getByRole("searchbox", { name: "Caută produse" }).fill("buturuga");
  await expect(page.getByText(/4 rezultate/)).toBeVisible();
});
