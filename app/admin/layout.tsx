import type { Metadata } from "next";

export const metadata: Metadata = { title: "Administrare", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="container-page py-6">{children}</div>;
}
