# === Cria estrutura e arquivos do frontend foco-duo (Next.js) ===
set -euo pipefail

# Vá para a raiz do projeto (ajuste se necessário)
mkdir -p "$HOME/foco-duo"
cd "$HOME/foco-duo"

# Diretórios
mkdir -p web/"app/(routes)"/course/'[id]'
mkdir -p web/"app/(routes)"/lesson/'[id]'
mkdir -p web/"app/(routes)"/review
mkdir -p web/app
mkdir -p web/components/ui
mkdir -p web/lib
mkdir -p web/styles

# --------- ARQUIVOS ---------

# package.json
cat > web/package.json <<'JSON'
{
  "name": "foco-duo-web",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.51.23",
    "axios": "^1.7.7",
    "framer-motion": "^11.2.13",
    "lucide-react": "^0.453.0",
    "next": "14.2.5",
    "next-themes": "^0.2.1",
    "nanoid": "^5.0.7",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.52.0",
    "zustand": "^4.5.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.78",
    "@types/react-dom": "^18.2.25",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.5",
    "postcss": "^8.4.42",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2"
  }
}
JSON

# postcss.config.js
cat > web/postcss.config.js <<'JS'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
JS

# tailwind.config.ts
cat > web/tailwind.config.ts <<'TS'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
TS

# tsconfig.json
cat > web/tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnet",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
JSON

# .env.example
cat > web/.env.example <<'ENV'
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
ENV

# styles/globals.css
cat > web/styles/globals.css <<'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;
CSS

# app/layout.tsx
cat > web/app/layout.tsx <<'TSX'
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
TSX

# app/providers.tsx
cat > web/app/providers.tsx <<'TSX'
"use client";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
TSX

# app/(routes)/page.tsx (Home)
cat > 'web/app/(routes)/page.tsx' <<'TSX'
"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Page(){
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const router = useRouter();

  async function onCreate(){
    try{
      setLoading(true); setError(null);
      const { data } = await api.post("/course", { topic });
      router.push(`/course/${data.id}`);
    }catch(e: any){ setError(e?.message ?? "Erro ao criar curso"); }
    finally{ setLoading(false); }
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">foco-duo</h1>
      <p>Digite um assunto e gere um mini-curso com lições e cards.</p>
      <div className="flex gap-2">
        <input className="w-full rounded-md border px-3 py-2"
               placeholder="Ex.: Eletrostática básica"
               value={topic} onChange={e=>setTopic(e.target.value)} />
        <button disabled={!topic || loading} onClick={onCreate}
                className="rounded-md border px-4 py-2">
          {loading?"Gerando...":"Criar curso"}
        </button>
      </div>
      {error && <div className="rounded-md border border-red-500 bg-red-50 p-3 text-red-600">{error}</div>}
    </main>
  );
}
TSX

# app/(routes)/course/[id]/page.tsx
cat > 'web/app/(routes)/course/[id]/page.tsx' <<'TSX'
"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";

async function fetchCourse(id: string){
  const { data } = await api.get(`/course/${id}`);
  return data as { id: string; topic: string; lessons: { id: string; title: string }[] };
}

export default function CoursePage({ params }: { params: { id: string } }){
  const { data, isLoading, error } = useQuery({ queryKey: ["course", params.id], queryFn: ()=> fetchCourse(params.id) });
  if(isLoading) return <p>Carregando...</p>;
  if(error || !data) return <p>Erro ao carregar curso.</p>;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">{data.topic}</h1>
      <ul className="space-y-2">
        {data.lessons.map(l => (
          <li key={l.id} className="flex items-center justify-between rounded-md border p-3">
            <span>{l.title}</span>
            <Link className="rounded-md border px-3 py-1" href={`/lesson/${l.id}`}>Abrir lição</Link>
          </li>
        ))}
      </ul>
      <Link className="inline-block rounded-md border px-3 py-1" href="/review">Ir para Revisão</Link>
    </main>
  );
}
TSX

# app/(routes)/lesson/[id]/page.tsx
cat > 'web/app/(routes)/lesson/[id]/page.tsx' <<'TSX'
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PomodoroTimer from "@/components/PomodoroTimer";
import CardRenderer from "@/components/CardRenderer";
import { AnswerControls } from "@/components/AnswerControls";
import type { Card } from "@/lib/types";
import type { Rating } from "@/lib/srs";

async function fetchCards(lessonId: string){
  const { data } = await api.get(`/lesson/${lessonId}/cards`);
  return data as Card[];
}

export default function LessonPage({ params }: { params: { id: string } }){
  const qc = useQueryClient();
  const { data: cards, isLoading, error } = useQuery({ queryKey: ["lesson-cards", params.id], queryFn: ()=> fetchCards(params.id) });

  const answer = useMutation({
    mutationFn: (body: { cardId: string; rating: Rating }) => api.post(`/srs/answer`, body),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ["lesson-cards", params.id] }),
  });

  if(isLoading) return <p>Carregando...</p>;
  if(error || !cards) return <p>Erro ao carregar cartões.</p>;

  const current = cards[0];
  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Lição</h1>
        <PomodoroTimer />
      </div>
      {current ? (
        <div>
          <CardRenderer card={current} />
          <AnswerControls onRate={(r)=> answer.mutate({ cardId: current.id, rating: r })} />
        </div>
      ) : (
        <p>Sem mais cartões. Parabéns! 🎉</p>
      )}
    </main>
  );
}
TSX

# app/(routes)/review/page.tsx
cat > 'web/app/(routes)/review/page.tsx' <<'TSX'
"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import CardRenderer from "@/components/CardRenderer";
import { AnswerControls } from "@/components/AnswerControls";
import type { Card } from "@/lib/types";
import type { Rating } from "@/lib/srs";

async function fetchQueue(){
  const { data } = await api.get(`/srs/queue`);
  return data as Card[];
}

export default function ReviewPage(){
  const qc = useQueryClient();
  const { data: queue, isLoading } = useQuery({ queryKey: ["srs-queue"], queryFn: fetchQueue });
  const answer = useMutation({
    mutationFn: (body: { cardId: string; rating: Rating }) => api.post(`/srs/answer`, body),
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ["srs-queue"] }),
  });

  if(isLoading) return <p>Carregando...</p>;
  const current = queue?.[0];
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">Revisão</h1>
      {current ? (
        <div>
          <CardRenderer card={current} />
          <AnswerControls onRate={(r)=> answer.mutate({ cardId: current.id, rating: r })} />
        </div>
      ) : (<p>Nenhum item para revisar agora 🎯</p>)}
    </main>
  );
}
TSX

# components/PomodoroTimer.tsx
cat > web/components/PomodoroTimer.tsx <<'TSX'
"use client";
import { useEffect, useRef, useState } from "react";

export default function PomodoroTimer({ work=25, rest=5 }: { work?: number; rest?: number }) {
  const [isWork, setIsWork] = useState(true);
  const [secs, setSecs] = useState(work*60);
  const it = useRef<NodeJS.Timeout | null>(null);

  useEffect(()=>{ setSecs((isWork?work:rest)*60); },[isWork, work, rest]);
  useEffect(()=>{
    it.current && clearInterval(it.current);
    it.current = setInterval(()=> setSecs(s=> s>0 ? s-1 : 0), 1000);
    return ()=> { if (it.current) clearInterval(it.current); };
  },[]);
  useEffect(()=>{ if(secs===0){ setIsWork(w=>!w); } },[secs]);

  const mm = String(Math.floor(secs/60)).padStart(2,"0");
  const ss = String(secs%60).padStart(2,"0");

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-semibold tabular-nums">{mm}:{ss}</span>
      <button className="rounded-md border px-3 py-1" onClick={()=> setIsWork(w=>!w)}>
        {isWork?"Pausar/Descansar":"Voltar ao foco"}
      </button>
      <button className="rounded-md border px-3 py-1" onClick={()=> setSecs((isWork?work:rest)*60)}>Reset</button>
    </div>
  );
}
TSX

# components/AnswerControls.tsx
cat > web/components/AnswerControls.tsx <<'TSX'
"use client";
import { Rating } from "@/lib/srs";

export function AnswerControls({ onRate }: { onRate: (r: Rating)=>void }){
  return (
    <div className="mt-4 flex gap-2">
      {(["again","hard","good","easy"] as Rating[]).map(r=> (
        <button key={r} onClick={()=>onRate(r)} className="rounded-md border px-3 py-1 capitalize">
          {r}
        </button>
      ))}
    </div>
  );
}
TSX

# components/CardRenderer.tsx
cat > web/components/CardRenderer.tsx <<'TSX'
"use client";
import type { Card } from "@/lib/types";
import { useState } from "react";

export default function CardRenderer({ card }: { card: Card }){
  const [show, setShow] = useState(false);
  if(card.type==="flashcard"){
    return (
      <div className="rounded-xl border p-4">
        <div className="text-lg font-medium">{card.front}</div>
        {show && <div className="mt-3 text-muted-foreground">{card.back}</div>}
        <button className="mt-3 rounded-md border px-3 py-1" onClick={()=> setShow(s=>!s)}>
          {show?"Ocultar resposta":"Mostrar resposta"}
        </button>
      </div>
    );
  }
  if(card.type==="mcq"){
    return (
      <div className="rounded-xl border p-4">
        <div className="text-lg font-medium">{card.question}</div>
        <ul className="mt-3 space-y-2">
          {card.options.map((op,i)=> (
            <li key={i} className="flex items-center gap-2">
              <input type="radio" name={`mcq-${card.id}`} id={`mcq-${card.id}-${i}`} />
              <label htmlFor={`mcq-${card.id}-${i}`}>{op}</label>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  // cloze
  return (
    <div className="rounded-xl border p-4">
      <div className="font-medium">Complete:</div>
      <div className="mt-2 whitespace-pre-wrap">{card.text}</div>
    </div>
  );
}
TSX

# components/Navbar.tsx
cat > web/components/Navbar.tsx <<'TSX'
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
TSX

# lib/api.ts
cat > web/lib/api.ts <<'TS'
import axios from "axios";
export const api = axios.create({
  // Enquanto não houver backend, usamos /api (mocks locais via Next)
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
});
TS

# lib/types.ts
cat > web/lib/types.ts <<'TS'
export type LessonRef = { id: string; title: string };
export type Course = { id: string; topic: string; lessons: LessonRef[] };

export type Card =
  | { id: string; type: "flashcard"; front: string; back: string }
  | { id: string; type: "mcq"; question: string; options: string[]; answer: number }
  | { id: string; type: "cloze"; text: string; blanks: string[] };
TS

# lib/srs.ts
cat > web/lib/srs.ts <<'TS'
export type Rating = "again" | "hard" | "good" | "easy";
TS

# Um placeholder na pasta de UI (shadcn) para o git não ignorar pasta vazia
cat > web/components/ui/.gitkeep <<'TXT'
# add shadcn/ui components aqui se/quando for usar
TXT

echo "✅ Estrutura criada em $(realpath web)"
echo
echo "Próximos passos:"
echo "  1) cd web"
echo "  2) npm i"
echo "  3) npm run dev -p 3001  # http://localhost:3001"
x
