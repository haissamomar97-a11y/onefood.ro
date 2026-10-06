// Datele firmei. ATENȚIE: câmpurile marcate „DE COMPLETAT” sunt obligatorii legal înainte de lansare.
export const site = {
  name: "Magia Casei",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://magiacasei.ro").replace(/\/$/, ""),
  tagline: "Lucruri frumoase și practice pentru casa ta",
  description:
    "Magazin online cu articole pentru casă: bucătărie, decorațiuni, organizare și textile. Livrare rapidă în toată România, plata la livrare, retur în 14 zile.",
  email: "contact@magiacasei.ro",
  phone: "07XX XXX XXX", // DE COMPLETAT
  company: {
    legalName: "DE COMPLETAT S.R.L.", // DE COMPLETAT
    cui: "ROXXXXXXXX", // DE COMPLETAT
    regCom: "J40/XXXX/2026", // DE COMPLETAT
    address: "DE COMPLETAT, România", // DE COMPLETAT
  },
  shipping: {
    costBani: 1999,
    freeFromBani: 25000,
    deliveryDays: "1–3 zile lucrătoare",
  },
} as const;
