import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { generateCourse } from './routes/generateCourse.ts';

export async function routes(app: FastifyInstance, db: Pool) {
  app.post('/course', async (req, res) => {
    const { userId, topic, language } = req.body as any;
    const out = await generateCourse(db, userId, topic, language);
    return out;
  });

  app.get('/course/:id', async (req) => {
    const { id } = req.params as any;
    const course = await db.query('select * from course where id=$1', [id]);
    const lessons = await db.query(
      'select * from lesson where course_id=$1 order by order_index',
      [id]
    );
    return { course: course.rows[0], lessons: lessons.rows };
  });

  app.get('/lesson/:id/cards', async (req) => {
    const { id } = req.params as any;
    const cards = await db.query('select * from card where lesson_id=$1', [id]);
    return { cards: cards.rows };
  });

  app.get('/srs/:userId/today', async (req) => {
    const { userId } = req.params as any;
    const rs = await db.query(
      `select r.*, c.front, c.back
       from review r join card c on c.id=r.card_id
       where r.user_id=$1 and r.scheduled_at<=current_date
       order by r.scheduled_at asc limit 50`,
      [userId]
    );
    return { reviews: rs.rows };
  });

  app.post('/srs/answer', async (req) => {
    const { reviewId, grade } = req.body as any; // 'again'|'hard'|'good'|'easy'
    const r = await db.query('select * from review where id=$1', [reviewId]);
    if (!r.rowCount) return { ok: false };

    const row = r.rows[0];
    const map: Record<string, number> = { again: 0, hard: 3, good: 4, easy: 5 };
    const q = map[grade] ?? 4;

    const E = Math.max(1.3, row.easiness + (0.1 - (5 - q)*(0.08 + (5 - q)*0.02)));
    const n = grade === 'again' ? 0 : row.consecutive + 1;

    let interval = 1;
    if (n === 0) interval = 1;
    else if (n === 1) interval = 1;
    else if (n === 2) interval = 6;
    else interval = Math.round(row.interval_days * E);

    await db.query(
      `update review
       set last_result=$1, consecutive=$2, easiness=$3, interval_days=$4,
           scheduled_at=current_date + make_interval(days => $4)
       where id=$5`,
      [grade, n, E, interval, reviewId]
    );

    return { ok: true };
  });
}
