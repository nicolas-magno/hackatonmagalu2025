"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type LessonRef = { id: string; title: string };
type Course = { id: string; topic: string; lessons: LessonRef[] };

async function fetchCourses(){
  const { data } = await api.get("/course"); // GET lista
  return data as Course[];
}

export default function Page(){
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: courses, isLoading } = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });

  async function onCreate(){
    try{
      setLoading(true);
      const { data } = await api.post("/course", { topic });
      router.push(`/course/${data.id}`);
    }finally{
      setLoading(false);
    }
  }

  return (
    <main className="space-y-10">
      <section className="text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Estude <span className="text-primary">qualquer assunto</span>, com foco e revisão inteligente.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Já deixamos alguns cursos prontos para a demo 😉
        </p>
        <div className="mx-auto mt-6 flex max-w-xl items-center gap-2">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="Ex.: Eletrostática básica"
            value={topic}
            onChange={e=>setTopic(e.target.value)}
          />
          <button
            className="rounded-xl border px-4 py-2"
            disabled={!topic || loading}
            onClick={onCreate}
          >
            {loading ? "Gerando..." : "Criar curso"}
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Cursos prontos</h2>
        {isLoading && <p>Carregando…</p>}
        {!isLoading && (!courses || courses.length === 0) && <p>Nenhum curso ainda.</p>}
        {!!courses?.length && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {courses.map(c => (
              <li key={c.id} className="rounded-2xl border bg-card p-4 shadow-soft">
                <div className="mb-2 text-lg font-medium">{c.topic}</div>
                <ul className="mb-3 text-sm text-muted-foreground list-disc pl-5">
                  {c.lessons.slice(0,3).map(l => <li key={l.id}>{l.title}</li>)}
                </ul>
                <a className="inline-block rounded-xl border px-3 py-1 hover:bg-muted" href={`/course/${c.id}`}>Abrir</a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}