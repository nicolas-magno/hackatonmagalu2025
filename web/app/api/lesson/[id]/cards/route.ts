import { NextResponse } from "next/server";
import { db } from "@/app/api/_db";

type Params = { params: { id: string } };
export async function GET(_: Request, { params }: Params){
  const cards = db.cardsByLesson.get(params.id) || [];
  return NextResponse.json(cards);
}
