# foco-edu — mini-cursos sob demanda (Pomodoro + SRS)
> **Hackathon MVP** — “Duolingo para *qualquer assunto*”: digite um tema, gere um mini-curso e estude com foco (Pomodoro) + revisão espaçada (SRS).

Este repositório contém **frontend (Next.js)** e **backend (Fastify + PostgreSQL)** de um protótipo funcional.  
A **Home** já aceita um tema (ex.: *Eletrostática básica*) e abre um **curso** com **lições**. No MVP atual as lições são **placeholders**; abaixo explicamos **a inspiração/tema**, **o que já fizemos** e **o que queríamos fazer** (geração automática de cursos/questões, fallback com dados abertos, Pomodoro e SRS integrados).

---

## 🌱 Inspiração & Tema

A inspiração veio de um aluno fictício — vamos chamá‑lo de **Rafa**.

Rafa é esperto, curioso e… **procrastinador profissional**. Ele abre o YouTube para aprender um conceito e cai em 10 vídeos recomendados. Baixa um PDF, mas o WhatsApp vibra. Quando tenta estudar, passa mais tempo **organizando** o estudo do que **estudando**. Resultado: tarefas atrasadas, culpa e ansiedade.

Queríamos responder a uma pergunta simples:

> **“Se Rafa digitar *qualquer assunto*, o sistema consegue montar um plano rápido, com prática imediata, e conduzir foco de verdade?”**

### Como o tema de design reflete isso
- **Tema escuro, minimalista e sem feed** → reduzir ruído visual e social.  
- **Entrada única** (“Crie um curso”) → um gesto = um plano de estudo.  
- **Lições curtas (3–5)** → começo, meio e fim em uma sessão de foco.  
- **Questões logo na sequência** → prática ativa > leitura passiva.  
- **Pomodoro embutido** → o relógio faz o trabalho chato da disciplina.  
- **SRS** → repete o que importa, quando importa, evitando recomeços eternos.

O objetivo é que Rafa **pare de montar planilhas** e simplesmente **estude**, com fricção quase zero e feedback rápido.

---

## ✨ Visão (com geração automática)

Ao clicar **Criar curso**, o backend deverá:

1. Gerar um **plano** de 3–5 lições (títulos, resumos, objetivos).  
2. Para cada lição, criar **10 questões de múltipla escolha** (pt-BR, 4 alternativas, 1 correta, explicação), com dificuldade progressiva.  
3. Salvar tudo no **PostgreSQL** e devolver o `slug` do curso para o frontend abrir.  

Implementação prevista (já esboçada no código):
- `src/services/courseGen.ts` → usa LLM para `buildCoursePlan(topic)` e `generateLessonMCQs(topic, lessonTitle, count)`.
- `POST /courses` → orquestra: cria `course`, `lessons`, persiste `questions/choices` e vincula via `lesson_questions`.

> Sem `OPENAI_API_KEY`, o `POST /courses` pode apenas criar a estrutura do curso (lições vazias) **ou** usar um fallback com banco aberto (ex.: **Open Trivia DB**).

---

## ✅ O que já fizemos (MVP)

- **Frontend (Next.js, tema escuro)**  
  - Landing “Crie um curso” e telas de **Curso** e **Lição** (placeholders).  
  - UI minimalista e responsiva.  

- **Backend (Fastify + TypeScript)**  
  - Migrações de **perguntas/alternativas** e **cursos/lições**.  
  - Endpoints:  
    - `POST /courses` → cria curso; com API configurada, preenche lições com questões.  
    - `GET /courses/:slug` → dados do curso + lições.  
    - `GET /lessons/:id/questions` → questões da lição.  
    - `GET /questions/random` → amostra randômica (debug).

- **Importadores (opcional)**  
  - Esqueleto de ingestão de bancos abertos (ex.: **Open Trivia DB**) para “semear” o banco ou servir como *fallback*.

- **Infra básica de deploy**  
  - Next em produção via `npm run build && npm start -p 3001`.  
  - Nginx como reverse proxy, com bloco específico para `/_next/static/` e `/api`.

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

> **Ordem importa**: rode **`migrate.ts`** antes de **`migrate_courses.ts`**.

---

## 🔌 API (endpoints)

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
```

### Questões de uma lição
```
GET /lessons/:id/questions
```

### Amostra randômica (debug)
```
GET /questions/random?count=5&difficulty=medium
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

Abra `http://localhost:3000`.

---

## 🛰️ Deploy (Nginx, systemd)

### Next.js como serviço
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

### API como serviço
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

> HTTPS: depois de apontar o domínio, `certbot --nginx -d seu.dominio.com`.

---

## 🧪 Troubleshooting rápido
- **`42P01: relation "questions" does not exist`** → rode `migrate.ts` antes de `migrate_courses.ts` e confira `DATABASE_URL`.  
- **`EADDRINUSE: :3001`** → porta ocupada; `lsof -i :3001` (Linux/macOS) ou `netstat -ano | findstr :3001` (Windows).  
- **Site “sem estilo” em prod** → inclua o bloco `/_next/static/` no Nginx e evite `assetPrefix` apontando para `localhost`.  
- **`OPENAI_API_KEY` não lida** → `.env` na pasta **api/** e `import 'dotenv/config'`. Teste:  
  `npx tsx -e "import 'dotenv/config'; console.log(!!process.env.OPENAI_API_KEY)"` → deve imprimir `true`.

---

## 🧭 Roadmap
- [ ] Conectar o botão **Criar curso** ao `POST /courses`.  
- [ ] Ativar geração automática via `OPENAI_API_KEY`.  
- [ ] Fallback com **Open Trivia DB** quando não houver API Key.  
- [ ] **SRS** (Leitner → SM‑2) com histórico por usuário.  
- [ ] **Pomodoro** integrado a tarefas/tempo por lição.  
- [ ] Painel de progresso e métricas.  
- [ ] Testes automatizados + CI.  
- [ ] Internacionalização e acessibilidade.  
- [ ] Observabilidade (logs/metrics).

---

## 📚 Licenças e atribuição
- Código: defina a licença do projeto (ex.: MIT).  
- Dados abertos (quando usados):  
  - **Open Trivia DB** — CC BY-SA 4.0 (exige atribuição/share‑alike).  
  - Outros datasets (ARC, QASC etc.): verificar licença; incluir créditos.  
- Sugestão de rodapé:  
  > “Algumas questões fornecidas por **Open Trivia DB (CC BY-SA 4.0)**.”

---

**Equipe & propósito** — Educação prática, rápida e sem distrações.  
**A missão** é ajudar pessoas como o Rafa a saírem da inércia e acumularem pequenas vitórias todos os dias.
