"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar(){
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true), []);
  const current = theme === "system" ? systemTheme : theme;

  return (
    <header className="mb-6 flex items-center justify-between">
      <Link href="/" className="text-lg font-semibold">foco-duo</Link>
      {mounted && (
        <button
          className="rounded-md border px-3 py-1"
          onClick={()=> setTheme(current === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          {current === "dark" ? "🌙" : "☀️"}
        </button>
      )}
    </header>
  );
}
