// api/src/routes/generateCourse.ts
import type { Pool } from "pg";

export async function generateCourse(
  db: Pool,
  userId: string,
  topic: string,
  language = "pt-BR"
) {
  // 1) acha um seed_course pelo tópico pedido; se não achar, usa o primeiro disponível
  const s = await db.query(
    `select id from seed_course
     where lower(topic) = lower($1) or $1 ilike topic
     order by id limit 1`,
    [topic]
  );
  let seedId: number;
  if (s.rowCount) {
    seedId = s.rows[0].id;
  } else {
    const s2 = await db.query("select id from seed_course order by id limit 1");
    if (!s2.rowCount) {
      throw new Error("Nenhum curso semente encontrado. Rode infra/seed.sql.");
    }
    seedId = s2.rows[0].id;
  }

  // 2) cria o curso do usuário (mantendo o 'topic' que ele digitou)
  const c = await db.query(
    "insert into course(user_id, topic, language) values ($1,$2,$3) returning id",
    [userId, topic, language]
  );
  const courseId: number = c.rows[0].id;

  // 3) clona lições e cards da seed_* para lesson/card
  const seedLessons = await db.query(
    "select id, title, content_md, order_index from seed_lesson where seed_course_id=$1 order by order_index",
    [seedId]
  );

  for (const sl of seedLessons.rows) {
    const L = await db.query(
      "insert into lesson(course_id, title, content_md, order_index) values ($1,$2,$3,$4) returning id",
      [courseId, sl.title, sl.content_md, sl.order_index]
    );
    const lessonId: number = L.rows[0].id;

    const seedCards = await db.query(
      "select front, back from seed_card where seed_lesson_id=$1 order by id",
      [sl.id]
    );
    for (const sc of seedCards.rows) {
      await db.query(
        "insert into card(course_id, lesson_id, front, back) values ($1,$2,$3,$4)",
        [courseId, lessonId, sc.front, sc.back]
      );
    }
  }

  return { courseId };
}
