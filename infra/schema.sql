-- Schema mínimo para o app Duolingo Geral (StudySprint)
CREATE TABLE IF NOT EXISTS course(
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson(
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES course(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS card(
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES course(id) ON DELETE CASCADE,
  lesson_id BIGINT REFERENCES lesson(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);