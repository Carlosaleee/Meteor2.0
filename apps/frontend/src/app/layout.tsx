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
  description: "Weather, sea and swell for Ilha Comprida and Vale do Ribeira",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body className="bg-bg font-mono text-ink antialiased">{children}</body>
    </html>
  );
}
