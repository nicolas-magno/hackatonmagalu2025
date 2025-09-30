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
