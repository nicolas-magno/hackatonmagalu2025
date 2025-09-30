import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { routes } from './routes';
import { db } from './db';

const app = fastify({ logger: true });

await app.register(cors, {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite dev
});

app.get('/health', async () => ({ ok: true }));
routes(app, db);

const port = Number(process.env.PORT || 3000);
await app.listen({ port, host: '0.0.0.0' });
