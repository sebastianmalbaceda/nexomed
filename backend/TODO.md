# BACKEND — Estado del Proyecto

> **Estado actual:** Backend completo. Tests en progreso (21/25+ tests creados).
> Última actualización: Mayo 2026

---

## ✅ Completado

| Componente | Archivos | Descripción |
|---|---|---|
| **Services** | `services/*.ts` (5 archivos) | Notificaciones, recálculo horarios, anti-duplicidad, CIMA, schedule |
| **Controllers** | `controllers/*.ts` (11 archivos) | Con validación Zod + errores Prisma específicos |
| **Validaciones** | `validations/*.ts` (8 archivos) | Zod schemas para todos los endpoints POST/PUT |
| **Middleware** | `middlewares/auth.middleware.ts` + `error.middleware.ts` | JWT auth + role guard + error handler |
| **Error Handler** | `lib/errorHandler.ts` | Mapeo de errores Prisma a HTTP status codes |
| **Routes** | `routes/*.ts` (11 archivos) | Con documentación Swagger `@swagger` |
| **Swagger** | `swagger.ts` + `/api/docs` | Documentación interactiva de toda la API |
| **Prisma Schema** | `prisma/schema.prisma` | Modelo completo con todas las relaciones + PatientStatus enum |
| **Seed** | `prisma/seed.ts` | Datos de prueba idempotentes |
| **Index** | `index.ts` | Server Express 5 con todas las rutas + Swagger |
| **Tests** | `__tests__/*.test.ts` (7 archivos, 21 tests) | auth, patients, beds, medications, careRecords, diagnosticTests, schedule |

---

## 📋 Pendiente: Tests de Integración

**Guía completa:** Ver `TESTING_GUIDE.md`

Tests ya creados (✅):
- [x] `auth.test.ts` — 4 tests (login, validación, credenciales)
- [x] `patients.test.ts` — 3 tests (lista, detalle, permisos)
- [x] `beds.test.ts` — 2 tests (mapa de camas, asignación)
- [x] `medications.test.ts` — 3 tests (prescripción, validación, permisos)
- [x] `careRecords.test.ts` — 3 tests (crear, anti-duplicidad 409)
- [x] `diagnosticTests.test.ts` — 2 tests (unit, mock Prisma)
- [x] `schedule.test.ts` — 4 tests (unit, mock Prisma)

Tests pendientes (❌):
- [ ] `notifications.test.ts` — get, mark-as-read, mark-all-read, SSE
- [ ] `incidents.test.ts` — get, get-by-patient, create
- [ ] `drugs.test.ts` — CIMA proxy search y details
- [ ] `users.test.ts` — get nurses list

---

## 📦 Dependencias instaladas

### Producción
- `@prisma/client` — ORM
- `bcrypt` — Hash de contraseñas
- `cors` — Política CORS
- `dotenv` — Variables de entorno
- `express` — Framework REST
- `jsonwebtoken` — Tokens JWT
- `axios` — HTTP client (proxy CIMA)
- `zod` — Validación de schemas
- `swagger-jsdoc` — Generador de documentación OpenAPI
- `swagger-ui-express` — UI interactiva de Swagger

### Desarrollo
- `@types/bcrypt`, `@types/cors`, `@types/express`, `@types/jsonwebtoken`, `@types/node`
- `@types/swagger-jsdoc`, `@types/swagger-ui-express`
- `jest`, `supertest`, `ts-jest`
- `nodemon`, `prisma`, `ts-node`, `typescript`

---

## 🚀 Comandos

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Compilar TypeScript
npm run test         # Ejecutar tests (Jest)
npm run db:seed      # Poblar con datos de prueba
npm run db:studio    # Abrir Prisma Studio
```

## 🔑 Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| DOCTOR | dr.garcia@nexomed.es | password123 |
| NURSE | enf.martinez@nexomed.es | password123 |
| NURSE | enf.lopez@nexomed.es | password123 |
| TCAE | tcae.sanchez@nexomed.es | password123 |

---

## 📡 Endpoints

Ver documentación interactiva en `http://localhost:3000/api/docs` (con servidor corriendo).

### Resumen rápido

| Módulo | Endpoints |
|---|---|
| **Auth** | `POST /login`, `POST /logout`, `GET /me` |
| **Patients** | `GET /`, `GET /:id`, `GET /search?dni=`, `GET /:id/vitals`, `GET /:id/care-records`, `GET /:id/incidents`, `POST /`, `PUT /:id`, `PUT /:id/discharge` |
| **Beds** | `GET /`, `PUT /:id/assign`, `PUT /:id/release`, `PUT /:id/relocate` |
| **Medications** | `GET /:patientId`, `POST /`, `PUT /:id/deactivate`, `PUT /:id/schedule`, `POST /schedules/:scheduleId/administer` |
| **CareRecords** | `GET /:patientId`, `POST /` (anti-dup 15 min) |
| **Notifications** | `GET /`, `GET /stream` (SSE), `PUT /:id/read`, `PUT /read-all` |
| **Incidents** | `GET /`, `GET /:patientId`, `POST /` |
| **DiagnosticTests** | `GET /`, `GET /:patientId`, `POST /`, `PUT /:id/status`, `PUT /:id/result` |
| **Drugs (CIMA)** | `GET /search?q=`, `GET /:nregistro` |
| **Users** | `GET /nurses` |
| **Schedule** | `GET /` |
