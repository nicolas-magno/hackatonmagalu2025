import Fastify from 'fastify';
import 'dotenv/config';
import { db } from './db.ts';
import { routes } from './routes.ts';
import cors from '@fastify/cors';

const app = Fastify();
await app.register(cors, { origin: true });

app.get('/health', async () => ({ ok: true }));
await routes(app, db);

const port = Number(process.env.PORT || 3000);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log('API on :' + port);
});

