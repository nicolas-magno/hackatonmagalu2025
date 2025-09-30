-- SEED: curso pronto para clonar (sem IA)
CREATE TABLE IF NOT EXISTS seed_course(
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  language TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS seed_lesson(
  id BIGSERIAL PRIMARY KEY,
  seed_course_id BIGINT REFERENCES seed_course(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  order_index INT NOT NULL
);
CREATE TABLE IF NOT EXISTS seed_card(
  id BIGSERIAL PRIMARY KEY,
  seed_course_id BIGINT REFERENCES seed_course(id) ON DELETE CASCADE,
  seed_lesson_id BIGINT REFERENCES seed_lesson(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back  TEXT NOT NULL
);

TRUNCATE seed_card, seed_lesson, seed_course RESTART IDENTITY;

INSERT INTO seed_course(topic, language) VALUES ('Derivadas', 'pt-BR'); -- id = 1

-- Lição 1
INSERT INTO seed_lesson(seed_course_id, title, content_md, order_index) VALUES
(1, 'Derivadas: conceitos básicos',
'### O que é derivada?
- Taxa de variação instantânea
- Inclinação da tangente
- Notação: f''(x), dy/dx

**Regras base**
- c'' = 0
- (x^n)'' = n·x^(n-1)

> Check-out: anote 1–2 ideias em 30s após o foco.', 0);

INSERT INTO seed_card(seed_course_id, seed_lesson_id, front, back) VALUES
(1,1,'Defina derivada em 1 frase','Taxa de variação instantânea de uma função num ponto.'),
(1,1,'Interpretação geométrica','Inclinação da reta tangente ao gráfico em x.'),
(1,1,'Derivada de x^n','(x^n)'' = n·x^(n-1)'),
(1,1,'Derivada de constante','0');

-- Lição 2
INSERT INTO seed_lesson(seed_course_id, title, content_md, order_index) VALUES
(1,'Regras de derivação',
'### Regras compostas
- (uv)'' = u''v + uv''
- (u/v)'' = (u''v - uv'')/v^2
- (f(g(x)))'' = f''(g(x))·g''(x)

**Funções usuais**
- (e^x)'' = e^x
- (ln x)'' = 1/x
- (sen x)'' = cos x ; (cos x)'' = -sen x', 1);

INSERT INTO seed_card(seed_course_id, seed_lesson_id, front, back) VALUES
(1,2,'Regra do produto','(uv)'' = u''v + uv'''),
(1,2,'Regra do quociente','(u/v)'' = (u''v - uv'')/v^2'),
(1,2,'Regra da cadeia','(f(g(x)))'' = f''(g(x))·g''(x)'),
(1,2,'Derivada de ln x','1/x');

-- Lição 3
INSERT INTO seed_lesson(seed_course_id, title, content_md, order_index) VALUES
(1,'Aplicações e erros comuns',
'### Aplicações
- Velocidade instantânea
- Tangente em um ponto
- Otimização (máximos e mínimos)

**Erros comuns**
- Esquecer a cadeia
- Erro de sinal em trigonométricas

> Dica Pomodoro: 25:00 foco + 5:00 pausa.', 2);

INSERT INTO seed_card(seed_course_id, seed_lesson_id, front, back) VALUES
(1,3,'Aplicação física clássica','Velocidade = derivada da posição.'),
(1,3,'Tangente via derivada','f''(x0) é a inclinação; reta: y = f''(x0)(x-x0)+f(x0).'),
(1,3,'Otimização','Zerar f''(x) e analisar sinal/segunda derivada.'),
(1,3,'Erro comum','Esquecer regra da cadeia.');