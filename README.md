# LINEAR_CLONE — Backend API

API REST para el clon de Linear. Construida con Express 5 + MongoDB + TypeScript.

**API en producción:** https://linearclonebackend-production.up.railway.app/api

## Stack

Node.js · Express 5 · TypeScript · MongoDB Atlas · Mongoose · JWT · Zod · Vitest

## Setup local

```bash
npm install
cp .env.example .env
# editar .env con MONGODB_URI y JWT_SECRET
npm run dev
# http://localhost:3001
```

Variables de entorno:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/linear_clone_dev
JWT_SECRET=string_aleatorio_minimo_32_chars
JWT_EXPIRES_IN=7d
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Scripts

```bash
npm run dev      # servidor con hot-reload
npm run build    # compilar TypeScript
npm start        # iniciar build de producción
npm test         # tests de integración (8 tests, MongoMemoryServer)
```

## Endpoints

**Auth** (rate-limited)
- `POST /api/auth/register`
- `POST /api/auth/login`

**Projects** (requiere JWT)
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`

**Tasks** (requiere JWT)
- `GET /api/tasks?projectId=:id`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

## Frontend

Repositorio del frontend: https://github.com/aicreationcl/linear_clone_front
