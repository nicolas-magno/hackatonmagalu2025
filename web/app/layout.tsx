export const metadata = { title: "foco-duo", description: "App de foco estudantil" };
import "@/styles/globals.css";
import { Providers } from "@/app/providers";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <Providers>
          <div className="mx-auto max-w-4xl p-4">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
