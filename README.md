# foco-duo — mini‑cursos sob demanda (Pomodoro + SRS)

> Digite um assunto. Gere um mini‑curso. Estude com foco e revisão inteligente.

O **foco‑duo** é um protótipo de app no estilo “Duolingo para qualquer assunto”.  
A página inicial permite digitar um tema (ex.: *Eletrostática básica*) e abrir um curso com **lições**.

> ⚠️ **Estado atual (MVP):** as lições aparecem como **slots** (placeholders). A visão do projeto é conectá‑las a um gerador de conteúdo para nascerem **preenchidas com questões** automaticamente quando uma API de LLM (ex.: OpenAI) estiver configurada.

---

## ✨ Visão (com geração automática)
Ao clicar **Criar curso**, o backend deverá:

1. Gerar um **plano** de 3–5 lições (títulos, resumos, objetivos).
2. Para cada lição, criar **10 questões de múltipla escolha** (pt‑BR, 4 alternativas, 1 correta, explicação), com dificuldade progressiva.
3. Salvar tudo no **PostgreSQL** e devolver o `slug` do curso para o frontend abrir.

Implementação prevista (já esboçada no código):
- `src/services/courseGen.ts` → usa LLM para `buildCoursePlan(topic)` e `generateLessonMCQs(topic, lessonTitle, count)`.
- `POST /courses` → orquestra: cria `course`, `lessons`, persiste `questions/choices` e vincula via `lesson_questions`.

> Sem `OPENAI_API_KEY`, o `POST /courses` pode apenas criar a estrutura do curso (lições vazias) **ou** usar um fallback com banco aberto (ex.: **Open Trivia DB**).

---

## ✅ O que já existe
- **Frontend (Next.js, tema escuro)**: landing com campo “Crie um curso”, páginas de **Curso** e **Lição**.
- **Backend (Fastify + TypeScript)**: rotas e esquema de banco para **cursos, lições, questões e alternativas**.
- **Endpoints**:
  - `POST /courses` → cria curso; com API configurada, preenche lições com questões.
  - `GET /courses/:slug` → dados do curso + lições.
  - `GET /lessons/:id/questions` → questões de uma lição.
  - `GET /questions/random` → amostra randômica (debug).
- **Importadores (opcional)**: esqueleto para ingerir questões de bancos abertos (ex.: Open Trivia DB) e popular o Postgres.

---

## 🗂️ Estrutura
```
.
├─ web/                 # Next.js (UI)
├─ api/                 # Fastify + PostgreSQL (serviços)
│  ├─ src/db/           # migrações (migrate.ts, migrate_courses.ts)
│  ├─ src/routes/       # questions.ts, courses.ts
│  └─ src/services/     # courseGen.ts (plano + questões com LLM)
└─ docs/                # (opcional) screenshots para o README
```

---

## 🚀 Como rodar local

### Requisitos
- Node.js 18+ (recomendado 20+)
- PostgreSQL 13+
- npm

### 1) API
```bash
cd api
npm i

# .env (exemplo)
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studysprint
OPENAI_API_KEY=sk-xxxxx          # necessário para geração automática (opcional no MVP)
PORT=3333
EOF

# migrações (ordem importa)
npx tsx src/db/migrate.ts
npx tsx src/db/migrate_courses.ts

# subir
npm run dev              # dev
# produção: npm run build && npm start
```

### 2) Web
```bash
cd web
npm i

# .env.local (exemplo)
echo "NEXT_PUBLIC_API_BASE=http://localhost:3333" > .env.local

npm run dev              # dev
# produção: npm run build && npm start -p 3001
```

Abra `http://localhost:3000` (ou a porta configurada no Next).

---

## 🔌 Endpoints principais

### Criar curso
```
POST /courses
Body:
{
  "topic": "Eletrostática básica",
  "questionsPerLesson": 10
}
Response 201:
{ "id": 123, "slug": "eletrostatica-basica" }
```

### Ler curso e lições
```
GET /courses/:slug
GET /lessons/:id/questions
```

### Amostra randômica (debug)
```
GET /questions/random?count=5&difficulty=medium
```

---

## 🧰 Banco de dados (resumo)
```sql
-- perguntas e alternativas
questions(
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  external_id TEXT,
  category TEXT,
  qtype TEXT CHECK (qtype IN ('multiple','boolean','open')) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard','unknown')) NOT NULL DEFAULT 'unknown',
  stem TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (source, external_id)
);

choices(
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  position INTEGER
);

-- cursos e lições
courses(
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

lessons(
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  position INT NOT NULL,
  UNIQUE(course_id, position)
);

lesson_questions(
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, question_id)
);
```

> **Erro comum** `42P01: relation "questions" does not exist`  
> Rode **migrate.ts** antes de **migrate_courses.ts** e confira o `DATABASE_URL` (nome do DB correto).

---

## 🛰️ Deploy (resumo)

### API
- Porta padrão: `3333` (definida por `PORT`).

### Web (Next.js)
- Dev: `npm run dev`  
- Produção: `npm run build && npm run start -p 3001`

### Nginx (reverse proxy, exemplo)
```nginx
server {
  listen 80;
  server_name SEU_DOMINIO_OU_IP;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location /_next/static/ {
    proxy_pass http://127.0.0.1:3001;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3333;
  }
}
```

### HTTPS
- Após apontar um domínio, use `certbot --nginx -d seu.dominio.com` (ou equivalente).

---

## 🔎 Troubleshooting rápido
- **OPENAI_API_KEY não lida**: garanta que o `.env` está no diretório **api/** e que o código faz `import 'dotenv/config'` antes de ler `process.env`.
- **Porta 3001 ocupada**: `sudo lsof -i :3001` (Linux/macOS) ou `netstat -ano | findstr :3001` (Windows), finalize o processo e suba de novo.
- **Sem estilos em produção**: confira o bloco `/_next/static/` no Nginx e se não há `assetPrefix` apontando para `localhost`.

---

## 🧭 Roadmap
- [ ] Conectar o botão **Criar curso** ao `POST /courses` no frontend.
- [ ] Ativar geração automática quando `OPENAI_API_KEY` estiver definida.
- [ ] Fallback com banco aberto (Open Trivia DB) quando não houver API Key.
- [ ] Fluxo **Pomodoro** + **SRS** integrado às lições e ao histórico do aluno.
- [ ] Painel de progresso e métricas.
- [ ] Deploy com systemd + nginx + HTTPS.

---

## 📚 Atribuição (quando usar dados abertos)
Se usar **Open Trivia DB**, inclua no rodapé:
> “Algumas questões fornecidas por **Open Trivia DB (CC BY‑SA 4.0)**.”

Datasets acadêmicos (ARC/QASC/CommonsenseQA etc.) também exigem **atribuição** específica — verifique as licenças antes de redistribuir.

---

## 📝 Licença
Defina a licença do projeto (ex.: MIT). Exemplo:

```
MIT License — Copyright (c) 2025 <Seu Nome>
```
