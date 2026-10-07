import type { Metadata, Viewport } from "next";
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CartToast } from "@/components/toast";
import { JsonLd } from "@/lib/jsonld";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `Brazi de Crăciun artificiali | ${site.name}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ro_RO", siteName: site.name, url: site.url },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#0f3d2e", width: "device-width", initialScale: 1, viewportFit: "cover" };

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
          <BottomNavSpacer />
          <BottomNav />
          <CartToast />
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
