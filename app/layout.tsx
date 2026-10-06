import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/lib/jsonld";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ro_RO", siteName: site.name, url: site.url },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#9a4f2b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a href="#continut" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">
          Sari la conținut
        </a>
        <CartProvider>
          <Header />
          <main id="continut" className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            name: site.name,
            url: site.url,
            email: site.email,
            description: site.description,
            areaServed: "RO",
          }}
        />
      </body>
    </html>
  );
}
