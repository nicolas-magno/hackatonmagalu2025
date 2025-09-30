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
