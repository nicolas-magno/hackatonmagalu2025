import type { FastifyInstance } from 'fastify';
import type { Pool } from 'pg';
import { z } from 'zod';
import { generateCourse } from './routes/generateCourse';

const CreateBody = z.object({
  userId: z.string().uuid(),
  topic: z.string().min(2),
  language: z.string().default('pt-BR').optional(),
});

const IdParam = z.object({
  id: z.coerce.number().int().positive(),
});

export function routes(app: FastifyInstance, db: Pool) {
  app.post('/course', async (req, reply) => {
    const parsed = CreateBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', issues: parsed.error.issues });
    }
    try {
      const { userId, topic, language } = parsed.data;
      const result = await generateCourse(db, userId, topic, language ?? 'pt-BR');
      return reply.send(result); // { courseId }
    } catch (err: any) {
      req.log.error(err);
      return reply.code(500).send({ error: 'failed_to_generate_course', detail: String(err.message ?? err) });
    }
  });

  app.get('/course/:id', async (req, reply) => {
    const p = IdParam.safeParse(req.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid_id' });
    const { id } = p.data;

    const course = await db.query('select * from course where id = $1', [id]);
    if (!course.rows[0]) return reply.code(404).send({ error: 'not_found' });

    const lessons = await db.query(
      'select * from lesson where course_id = $1 order by order_index',
      [id]
    );
    return reply.send({ course: course.rows[0], lessons: lessons.rows });
  });

  app.get('/lesson/:id/cards', async (req, reply) => {
    const p = IdParam.safeParse(req.params);
    if (!p.success) return reply.code(400).send({ error: 'invalid_id' });
    const { id } = p.data;

    const cards = await db.query(
      'select id, front, back from card where lesson_id = $1 order by id',
      [id]
    );
    return reply.send(cards.rows);
  });
}
