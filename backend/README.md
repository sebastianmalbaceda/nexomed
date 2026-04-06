# NexoMed Backend

API REST para gestión clínica hospitalaria — Proyecto LIS UAB 2026.

## Stack

- Node.js 20 + Express 5 + TypeScript
- PostgreSQL + Prisma ORM
- JWT + bcrypt
- Zod (validación)
- Swagger (documentación)

## Setup

```bash
npm install
cp .env.example .env  # si no existe
npm run db:seed       # poblar datos de prueba
npm run dev           # servidor en puerto 3001
```

## Documentación API

Con el servidor corriendo: `http://localhost:3001/api/docs`

## Tests

```bash
npm run test
```

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| DOCTOR | dr.garcia@nexomed.es | password123 |
| NURSE | enf.martinez@nexomed.es | password123 |
| TCAE | tcae.sanchez@nexomed.es | password123 |
