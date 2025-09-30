# foco-duo — mini‑cursos sob demanda (Pomodoro + SRS)
> **Hackathon MVP** — “Duolingo para *qualquer assunto*”: digite um tema, gere um mini‑curso e estude com foco (Pomodoro) + revisão espaçada (SRS).

Este repositório contém **frontend (Next.js)** e **backend (Fastify + PostgreSQL)** de um protótipo funcional.  
A **Home** já aceita um tema (ex.: *Eletrostática básica*) e abre um **curso** com **lições**. No MVP atual as lições são **placeholders**; abaixo explicamos **o que já fizemos** e **o que queríamos fazer** (design da geração automática com LLM, fallback com dados abertos, Pomodoro e SRS integrados).

---

## 🧭 Sumário
- [Visão do Produto](#visão-do-produto)
- [O que já fizemos (MVP)](#o-que-já-fizemos-mvp)
- [O que queríamos fazer (Design detalhado)](#o-que-queríamos-fazer-design-detalhado)
  - [Geração automática de cursos e questões](#geração-automática-de-cursos-e-questões)
  - [Fallback com banco aberto (Open Trivia DB)](#fallback-com-banco-aberto-open-trivia-db)
  - [SRS (revisão espaçada) proposto](#srs-revisão-espaçada-proposto)
  - [Pomodoro proposto](#pomodoro-proposto)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [API (endpoints)](#api-endpoints)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy (Nginx, systemd)](#deploy-nginx-systemd)
- [Troubleshooting rápido](#troubleshooting-rápido)
- [Roadmap](#roadmap)
- [Licenças e atribuição](#licenças-e-atribuição)

---

## Visão do Produto
1. **Entrada simples**: o aluno digita *qualquer assunto* (“matemática financeira”, “Ampère”, “história do Brasil século XIX”).  
2. **Mini‑curso**: sistema cria 3–5 lições progressivas (Fundamentos → Prática → Desafios).  
3. **Questões MCQ**: cada lição vem com ~10 questões (4 alternativas, 1 correta, explicação), em **pt‑BR**.  
4. **Estudo com ritmo**: **Pomodoro** (25/5 por padrão) + **SRS** (reagendamento baseado em acertos/erros).  
5. **Acompanhamento**: progresso por lição, acurácia, tempo em foco.

> 💡 **Motivação**: permitir ao aluno transformar *qualquer curiosidade* em um plano breve e objetivo de estudo, com prática imediata.

---

## O que já fizemos (MVP)
- **Frontend (Next.js)**  
  - Landing page com campo *“Crie um curso”* + UI escura, responsiva.  
  - Páginas para **Curso** e **Lições** (slots “Lição 1, 2, 3…”).  
- **Backend (Fastify + TypeScript)**  
  - Migrações de **perguntas/alternativas** e **cursos/lições**.  
  - Endpoints prontos (vide seção API).  
  - Esqueleto de serviço `courseGen.ts` prevendo uso de **LLM** para gerar plano + MCQs.  
- **Importadores**  
  - Esqueleto para ingestão de dados abertos (ex.: **Open Trivia DB**) como *seed* ou *fallback*.  
- **Infra básica**  
  - Deploy de Next em produção via `npm run build && npm start -p 3001`.  
  - Reverse proxy Nginx com rota para estáticos `/_next/static/` e roteamento `/api`.

> ⚠️ **Status:** criação de curso já existe; **preenchimento automático das lições** é conectado quando `OPENAI_API_KEY` estiver definido (ou via fallback).

---

## O que queríamos fazer (Design detalhado)

### Geração automática de cursos e questões
Quando o aluno clicar **Criar curso**:
1. **Plano do curso** (3–5 lições)  
   - `buildCoursePlan(topic)` pede ao LLM um JSON com `title`, `summary`, `objectives` por lição.  
2. **Questões por lição**  
   - `generateLessonMCQs(topic, lessonTitle, count)` retorna um array de MCQs:  
     ```json
     {
       "stem": "enunciado",
       "choices": [
         {"text":"A","is_correct":false},
         {"text":"B","is_correct":true},
         {"text":"C","is_correct":false},
         {"text":"D","is_correct":false}
       ],
       "explanation":"por que a correta está certa",
       "difficulty":"easy|medium|hard"
     }
     ```
3. **Persistência**  
   - `POST /courses` orquestra: cria `course` e `lessons`, salva `questions`/`choices`, vincula em `lesson_questions` e devolve `{id, slug}`.  
4. **Render**  
   - Front abre `/curso/[slug]` e lista lições **já preenchidas**; página de lição mostra as MCQs.

> 🔐 **Variáveis**: `OPENAI_API_KEY` no `.env` do backend (`api/`).  
> 🧪 **Modelos**: usar um LLM de custo baixo para MCQs e outro para revisões finas (se necessário).

### Fallback com banco aberto (Open Trivia DB)
- Se `OPENAI_API_KEY` estiver ausente ou a geração falhar, o sistema pode:  
  **(a)** criar o *esqueleto* do curso (lições vazias), **ou**  
  **(b)** importar um lote relacionado de um **banco aberto** (ex.: Open Trivia DB) e preencher a lição.  
- Todos os itens ficam com `source='opentdb'` e **atribuição** no rodapé.

### SRS (revisão espaçada) proposto
- **Modelo simples (Leitner)** para o MVP:  
  - Acertou: cartão sobe de caixa (reaparece com maior intervalo).  
  - Errou: volta para a primeira caixa (revisão cedo).  
- **Evolução**: SM‑2/SM‑5 (Anki) com *ease factor*, *interval* e *repetition*.  
- **Persistência**: tabela `reviews` (proposta) com `user_id`, `question_id`, `grade`, `next_due_at`.

### Pomodoro proposto
- Ciclos **25/5** configuráveis → **25 min** foco, **5 min** pausa.  
- Contador local (frontend) com eventos enviados ao backend para métricas.  
- Estatísticas por dia (tempo em foco, sessões concluídas, tarefas ligadas à lição).

---

## Arquitetura
```
.
├─ web/                      # Next.js (UI)
│  ├─ app/                   # páginas (Home, Curso, Lição)
│  └─ components/            # UI base
├─ api/                      # Fastify + PostgreSQL
│  ├─ src/db/                # migrações
│  │  ├─ migrate.ts          # questions/choices
│  │  └─ migrate_courses.ts  # courses/lessons/lesson_questions
│  ├─ src/routes/            # endpoints
│  │  ├─ questions.ts
│  │  └─ courses.ts
│  └─ src/services/
│     └─ courseGen.ts        # OpenAI (plano + MCQs)
└─ docs/                     # screenshots p/ README
```

**Fluxo:** `web → POST /courses → (LLM ou fallback) → persistência → GET /courses/:slug → render`.

---

## Banco de Dados
### Tabelas principais
```sql
-- perguntas/alternativas
questions(
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,              -- 'generated', 'opentdb', 'manual'...
  external_id TEXT,
  category TEXT,
  qtype TEXT CHECK (qtype IN ('multiple','boolean','open')) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard','unknown')) NOT NULL DEFAULT 'unknown',
  stem TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(source, external_id)
);

choices(
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  position INTEGER
);

-- cursos/lições
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

> 🧩 **Ordem das migrações importa**: rode **`migrate.ts`** antes de **`migrate_courses.ts`**.

---

## API (endpoints)

### Criar curso
```
POST /courses
Body:
{
  "topic": "Eletrostática básica",
  "questionsPerLesson": 10
}
→ 201 { "id": 123, "slug": "eletrostatica-basica" }
```

### Ler curso + lições
```
GET /courses/:slug
→ { "course": {...}, "lessons": [ ... ] }
```

### Listar questões de uma lição
```
GET /lessons/:id/questions
→ [ { "id": 1, "stem": "...", "choices": [...], "explanation": "...", "difficulty": "medium" }, ... ]
```

### Amostra randômica (debug)
```
GET /questions/random?count=5&difficulty=medium&category=Física
```

---

## Como rodar localmente
### Requisitos
- Node 18+ (recomendado 20+)  
- PostgreSQL 13+  
- npm

### 1) API
```bash
cd api
npm i

# .env (exemplo)
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studysprint
OPENAI_API_KEY=sk-xxxxx             # opcional para o MVP; necessário p/ geração automática
PORT=3333
EOF

# migrações
npx tsx src/db/migrate.ts
npx tsx src/db/migrate_courses.ts

npm run dev          # ou: npm run build && npm start
```

### 2) Web
```bash
cd web
npm i
echo "NEXT_PUBLIC_API_BASE=http://localhost:3333" > .env.local
npm run dev          # produção: npm run build && npm run start -p 3001
```

Acesse `http://localhost:3000`.

---

## Deploy (Nginx, systemd)
### Next.js como serviço (exemplo)
`/etc/systemd/system/focoduo-web.service`
```ini
[Unit]
Description=Next.js foco-duo
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/repo/web
Environment=PORT=3001
ExecStart=/usr/bin/npm run start -- -p 3001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Fastify API como serviço
`/etc/systemd/system/focoduo-api.service`
```ini
[Unit]
Description=API foco-duo
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/repo/api
Environment=PORT=3333
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Nginx (reverse proxy)
```nginx
server {
  listen 80;
  server_name SEU_DOMINIO_OU_IP;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
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

> 🔒 Para HTTPS, use `certbot --nginx -d seu.dominio.com` após apontar DNS.

---

## Troubleshooting rápido
- **`42P01: relation "questions" does not exist`**  
  → Rode `npx tsx src/db/migrate.ts` antes de `migrate_courses.ts`; confira `DATABASE_URL`.
- **`EADDRINUSE: :3001`**  
  → Porta ocupada. Linux/macOS: `lsof -i :3001` → mate o processo. Windows: `netstat -ano | findstr :3001`.
- **Site “sem estilo” em prod**  
  → Falta proxy de `/_next/static/` no Nginx **ou** `assetPrefix` apontando para `localhost`. Use o bloco acima.
- **`OPENAI_API_KEY` não lida**  
  → Confira `.env` no diretório **api/** e `import 'dotenv/config'` antes de ler `process.env`.  
  → Teste: `npx tsx -e "import 'dotenv/config'; console.log(!!process.env.OPENAI_API_KEY)"` → deve imprimir `true`.

---

## Roadmap
- [ ] Conectar botão **Criar curso** do frontend ao `POST /courses`.
- [ ] Ativar geração automática via `OPENAI_API_KEY`.
- [ ] Fallback com **Open Trivia DB** (seed/tema genérico).
- [ ] Implementar **SRS** (Leitner → SM‑2) com histórico por usuário.
- [ ] Pomodoro integrado a tarefas/tempo por lição.
- [ ] Painel de progresso (acertos, tempo, lições concluídas).
- [ ] Testes automatizados (vitest) e CI.
- [ ] Internacionalização (pt‑BR/en).
- [ ] Acessibilidade (atalhos, ARIA, contraste).
- [ ] Observabilidade (logs estruturados, métricas básicas).

---

## Licenças e atribuição
- Código do projeto: escolha e defina uma licença (ex.: MIT).  
- Bancos abertos (se usados):
  - **Open Trivia DB** — CC BY‑SA 4.0 (requer atribuição/share‑alike).  
  - Outros datasets acadêmicos (ARC, QASC etc.): verificar licença e incluir créditos.  
- Sugerimos exibir no rodapé:  
  > “Algumas questões fornecidas por **Open Trivia DB (CC BY‑SA 4.0)**.”

---

**Dúvidas, sugestões ou bugs?** Abra uma issue.  
**Equipe:** Design & Eng. — foco em aprendizado eficiente com geração automática e prática estruturada.
