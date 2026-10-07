import { z } from "zod";
import { counties } from "./counties";
import { MAX_QTY_PER_LINE } from "./pricing";

const text = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max, "Text prea lung");

export const customerSchema = z.object({
  name: text(3, 80, "Scrie numele complet"),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s.\-()]/g, ""))
    .pipe(z.string().regex(/^(\+?40|0)7\d{8}$/, "Număr de telefon invalid (ex: 0722 123 456)")),
  email: z.string().trim().toLowerCase().max(120).email("Adresă de email invalidă"),
  county: z.enum(counties, { message: "Alege județul" }),
  city: text(2, 60, "Scrie localitatea"),
  address: text(5, 200, "Scrie adresa completă (stradă, număr, bloc, apartament)"),
  postalCode: z
    .string()
    .trim()
    .regex(/^(\d{6})?$/, "Codul poștal are 6 cifre")
    .optional()
    .default(""),
  notes: z.string().trim().max(500, "Maxim 500 de caractere").optional().default(""),
});

export const PAYMENT_METHODS = ["card", "ramburs"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const orderRequestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  customer: customerSchema,
  items: z
    .array(z.object({ sku: z.string().max(160), qty: z.number().int().min(1).max(MAX_QTY_PER_LINE) }))
    .min(1, "Coșul este gol")
    .max(50),
  paymentMethod: z.enum(PAYMENT_METHODS, { message: "Alege metoda de plată" }),
  acceptTerms: z.literal(true, { message: "Trebuie să accepți termenii și condițiile" }),
  newsletter: z.boolean().optional().default(false),
  // capcană pentru boți: câmpul e ascuns și trebuie să rămână gol
  website: z.string().max(0).optional().default(""),
});

export type Customer = z.infer<typeof customerSchema>;
export type OrderRequest = z.infer<typeof orderRequestSchema>;
