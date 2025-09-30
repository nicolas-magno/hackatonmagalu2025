import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";

export type LessonRef = { id: string; title: string };
export type Course = { id: string; topic: string; lessons: LessonRef[] };
export type Card =
  | { id: string; type: "flashcard"; front: string; back: string }
  | { id: string; type: "mcq"; question: string; options: string[]; answer: number }
  | { id: string; type: "cloze"; text: string; blanks: string[] };
export type Rating = "again" | "hard" | "good" | "easy";

type DB = { courses: Map<string, Course>; cardsByLesson: Map<string, Card[]>; seeded?: boolean };

function getDB() {
  const g = globalThis as any;
  if (!g.__FOCODUO_DB) {
    g.__FOCODUO_DB = { courses: new Map<string, Course>(), cardsByLesson: new Map<string, Card[]>() } as DB;
  }
  return g.__FOCODUO_DB as DB;
}
export const db = getDB();

function loadSeedIfEmpty() {
  if (db.seeded) return;
  if (db.courses.size > 0) { db.seeded = true; return; }

  try {
    const seedPath = path.join(process.cwd(), "data", "seed.json");
    const raw = fs.readFileSync(seedPath, "utf-8");
    const seed = JSON.parse(raw) as { courses: Course[]; cardsByLesson: Record<string, Card[]> };

    for (const c of seed.courses) db.courses.set(c.id, c);
    for (const [lessonId, cards] of Object.entries(seed.cardsByLesson)) {
      db.cardsByLesson.set(lessonId, cards);
    }
    db.seeded = true;
    // eslint-disable-next-line no-console
    console.log("[seed] Carregado de data/seed.json");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[seed] data/seed.json não encontrado ou inválido, seguindo vazio.");
    db.seeded = true;
  }
}
loadSeedIfEmpty();

export function createCourse(topic: string): Course {
  const id = nanoid();
  const lessons: LessonRef[] = Array.from({ length: 3 }, (_, i) => ({ id: nanoid(), title: `Lição ${i + 1} — ${topic}` }));
  const course: Course = { id, topic, lessons };
  db.courses.set(id, course);
  for (const l of lessons) db.cardsByLesson.set(l.id, makeCards(topic, l.title));
  return course;
}

function makeCards(topic: string, lesson: string): Card[] {
  const base = nanoid();
  return [
    { id: `${base}-f1`, type: "flashcard", front: `${topic}: conceito central?`, back: `Definição resumida sobre ${topic}.` },
    { id: `${base}-f2`, type: "flashcard", front: `${lesson}: exemplo prático?`, back: `Um exemplo simples aplicado ao dia a dia.` },
    { id: `${base}-m1`, type: "mcq", question: `Qual opção melhor descreve ${topic}?`, options: ["Conceito A", "Conceito B", "Conceito C", "Conceito D"], answer: 1 },
    { id: `${base}-c1`, type: "cloze", text: `${topic} é __ e se aplica a __ em ${lesson}.`, blanks: ["definição", "contexto"] }
  ];
}
