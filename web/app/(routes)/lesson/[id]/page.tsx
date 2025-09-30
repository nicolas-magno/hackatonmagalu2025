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
  <div className="rounded-2xl border bg-card p-5 shadow-soft">
    <CardRenderer card={current} />
    <div className="mt-3">
      <AnswerControls onRate={(r)=> answer.mutate({ cardId: current.id, rating: r })} />
    </div>
  </div>
) : (
  <p>Sem mais cartões. Parabéns! 🎉</p>
)}
    </main>
  );
}
