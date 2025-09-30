import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Para DBaaS com SSL obrigatório e sem CA local:
  ssl: { rejectUnauthorized: false },
});

// teste opcional no boot:
db.query('select 1').then(()=>console.log('DB OK')).catch(console.error);
