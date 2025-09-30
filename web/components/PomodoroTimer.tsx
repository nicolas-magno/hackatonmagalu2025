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
