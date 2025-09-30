"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Rocket, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar(){
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true), []);
  const current = theme === "system" ? systemTheme : theme;

  return (
    <header className="mb-8 flex items-center justify-between">
      <Link href="/" className="group flex items-center gap-2">
        <div className="rounded-xl bg-primary/15 p-2"><Rocket className="h-5 w-5 text-primary" /></div>
        <span className="text-lg font-semibold tracking-tight group-hover:opacity-90">foco-duo</span>
      </Link>
      {mounted && (
        <Button
          variant="secondary"
          onClick={()=> setTheme(current === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          {current === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Tema</span>
        </Button>
      )}
    </header>
  );
}
