import { NextResponse } from "next/server";
import { db } from "@/app/api/_db";

type Params = { params: { id: string } };
export async function GET(_: Request, { params }: Params){
  const course = db.courses.get(params.id);
  if(!course) return NextResponse.json({ error: "curso não encontrado" }, { status: 404 });
  return NextResponse.json(course);
}
