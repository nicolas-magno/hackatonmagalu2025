import { Pool } from 'pg';

const useSSL = process.env.DB_SSL === 'true';
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Para DBaaS com SSL obrigatório e sem CA local:
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

// teste opcional no boot:
db.query('select 1').then(()=>console.log('DB OK')).catch(console.error);
