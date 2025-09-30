import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';

// se seus arquivos são .ts, importe SEM extensão:
import { db } from './db';
import { routes } from './routes';

async function bootstrap() {
  const app = fastify({ logger: true });

  // CORS para o front local; ajuste origin se quiser restringir
  await app.register(cors, { origin: true });

  app.get('/health', async () => ({ ok: true }));

  // se 'routes' recebe (app, db), mantenha assim:
  routes(app, db);

  const port = Number(process.env.PORT ?? 3000);
  try {
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`✅ API on: http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();