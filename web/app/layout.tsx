export const metadata = { title: "foco-duo", description: "App de foco estudantil" };
import "@/styles/globals.css";
import { Providers } from "@/app/providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <Providers>
          <div className="hero-gradient bg-grid">
            <div className="container mx-auto p-4">
              <Navbar />
              {children}
            </div>
          </div>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
