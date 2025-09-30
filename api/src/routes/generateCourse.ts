import { z } from 'zod';
import { oa } from '../openai.js';
import type { Pool } from 'pg';

const CourseSchema = z.object({
  topic: z.string(),
  language: z.string(),
  lessons: z.array(z.object({
    title: z.string(),
    content_md: z.string(),
    cards: z.array(z.object({ front: z.string(), back: z.string() }))
  }))
});

export async function generateCourse(db: Pool, userId: string, topic: string, language = 'pt-BR') {
  const jsonSchema = {
    name: 'Course',
    schema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        language: { type: 'string' },
        lessons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content_md: { type: 'string' },
              cards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { front: { type: 'string' }, back: { type: 'string' } },
                  required: ['front','back'],
                  additionalProperties: false
                }
              }
            },
            required: ['title','content_md','cards'],
            additionalProperties: false
          }
        }
      },
      required: ['topic','language','lessons'],
      additionalProperties: false
    }
  };

  const resp = await oa.responses.create({
    model: 'gpt-5',
    input: [
      { role: 'system', content: `Gere um mini-curso com 3–6 lições curtas (markdown) e 4–6 flashcards por lição. Linguagem ${language}.` },
      { role: 'user', content: `Tema: ${topic}` }
    ],
    response_format: { type: 'json_schema', json_schema: jsonSchema }
  });

  const raw = resp.output_text ?? JSON.stringify(resp.output_parsed);
  const data = CourseSchema.parse(JSON.parse(raw));

  const c = await db.query('insert into course(user_id,topic,language) values ($1,$2,$3) returning id', [userId, data.topic, data.language]);
  const courseId = c.rows[0].id;

  for (const [i,l] of data.lessons.entries()) {
    const L = await db.query('insert into lesson(course_id,title,content_md,order_index) values ($1,$2,$3,$4) returning id', [courseId, l.title, l.content_md, i]);
    for (const card of l.cards) {
      await db.query('insert into card(course_id,lesson_id,front,back) values ($1,$2,$3,$4)', [courseId, L.rows[0].id, card.front, card.back]);
    }
  }
  return { courseId };
}
