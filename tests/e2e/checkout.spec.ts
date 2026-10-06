import { readFileSync, rmSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const ORDERS = ".data/e2e-orders.json";
const readOrders = (): Array<{ id: string; totalBani: number; lines: { slug: string; qty: number }[]; customer: { phone: string } }> => {
  try {
    return JSON.parse(readFileSync(ORDERS, "utf8"));
  } catch {
    return [];
  }
};

test.beforeEach(() => rmSync(ORDERS, { force: true }));

async function fillCheckout(page: Page) {
  await page.getByLabel("Nume și prenume").fill("Maria Ionescu");
  await page.getByLabel("Telefon").fill("0744 555 666");
  await page.getByLabel("Email").fill("maria@example.com");
  await page.getByLabel("Județ").selectOption("Iași");
  await page.getByLabel("Localitate").fill("Iași");
  await page.getByLabel("Stradă, număr, bloc, scară, apartament").fill("Bd. Ștefan cel Mare nr. 10, ap. 4");
  await page.getByRole("checkbox", { name: /termenii și condițiile/ }).check();
}

test("cumpărare completă: categorie → produs → coș → comandă → confirmare", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Magia Casei/);

  await page.getByRole("link", { name: "Textile" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Textile" })).toBeVisible();
  await page.getByRole("link", { name: /Set 4 prosoape/ }).click();

  await page.getByRole("button", { name: "Crește cantitatea" }).click();
  await page.getByRole("button", { name: "Adaugă în coș" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("2");

  // coșul rezistă la reîncărcare
  await page.reload();
  await expect(page.getByTestId("cart-count")).toHaveText("2");

  await page.getByRole("link", { name: /Coșul de cumpărături/ }).click();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  // 2 × 119,90 = 239,80 + 19,99 livrare
  await expect(page.getByTestId("order-total")).toContainText("259,79");

  await page.getByRole("link", { name: /Finalizează comanda/ }).locator("visible=true").click();
  await expect(page.getByRole("heading", { name: "Finalizează comanda" })).toBeVisible();

  // trimitere goală → erori clare, fără comandă
  await page.getByRole("button", { name: /Trimite comanda/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Verifică datele" })).toBeVisible();
  await expect(page.getByText("Scrie numele complet")).toBeVisible();
  expect(readOrders()).toHaveLength(0);

  await fillCheckout(page);
  await page.getByRole("button", { name: /Trimite comanda/ }).click();

  await expect(page).toHaveURL(/\/comanda\/confirmare/);
  const id = await page.getByTestId("order-id").textContent();
  expect(id).toMatch(/^MC-/);
  await expect(page.getByTestId("cart-count")).toHaveCount(0);

  const orders = readOrders();
  expect(orders).toHaveLength(1);
  expect(orders[0].id).toBe(id);
  expect(orders[0].totalBani).toBe(25979);
  expect(orders[0].lines).toEqual([expect.objectContaining({ slug: "set-prosoape-bumbac-egiptean", qty: 2 })]);
  expect(orders[0].customer.phone).toBe("0744555666");
});

test("dublu-click pe „Trimite comanda” creează o singură comandă", async ({ page }) => {
  await page.goto("/produs/lumanare-parfumata-vanilie");
  await page.getByRole("button", { name: "Adaugă în coș" }).click();
  await page.goto("/comanda");
  await fillCheckout(page);
  const btn = page.getByRole("button", { name: /Trimite comanda/ });
  await btn.dblclick();
  await expect(page).toHaveURL(/\/comanda\/confirmare/);
  expect(readOrders()).toHaveLength(1);
});

test("produsul fără stoc nu poate fi adăugat în coș", async ({ page }) => {
  await page.goto("/produs/fete-perna-catifea-set-2");
  await expect(page.getByText("Momentan stoc epuizat")).toBeVisible();
  await expect(page.getByRole("button", { name: "Adaugă în coș" })).toHaveCount(0);
});

test("API-ul refuză cereri de pe alte site-uri și prețuri falsificate", async ({ request }) => {
  const body = {
    idempotencyKey: crypto.randomUUID(),
    customer: { name: "Test Test", phone: "0722000000", email: "t@example.com", county: "Cluj", city: "Cluj", address: "Str. Test 1" },
    items: [{ slug: "vaza-ceramica-minimalista", qty: 1, priceBani: 1 }],
    paymentMethod: "ramburs",
    acceptTerms: true,
  };
  const evil = await request.post("/api/comenzi", { data: body, headers: { origin: "https://evil.example" } });
  expect(evil.status()).toBe(403);

  const ok = await request.post("/api/comenzi", { data: body });
  expect(ok.status()).toBe(201);
  expect((await ok.json()).totalBani).toBe(7990 + 1999);
});
