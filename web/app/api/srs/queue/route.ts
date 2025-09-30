import { NextResponse } from "next/server";
import { db } from "@/app/api/_db";
export async function GET() {
  const all = Array.from(db.cardsByLesson.values()).flat();
  return NextResponse.json(all.slice(0, 5));
}
