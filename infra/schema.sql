create extension if not exists pgcrypto;
create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  created_at timestamptz default now()
);
create table if not exists course (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id),
  topic text not null,
  language text default 'pt-BR',
  created_at timestamptz default now()
);
create table if not exists lesson (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references course(id) on delete cascade,
  title text not null,
  content_md text not null,
  order_index int not null
);
create table if not exists card (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references course(id) on delete cascade,
  lesson_id uuid references lesson(id) on delete set null,
  front text not null,
  back text not null,
  difficulty smallint default 2
);
create table if not exists review (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references card(id) on delete cascade,
  user_id uuid references app_user(id),
  scheduled_at date not null,
  last_result text,
  interval_days int default 0,
  easiness real default 2.5,
  consecutive int default 0
);
create index if not exists idx_review_user_date on review (user_id, scheduled_at);
