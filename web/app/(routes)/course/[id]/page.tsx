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
