import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ddl = `
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  position INT NOT NULL,
  UNIQUE(course_id, position)
);

-- vínculo das questões já existentes com cada lição
CREATE TABLE IF NOT EXISTS lesson_questions (
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
`;

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(ddl);
    await client.query('COMMIT');
    console.log('✅ Migração de cursos/lições ok.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
