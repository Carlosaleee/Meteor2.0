import type { Metadata } from "next";
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";

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
  title: "Meteor 2.0 — Dashboard Tático",
  description: "Dashboard tático de telemetria para Ilha Comprida e Vale do Ribeira",
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "light dark" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body className="bg-[var(--color-bg)] font-mono text-[var(--color-ink)] antialiased min-h-screen flex flex-col" style={{ background: 'var(--color-bg)', color: 'var(--color-ink)' }}>
        <a href="#main-content" className="skip-link sr-only">
          Pular para o conteúdo principal
        </a>
        <Header />
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8" role="main">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
