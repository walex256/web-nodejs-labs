# Dockerfile для Node.js v24 (Fastify + Статика)
FROM node:24-alpine

# production (по умолчанию, сервер) — только основные зависимости;
# development (docker-compose.local.yml) — ещё и devDependencies (nodemon)
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# --- Сборка зависимостей ---
# Сначала копируем package.json и package-lock.json,
# чтобы Docker кешировал слой с node_modules
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN if [ "$NODE_ENV" = "development" ]; then npm ci; else npm ci --omit=dev; fi

# --- Копирование всего остального кода ---
WORKDIR /app
COPY backend/ ./backend
COPY public/ ./public

# Рабочая директория для запуска
WORKDIR /app/backend

EXPOSE 3000
CMD ["npm", "start"]
