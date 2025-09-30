import OpenAI from 'openai';
export const oa = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
