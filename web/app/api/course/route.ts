import { NextResponse } from "next/server";
import { createCourse } from "@/app/api/_db";

export async function POST(req: Request){
  const { topic } = await req.json();
  if(!topic || typeof topic !== "string"){
    return NextResponse.json({ error: "topic é obrigatório" }, { status: 400 });
  }
  const course = createCourse(topic.trim());
  return NextResponse.json(course);
}
