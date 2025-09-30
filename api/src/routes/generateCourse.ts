import { z } from "zod";
import  oa  from "../openai";       // <— sem .js
import type { Pool } from "pg";

const CourseSchema = z.object({
  topic: z.string(),
  language: z.string(),
  lessons: z.array(z.object({
    title: z.string(),
    content_md: z.string(),
    cards: z.array(z.object({ front: z.string(), back: z.string() }))
  }))
});

export async function generateCourse(db: Pool, userId: string, topic: string, language = "pt-BR") {
  // schema só para validação local com Zod
  const jsonSchema = {
    name: "Course",
    schema: {
      type: "object",
      properties: {
        topic: { type: "string" },
        language: { type: "string" },
        lessons: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              content_md: { type: "string" },
              cards: {
                type: "array",
                items: {
                  type: "object",
                  properties: { front: { type: "string" }, back: { type: "string" } },
                  required: ["front", "back"],
                  additionalProperties: false
                }
              }
            },
            required: ["title", "content_md", "cards"],
            additionalProperties: false
          }
        }
      },
      required: ["topic", "language", "lessons"],
      additionalProperties: false
    }
  };

  const system = `Você é um gerador de trilhos de estudo estilo Duolingo.
Produza 3–6 lições curtas (120–200 palavras, em markdown), cada uma com 4–6 flashcards (pergunta/resposta).
Linguagem ${language}. Evite jargões; use exemplos claros e erros comuns. Responda somente JSON válido.`;

  const user = `Tema: ${topic}. Nível: beginner.
Não repita conteúdo entre lições.`;

  // DeepSeek via Chat Completions (compatível com SDK OpenAI)
  const completion = await oa.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    // peça JSON bem-formado
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  const raw = completion.choices?.[0]?.message?.content?.trim() ?? "{}";
  const data = CourseSchema.parse(JSON.parse(raw));

  // persiste no banco
  const c = await db.query(
    "insert into course(user_id, topic, language) values ($1,$2,$3) returning id",
    [userId, data.topic, data.language]
  );
  const courseId = c.rows[0].id;

  for (const [i, l] of data.lessons.entries()) {
    const L = await db.query(
      "insert into lesson(course_id, title, content_md, order_index) values ($1,$2,$3,$4) returning id",
      [courseId, l.title, l.content_md, i]
    );
    for (const card of l.cards) {
      await db.query(
        "insert into card(course_id, lesson_id, front, back) values ($1,$2,$3,$4)",
        [courseId, L.rows[0].id, card.front, card.back]
      );
    }
  }

  return { courseId };
}
