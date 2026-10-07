import { readFileSync, rmSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const ORDERS = ".data/e2e-orders.json";
type O = { id: string; status: string; totalBani: number; paymentMethod: string; payment: { state: string }; lines: { sku: string; qty: number }[]; customer: { phone: string } };
const readOrders = (): O[] => {
  try {
    return JSON.parse(readFileSync(ORDERS, "utf8"));
  } catch {
    return [];
  }
};

test.beforeEach(() => rmSync(ORDERS, { force: true }));

async function addToCart(page: Page) {
  // pe telefon butonul e în bara fixă de jos, pe desktop lângă cantitate
  await page.getByRole("button", { name: "Adaugă în coș" }).locator("visible=true").first().click();
}

async function fillCheckout(page: Page, firstName = "Maria") {
  await page.getByLabel("Nume și prenume").fill(`${firstName} Ionescu`);
  await page.getByLabel("Telefon").fill("0744 555 666");
  await page.getByRole("textbox", { name: "Email" }).fill("maria@example.com");
  await page.getByLabel("Județ").selectOption("Iași");
  await page.getByLabel("Localitate").fill("Iași");
  await page.getByLabel("Stradă, număr, bloc, scară, apartament").fill("Bd. Ștefan cel Mare nr. 10, ap. 4");
  await page.getByRole("checkbox", { name: /termenii și condițiile/ }).check();
}

test("ramburs: categorie → filtru → produs cu înălțime → coș → comandă → confirmare", async ({ page }) => {
  await page.goto("/categorie/brazi");
  await page.getByRole("button", { name: "Ninși" }).click();
  await expect(page.getByText(/\d+ produse?/)).toBeVisible();
  await page.getByRole("link", { name: "Brad artificial Belgian nins" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Brad artificial Belgian nins" })).toBeVisible();
  await page.getByRole("button", { name: /^210 cm/ }).click();
  await expect(page.getByTestId("product-price")).toHaveText("1.329,00 lei");
  await addToCart(page);
  await expect(page.getByText("Adăugat în coș")).toBeVisible();

  await page.goto("/cos");
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("cart-line")).toContainText("210 cm");
  await expect(page.getByTestId("order-total")).toHaveText("1.329,00 lei"); // livrare gratuită peste 300 lei
  await page.reload();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);

  await page.getByRole("link", { name: /Finalizează comanda/ }).locator("visible=true").click();
  await page.getByLabel(/Ramburs la livrare/).check();

  await page.getByRole("button", { name: /Trimite comanda/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Verifică datele" })).toBeVisible();
  await expect(page.getByText("Scrie numele complet")).toBeVisible();
  expect(readOrders()).toHaveLength(0);

  await fillCheckout(page);
  await page.getByRole("button", { name: /Trimite comanda/ }).click();

  await expect(page).toHaveURL(/\/comanda\/confirmare\?id=MC-/);
  await expect(page.getByRole("heading", { name: "Mulțumim pentru comandă!" })).toBeVisible();
  const id = await page.getByTestId("order-id").textContent();
  const [o] = readOrders();
  expect(o).toMatchObject({ id, status: "noua", paymentMethod: "ramburs", totalBani: 132900 });
  expect(o.lines).toEqual([expect.objectContaining({ sku: "brad-artificial-belgian-nins~210", qty: 1 })]);
  expect(o.customer.phone).toBe("0744555666");
});

test("card: plată NETOPIA reușită → comandă plătită", async ({ page }) => {
  await page.goto("/produs/brad-artificial-lidia-varfuri-albe");
  await page.getByRole("button", { name: /^150 cm/ }).click();
  await addToCart(page);
  await page.goto("/comanda");
  await expect(page.getByLabel(/Card online/)).toBeChecked();
  await fillCheckout(page);
  await page.getByRole("button", { name: /Plătește 168,99 lei/ }).click();

  await expect(page).toHaveURL(/\/comanda\/confirmare\?id=MC-/);
  await expect(page.getByRole("heading", { name: "Mulțumim pentru comandă!" })).toBeVisible();
  await expect(page.getByText("Plătit cu cardul:")).toBeVisible();
  const [o] = readOrders();
  expect(o).toMatchObject({ status: "noua", paymentMethod: "card", totalBani: 16899, payment: { state: "paid" } });
});

test("card refuzat: comanda rămâne salvată, clientul vede mesaj clar", async ({ page }) => {
  await page.goto("/produs/bradut-vienna-in-ghiveci");
  await addToCart(page);
  await page.goto("/comanda");
  await fillCheckout(page, "Refuz");
  await page.getByRole("button", { name: /Plătește/ }).click();
  await expect(page.getByRole("heading", { name: "Plata nu a fost finalizată" })).toBeVisible();
  const [o] = readOrders();
  expect(o).toMatchObject({ status: "plata_esuata", payment: { state: "failed" } });
});

test("dublu-click pe „Trimite comanda” creează o singură comandă", async ({ page }) => {
  await page.goto("/produs/bradut-vienna-in-ghiveci");
  await addToCart(page);
  await page.goto("/comanda");
  await page.getByLabel(/Ramburs la livrare/).check();
  await fillCheckout(page);
  await page.getByRole("button", { name: /Trimite comanda/ }).dblclick();
  await expect(page).toHaveURL(/\/comanda\/confirmare/);
  expect(readOrders()).toHaveLength(1);
});

test("API: refuză alte site-uri, prețuri falsificate și IPN nesemnat", async ({ request }) => {
  const body = {
    idempotencyKey: crypto.randomUUID(),
    customer: { name: "Test Test", phone: "0722000000", email: "t@example.com", county: "Cluj", city: "Cluj", address: "Str. Test 1" },
    items: [{ sku: "brad-artificial-lidia-varfuri-albe~150", qty: 1, priceBani: 1 }],
    paymentMethod: "ramburs",
    acceptTerms: true,
  };
  expect((await request.post("/api/comenzi", { data: body, headers: { origin: "https://evil.example" } })).status()).toBe(403);
  const ok = await request.post("/api/comenzi", { data: body });
  expect(ok.status()).toBe(201);
  const { id, totalBani } = await ok.json();
  expect(totalBani).toBe(14900 + 1999);

  const fake = await request.post("/api/plata/netopia", { data: { order: { orderID: id }, payment: { status: 3, amount: 168.99 } } });
  expect(fake.status()).toBe(400);
  // statusul public nu expune date personale
  const pub = await (await request.get(`/api/comenzi/${id}`)).json();
  expect(Object.keys(pub).sort()).toEqual(["id", "payment", "paymentMethod", "status", "totalBani"]);
});

test("admin: login, vede comanda, o marchează expediată cu AWB", async ({ page, request }) => {
  const body = {
    idempotencyKey: crypto.randomUUID(),
    customer: { name: "Admin Test", phone: "0722000000", email: "a@example.com", county: "Cluj", city: "Dej", address: "Str. Test 1" },
    items: [{ sku: "brad-artificial-lidia-varfuri-albe~180", qty: 1 }],
    paymentMethod: "ramburs",
    acceptTerms: true,
  };
  const { id } = await (await request.post("/api/comenzi", { data: body })).json();

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Parolă").fill("gresit");
  await page.getByRole("button", { name: "Intră" }).click();
  await expect(page.getByText("Parolă greșită.")).toBeVisible();
  await page.getByLabel("Parolă").fill("parola-de-test-admin");
  await page.getByRole("button", { name: "Intră" }).click();

  await page.getByRole("link", { name: new RegExp(id) }).click();
  await page.getByLabel("Status").selectOption("expediata");
  await page.getByLabel("AWB Sameday").fill("1ONB123456");
  await page.getByRole("button", { name: "Salvează" }).click();
  await expect(page.getByText(/Expediată/).last()).toBeVisible();
  await expect.poll(() => readOrders().find((o) => o.id === id)?.status).toBe("expediata");

  const csv = await page.request.get("/admin/export");
  expect(await csv.text()).toContain("1ONB123456");
  expect((await request.get("/admin/export")).status()).toBe(401);
});
