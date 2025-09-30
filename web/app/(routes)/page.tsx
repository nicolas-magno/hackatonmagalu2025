"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Page(){
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]= useState<string|null>(null);
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
