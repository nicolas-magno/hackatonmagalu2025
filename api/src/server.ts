import Fastify from 'fastify';
import cors from 'cors';
import 'dotenv/config';
import { db } from './db.js';
import { routes } from './routes.js';

const app = Fastify();
app.use(cors());
app.get('/health', async ()=> ({ ok: true }));
routes(app, db);

const port = Number(process.env.PORT || 3000);
app.listen({ port, host: '0.0.0.0' }).then(()=> console.log('API on :' + port));
