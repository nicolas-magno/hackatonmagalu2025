import { NextResponse } from "next/server";
import { db, createCourse } from "@/app/api/_db";

export async function GET() {
  const list = Array.from(db.courses.values());
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const { topic } = await req.json();
  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "topic é obrigatório" }, { status: 400 });
  }
  const course = createCourse(topic.trim());
  return NextResponse.json(course);
}
