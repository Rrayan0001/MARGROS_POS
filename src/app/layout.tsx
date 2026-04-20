import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Geist package not installed — use Inter (sans) and JetBrains Mono (mono) as equivalents
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "MARGROS POS — Smart Billing for Smart Restaurants",
  description:
    "A premium restaurant POS platform built for modern restaurants, cafes, QSRs, food courts, and cloud kitchens. Fast billing, menu control, analytics & AI-powered onboarding.",
  keywords: ["restaurant POS", "billing software", "menu management", "restaurant analytics"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mode="light" data-theme="light" data-grain="on">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable}`}
        style={
          {
            "--sans": `var(--font-inter), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`,
            "--mono": `var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace`,
          } as React.CSSProperties
        }
      >
        {children}
        <div className="grain-overlay" />
      </body>
    </html>
  );
}
