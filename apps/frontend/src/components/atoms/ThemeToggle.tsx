"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("meteor-theme") as "dark" | "light" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("meteor-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Mudar para tema ${theme === "dark" ? "claro" : "escuro"}`}
      aria-pressed={theme === "light"}
      className="border border-line bg-graphite px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-muted uppercase hover:border-orange hover:text-orange"
    >
      {theme === "dark" ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
