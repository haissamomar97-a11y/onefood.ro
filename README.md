# Magia Casei — magazin online

Next.js 16 (App Router) + Tailwind CSS 4. Toate paginile sunt pre-generate static (încărcare foarte rapidă);
singura rută dinamică este `POST /api/comenzi`.

## Comenzi utile

```bash
npm install
npm run dev          # http://localhost:3000 (comenzile se salvează în .data/orders.json)
npm run check        # verificare tipuri + teste unitare + build
npm run test:e2e     # test complet (telefon + desktop), inclusiv plata cu cardul pe un NETOPIA simulat; după build
```

## Produse

Produsele vin din Excel (`data/brazi.xlsx`, **nu se urcă în repo** — conține date interne):

```bash
pip install openpyxl
python3 scripts/import-produse.py data/brazi.xlsx > lib/catalog.generated.ts
python3 scripts/placeholders.py   # imagini provizorii pentru produsele fără poză
```

Modelele noi (prefix SKU nou) se adaugă în `MODELS` din `scripts/import-produse.py`, cu numele și descrierea în română.

## Plăți NETOPIA

Plata cu cardul se face pe pagina găzduită de NETOPIA (3-D Secure inclus; nu atingem datele cardului).
Confirmarea vine prin notificare (IPN) la `/api/plata/netopia`, verificată criptografic (JWT RS512, cheia publică NETOPIA).
Un card refuzat nu anulează comanda — clientul poate reîncerca. Emailurile pleacă o singură dată, după plată.
Variabile: `NETOPIA_API_KEY`, `NETOPIA_POS_SIGNATURE`, `NETOPIA_PUBLIC_KEY`, `NETOPIA_SANDBOX` (1 = teste).

## Administrare

`/admin` — comenzi, status, AWB Sameday, export CSV. Parola: `ADMIN_PASSWORD` (minim 12 caractere).

## Cum funcționează comenzile

- Prețurile și stocul se verifică **pe server**, din catalog (`lib/products.ts`). Clientul nu poate modifica prețul.
- Fiecare comandă are o cheie de idempotență: un dublu-click sau o reîncercare pe rețea slabă **nu creează comenzi duble**.
- Comenzile se salvează în **Postgres** (`DATABASE_URL`). În producție, fără bază de date, API-ul refuză comenzile
  (503) în loc să le piardă.
- Emailurile (client + magazin) se trimit prin SMTP (Newsman) **după** salvare; dacă emailul eșuează, comanda rămâne salvată.
- Protecții: limită de 10 comenzi / 10 min / IP, câmp-capcană pentru boți, verificare origine, antete de securitate (CSP, HSTS etc.).

## Backup comenzi

Comenzile stau în tabelul `orders` din Postgres. Neon și Supabase fac backup automat (point-in-time restore).
Export manual: `pg_dump "$DATABASE_URL" -t orders > backup-comenzi-$(date +%F).sql`.

## Lansare — de făcut înainte

1. **Date firmă** în `lib/site.ts` (denumire, CUI, Reg. Com., adresă, telefon). Sunt obligatorii legal.
2. **Textele legale** (`app/termeni-si-conditii`, `app/confidentialitate`, `app/livrare-si-retur`) verificate, apoi ștearsă
   nota „Text-model” din `components/legal-page.tsx`.
3. **Produsele reale** în `lib/products.ts`, cu poze în `public/produse/` (`.webp`/`.jpg`, pătrate, min. 1000 px).
4. **Baza de date**: cont gratuit Neon (neon.tech), regiunea Frankfurt → `DATABASE_URL` în Vercel. Tabelul se creează singur.
5. **Emailuri**: în Newsman, domeniul `magiacasei.ro` adăugat și verificat (SPF/DKIM puse în Cloudflare) →
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ORDER_EMAIL_FROM`, `ORDER_NOTIFY_TO`.
6. **Vercel**: Import repo → variabilele din `.env.example` → Deploy → Settings → Domains: `magiacasei.ro` + `www.magiacasei.ro`.
   În Cloudflare: înregistrările date de Vercel, cu proxy **DNS only** (nor gri).
7. **Google Search Console**: verificare domeniu + trimis `https://magiacasei.ro/sitemap.xml`.
8. O comandă de test reală pe telefon, după lansare.
