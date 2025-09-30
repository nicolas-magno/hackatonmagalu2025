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
  <main className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">{data.topic}</h1>
      <p className="text-muted-foreground">Escolha uma lição para começar.</p>
    </div>
    <ul className="grid gap-3 sm:grid-cols-2">
      {data.lessons.map(l => (
        <li key={l.id} className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="font-medium">{l.title}</span>
            <a className="rounded-xl border px-3 py-1 hover:bg-muted" href={`/lesson/${l.id}`}>Abrir</a>
          </div>
        </li>
      ))}
    </ul>
    <a className="inline-block rounded-xl border px-4 py-2 hover:bg-muted" href="/review">Ir para Revisão</a>
  </main>
);
}
