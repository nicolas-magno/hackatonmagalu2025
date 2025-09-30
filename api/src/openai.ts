// api/src/openai.ts
import OpenAI from 'openai';

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  throw new Error('DEEPSEEK_API_KEY ausente em api/.env');
}

const oa = new OpenAI({
  apiKey,
  baseURL: 'https://api.deepseek.com', // ou 'https://api.deepseek.com/v1'
});


export default oa;