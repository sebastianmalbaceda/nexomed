# BACKEND — Estado del Proyecto

> **Estado actual:** Backend completo. Solo pendiente: tests de integración.
> Última actualización: Abril 2026

---

## ✅ Completado

| Componente | Archivos | Descripción |
|---|---|---|
| **Services** | `services/*.ts` (4 archivos) | Notificaciones, recálculo horarios, anti-duplicidad, CIMA |
| **Controllers** | `controllers/*.ts` (9 archivos) | Con validación Zod + errores Prisma específicos |
| **Validaciones** | `validations/*.ts` (6 archivos) | Zod schemas para todos los endpoints POST/PUT |
| **Middleware** | `middlewares/auth.middleware.ts` | JWT auth + role guard |
| **Error Handler** | `lib/errorHandler.ts` | Mapeo de errores Prisma a HTTP status codes |
| **Routes** | `routes/*.ts` (9 archivos) | Con documentación Swagger `@swagger` |
| **Swagger** | `swagger.ts` + `/api/docs` | Documentación interactiva de toda la API |
| **Prisma Schema** | `prisma/schema.prisma` | Modelo completo con todas las relaciones |
| **Seed** | `prisma/seed.ts` | Datos de prueba idempotentes |
| **Index** | `index.ts` | Server Express con todas las rutas + Swagger |

---

## 📋 Pendiente: Tests de Integración

**Responsable:** Equipo de backend (Raúl / Irene / Cristina)
**Guía completa:** Ver `TESTING_GUIDE.md`

Solo hay que crear archivos nuevos en `src/__tests__/`. **No tocar nada existente.**

Tests mínimos requeridos:
- [ ] `auth.test.ts` — login, validación, credenciales
- [ ] `patients.test.ts` — lista, detalle, permisos
- [ ] `beds.test.ts` — mapa de camas, asignación
- [ ] `medications.test.ts` — prescripción, validación, permisos
- [ ] `careRecords.test.ts` — crear, anti-duplicidad (409)

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
| **Auth** | `POST /login`, `GET /me` |
| **Patients** | `GET /`, `GET /:id`, `POST /`, `PUT /:id/discharge` |
| **Beds** | `GET /`, `PUT /:id/assign`, `PUT /:id/release` |
| **Medications** | `GET /:patientId`, `POST /`, `PUT /:id/deactivate`, `PUT /:id/schedule`, `POST /schedules/:scheduleId/administer` |
| **CareRecords** | `GET /:patientId`, `POST /` (anti-dup 15 min) |
| **Notifications** | `GET /`, `PUT /:id/read`, `PUT /read-all` |
| **Incidents** | `GET /:patientId`, `POST /` |
| **DiagnosticTests** | `GET /:patientId`, `POST /`, `PUT /:id/result` |
| **Drugs (CIMA)** | `GET /search?q=`, `GET /:nregistro` |
