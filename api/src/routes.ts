import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { generateCourse } from './routes/generateCourse.js';

export async function routes(app: FastifyInstance, db: Pool) {
  app.post('/course', async (req) => {
    const { userId, topic, language } = req.body as any;
    return generateCourse(db, userId, topic, language);
  });

  app.get('/course/:id', async (req) => {
    const { id } = req.params as any;
    const course = await db.query('select * from course where id=$1', [id]);
    const lessons = await db.query('select * from lesson where course_id=$1 order by order_index', [id]);
    return { course: course.rows[0], lessons: lessons.rows };
  });

  app.get('/lesson/:id/cards', async (req) => {
    const { id } = req.params as any;
    const cards = await db.query('select * from card where lesson_id=$1', [id]);
    return { cards: cards.rows };
  });
}
