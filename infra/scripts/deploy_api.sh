#!/usr/bin/env bash
set -euo pipefail
# Executar direto na VM (Ubuntu)
cd ~/studysprint-duo/api
cp .env.example .env
npm i
npx ts-node src/server.ts
# Ou pm2:
# pm2 start "npx ts-node src/server.ts" --name duo-api && pm2 save
