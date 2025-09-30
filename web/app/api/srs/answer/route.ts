import { NextResponse } from "next/server";

export async function POST(req: Request){
  const { cardId, rating } = await req.json();
  if(!cardId || !rating) return NextResponse.json({ ok:false, error:"payload inválido" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
