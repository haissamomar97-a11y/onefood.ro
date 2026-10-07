const SKU = "brad-artificial-kovalivska-vip-verde~180"; // 749 lei, stoc 15

export const validOrder = (over: Record<string, unknown> = {}) => ({
  idempotencyKey: crypto.randomUUID(),
  customer: {
    name: "Ion Popescu",
    phone: "0722 123 456",
    email: "Ion@Example.com",
    county: "Cluj",
    city: "Cluj-Napoca",
    address: "Str. Memorandumului nr. 1, ap. 2",
    postalCode: "400114",
    notes: "",
  },
  items: [{ sku: SKU, qty: 2 }],
  paymentMethod: "ramburs",
  acceptTerms: true,
  website: "",
  ...over,
});

