import axios from "axios";
export const api = axios.create({
  // Enquanto não houver backend, usamos /api (mocks locais via Next)
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
});
