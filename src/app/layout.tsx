import type { Metadata, Viewport } from "next";
import { BRAND } from "@/lib/i18n/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: BRAND, template: `%s · ${BRAND}` },
  description: "Centre-based CBT examinations and online practice tests for SSC CGL, CHSL and JE",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
