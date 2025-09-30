"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Brain, Timer, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function Page(){
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onCreate(){
    try{
      setLoading(true);
      const { data } = await api.post("/course", { topic });
      router.push(`/course/${data.id}`);
    }catch(e: any){
      toast.error(e?.message ?? "Erro ao criar curso");
    }finally{
      setLoading(false);
    }
  }

  return (
    <main className="space-y-10">
      {/* Hero */}
      <section className="text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Estude <span className="text-primary">qualquer assunto</span>, com foco e revisão inteligente.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Gere um mini-curso instantâneo, pratique com cartões e mantenha o ritmo com Pomodoro + SRS.
        </p>
        <div className="mx-auto mt-6 flex max-w-xl items-center gap-2">
          <Input
            placeholder="Ex.: Eletrostática básica"
            value={topic}
            onChange={e=>setTopic(e.target.value)}
          />
          <Button onClick={onCreate} disabled={!topic || loading}>
            {loading ? "Gerando..." : "Criar curso"}
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> SRS</CardTitle>
          <CardDescription className="mt-1">Revisão espaçada para memorizar de verdade.</CardDescription>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary" /> Pomodoro</CardTitle>
          <CardDescription className="mt-1">Ciclos 25/5 para foco consistente.</CardDescription>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Mini-cursos</CardTitle>
          <CardDescription className="mt-1">Aulas e cards gerados a partir do seu assunto.</CardDescription>
        </Card>
      </section>
    </main>
  );
}
