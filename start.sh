#!/bin/bash
set -e

echo "[STARTUP] Starting FastAPI AI Backend on port 9000..."
python run.py 9000 &
BACKEND_PID=$!

echo "[STARTUP] Waiting for backend to be ready on port 9000..."
for i in $(seq 1 30); do
  if curl -s http://127.0.0.1:9000/api/health > /dev/null 2>&1; then
    echo "[STARTUP] Backend is online and healthy!"
    break
  fi
  sleep 1
done

APP_PORT="${PORT:-8080}"
echo "[STARTUP] Starting Next.js Studio on port $APP_PORT..."
cd /app/frontend
exec npx next start -p "$APP_PORT" -H 0.0.0.0
