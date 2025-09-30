// src/routes/generateCourse.ts
import { z } from 'zod';
import { oa } from '../openai.ts';
import { Pool } from 'pg';

/**
 * Estrutura esperada do JSON de saída do modelo (validada com Zod)
 */
const CourseSchema = z.object({
  topic: z.string(),
  language: z.string(),
  lessons: z.array(z.object({
    title: z.string(),
    content_md: z.string(), // conteúdo em Markdown
    cards: z.array(z.object({
      front: z.string(),
      back: z.string()
    }))
  }))
});
type CourseOut = z.infer<typeof CourseSchema>;

/**
 * Pequeno sanitizador caso o modelo devolva conteúdo cercado por ```json ... ```
 */
function parseJSONStrict(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned || '{}');
}

/**
 * Gera curso usando DeepSeek (via SDK OpenAI, configurado com baseURL na openai.ts)
 * - Usa chat.completions com response_format: json_object para garantir JSON válido
 * - Valida com Zod e persiste no Postgres
 */
export async function generateCourse(db: Pool, userId: string, topic: string, language = 'pt-BR') {
  // Exemplo mínimo para orientar o modelo a produzir o formato correto
  const example = {
    topic,
    language,
    lessons: [
      {
        title: "Introdução",
        content_md: "## Objetivo\nTexto em **markdown**.",
        cards: [
          { front: "Pergunta 1", back: "Resposta 1" },
          { front: "Pergunta 2", back: "Resposta 2" }
        ]
      }
    ]
  };

  const completion = await oa.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    response_format: { type: 'json_object' },
    temperature: 0.3,
    // max_tokens pode ser ajustado conforme o tamanho desejado
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: [
          "Você é um gerador de cursos em JSON.",
          "RESPOSTA OBRIGATORIAMENTE em JSON VÁLIDO, sem texto antes/depois.",
          "Estrutura:",
          "- topic: string",
          "- language: string",
          "- lessons: array de { title, content_md (markdown), cards: array de {front, back} }",
          "Cada lição deve ter 4–6 flashcards.",
          "Gere entre 3 e 6 lições curtas."
        ].join('\n')
      },
      {
        role: 'user',
        content: JSON.stringify({
          instruction: "Gere um curso conforme a estrutura abaixo. Saída estritamente em JSON.",
          language,
          topic,
          example // ajuda a fixar o formato
        })
      }
    ]
  });

  const raw = completion.choices?.[0]?.message?.content ?? '{}';
  const parsed = parseJSONStrict(raw);
  const data = CourseSchema.parse(parsed) as CourseOut;

  // Persiste no banco
  const c = await db.query(
    'insert into course(user_id, topic, language) values ($1,$2,$3) returning id',
    [userId, data.topic, data.language]
  );
  const courseId = c.rows[0].id as string;

  for (const [i, l] of data.lessons.entries()) {
    const L = await db.query(
      'insert into lesson(course_id, title, content_md, order_index) values ($1,$2,$3,$4) returning id',
      [courseId, l.title, l.content_md, i]
    );
    const lessonId = L.rows[0].id as string;

    for (const card of l.cards) {
      await db.query(
        'insert into card(course_id, lesson_id, front, back) values ($1,$2,$3,$4)',
        [courseId, lessonId, card.front, card.back]
      );
    }
  }

  return { courseId };
}
