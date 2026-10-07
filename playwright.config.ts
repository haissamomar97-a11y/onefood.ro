import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const MOCK = 3199;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "telefon", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: `node tests/e2e/mock-netopia.mjs`,
      url: `http://localhost:${MOCK}`,
      env: { MOCK_PORT: String(MOCK), APP_URL: `http://localhost:${PORT}` },
      reuseExistingServer: false,
    },
    {
      command: `npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      env: {
        ALLOW_FILE_ORDER_STORE: "1",
        ORDERS_FILE: ".data/e2e-orders.json",
        NETOPIA_API_KEY: "test-api-key",
        NETOPIA_POS_SIGNATURE: "TEST-POS-SIGNATURE",
        NETOPIA_PUBLIC_KEY: readFileSync("tests/fixtures/netopia-test-public.pem", "utf8"),
        NETOPIA_API_URL: `http://localhost:${MOCK}`,
        ADMIN_PASSWORD: "parola-de-test-admin",
        ORDER_RATE_LIMIT: "1000",
      },
    },
  ],
});
