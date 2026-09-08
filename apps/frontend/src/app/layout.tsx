import type { Metadata } from "next";
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  title: "Meteor 2.0 — Estrutura Base",
  description: "Estrutura base do projeto com Header e Footer globais",
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "light dark" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable}`}>
      <body className="bg-slate-950 font-mono text-slate-100 antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
