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
