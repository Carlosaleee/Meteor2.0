import type { Metadata } from "next";
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Meteor — Telemetry HUD",
  description: "Weather, sea and swell for Ilha Comprida and Vale do Ribeira — tactical surf telemetry",
  metadataBase: new URL("https://meteor.local"),
  openGraph: {
    title: "Meteor — Telemetry HUD",
    description: "Tactical surf telemetry for Ilha Comprida and Vale do Ribeira",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/CapaMeteor.jpg", width: 1200, height: 630, alt: "Meteor HUD — Capa" }],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "light dark" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body className="bg-bg font-mono text-ink antialiased">{children}</body>
    </html>
  );
}
