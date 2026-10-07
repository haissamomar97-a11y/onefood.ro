// Datele firmei. ATENȚIE: câmpurile marcate „DE COMPLETAT” sunt obligatorii legal înainte de lansare.
export const site = {
  name: "Magia Casei",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://magiacasei.ro").replace(/\/$/, ""),
  tagline: "Magia Crăciunului, livrată acasă",
  description:
    "Brazi de Crăciun artificiali, ghirlande și globuri. Livrare rapidă cu Sameday în toată România, plata cu cardul sau ramburs, retur în 14 zile.",
  email: "office@magiacasei.ro",
  phone: "07XX XXX XXX", // DE COMPLETAT
  company: {
    legalName: "DE COMPLETAT S.R.L.", // DE COMPLETAT
    cui: "ROXXXXXXXX", // DE COMPLETAT
    regCom: "J40/XXXX/2026", // DE COMPLETAT
    address: "DE COMPLETAT, România", // DE COMPLETAT
  },
  shipping: {
    carrier: "Sameday",
    costBani: 1999,
    freeFromBani: 30000,
    deliveryDays: "1–2 zile lucrătoare",
    /** Ultima zi de comandă pentru livrare înainte de Crăciun. */
    christmasCutoff: "2026-12-19",
  },
} as const;
