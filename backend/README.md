# NexoMed Backend

> API REST de gestión clínica hospitalaria — Node.js 20 + Express 5 + Prisma

---

## Stack

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Node.js | 20 | Runtime |
| Express | 5 | Framework REST |
| TypeScript | 5.9 | Tipado estático |
| Prisma ORM | 5 | Modelado DB + migraciones |
| PostgreSQL | 15 (Neon) | Base de datos |
| jsonwebtoken | 9 | Tokens JWT |
| bcrypt | 6 | Hash de contraseñas |
| Zod | 4 | Validación de requests |
| swagger-jsdoc | 6 | Documentación OpenAPI |
| axios | 1 | Proxy API CIMA |

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Sincronizar base de datos (Neon)
npx prisma generate
npx prisma migrate deploy

# Poblar con datos de prueba (solo primera vez)
npm run db:seed

# Arrancar en desarrollo (puerto 3000)
npm run dev

# Build de producción
npm run build

# Lint
npm run lint

# Tests
npm run test
```

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL (Neon o local) |
| `JWT_SECRET` | Secreto para firmar tokens JWT (mín. 32 chars) |
| `JWT_EXPIRES_IN` | Duración del token (default: `8h`) |
| `PORT` | Puerto del servidor (default: `3000`) |
| `CORS_ORIGIN` | Orígenes permitidos (separados por coma) |
| `NODE_ENV` | Entorno (`development`, `production`, `test`) |
| `CIMA_BASE_URL` | URL de la API CIMA/AEMPS (default: `https://cima.aemps.es/cima/rest`) |

---

## Estructura

```
src/
├── routes/            ← 11 módulos de rutas con documentación Swagger
├── controllers/       ← 11 controladores (orquestación)
├── services/          ← 5 servicios (lógica de negocio)
├── middlewares/       ← auth.middleware.ts, error.middleware.ts
├── validations/       ← 8 schemas Zod
├── lib/               ← prismaClient, errorHandler, notificationEvents
├── __tests__/         ← 11 archivos de tests (35+ casos)
├── index.ts           ← Entry point
└── swagger.ts         ← Configuración OpenAPI
```

---

## Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login con credenciales |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Datos del usuario autenticado |

### Patients
| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/patients` | Todos |
| GET | `/api/patients/:id` | Todos |
| GET | `/api/patients/search?dni=` | Todos |
| GET | `/api/patients/:id/vitals` | Todos |
| POST | `/api/patients` | DOCTOR, NURSE |
| PUT | `/api/patients/:id` | DOCTOR, NURSE |
| PUT | `/api/patients/:id/discharge` | DOCTOR, NURSE |

### Beds
| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/beds` | Todos |
| PUT | `/api/beds/:id/assign` | DOCTOR, NURSE |
| PUT | `/api/beds/:id/release` | DOCTOR, NURSE |
| PUT | `/api/beds/:id/relocate` | DOCTOR, NURSE |

### Medications
| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/medications/:patientId` | Todos |
| POST | `/api/medications` | DOCTOR |
| PUT | `/api/medications/:id/deactivate` | DOCTOR |
| PUT | `/api/medications/:id/schedule` | DOCTOR, NURSE |
| POST | `/api/medications/schedules/:id/administer` | NURSE, TCAE |

### CareRecords
| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/cares/:patientId` | Todos |
| POST | `/api/cares` | NURSE, TCAE |

### Notifications
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notifications` | Lista del usuario |
| GET | `/api/notifications/stream` | SSE en tiempo real |
| PUT | `/api/notifications/:id/read` | Marcar como leída |
| PUT | `/api/notifications/read-all` | Marcar todas como leídas |

### Incidents
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/incidents` | Todas las incidencias |
| GET | `/api/incidents/:patientId` | Por paciente |
| POST | `/api/incidents` | Registrar incidencia |

### DiagnosticTests
| Método | Ruta | Roles |
|--------|------|-------|
| GET | `/api/tests` | Todos |
| GET | `/api/tests/:patientId` | Por paciente |
| POST | `/api/tests` | DOCTOR, NURSE |
| PUT | `/api/tests/:id/status` | DOCTOR |
| PUT | `/api/tests/:id/result` | DOCTOR, NURSE |

### Drugs (CIMA)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/drugs/search?q=` | Búsqueda de medicamentos |
| GET | `/api/drugs/:nregistro` | Detalle por registro |

### Users
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/nurses` | Lista de enfermeros |

### Schedule
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/schedule` | Cronograma agregado |

---

## Documentación API

Swagger UI disponible en `http://localhost:3000/api/docs` con el servidor corriendo.

---

## Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar un archivo específico
npx jest src/__tests__/auth.test.ts

# Ejecutar con output detallado
npx jest --verbose
```

### Cobertura actual

| Archivo | Casos | Tipo |
|---------|-------|------|
| auth.test.ts | 4 | Integración |
| patients.test.ts | 3 | Integración |
| beds.test.ts | 2 | Integración |
| medications.test.ts | 3 | Integración |
| careRecords.test.ts | 3 | Integración |
| diagnosticTests.test.ts | 2 | Unit (mock) |
| schedule.test.ts | 4 | Unit (mock) |
| notifications.test.ts | 6 | Integración |
| incidents.test.ts | 7 | Integración |
| drugs.test.ts | 5 | Integración |
| users.test.ts | 3 | Integración |

**Total: 11 archivos, ~42 casos de test**

> ⚠️ **Nota:** Si los tests fallan con `clearMocksOnScope is not a function`, ejecutar:
> `npm install ts-jest@latest --save-dev`

---

## Reglas de negocio

1. **Recálculo de horarios**: al cambiar `startTime` de una medicación activa, se recalculan todos los `MedSchedule` pendientes sin alterar los ya administrados.
2. **Notificación obligatoria**: toda prescripción/modificación de medicación por DOCTOR genera Notification para el NURSE asignado.
3. **Anti-duplicidad**: se rechaza un `CareRecord` del mismo `type` para el mismo `patientId` si existe uno en los últimos 15 minutos (409).
4. **Tokens de sesión**: expiración de 8 horas.

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| DOCTOR | dr.garcia@nexomed.es | password123 |
| NURSE | enf.martinez@nexomed.es | password123 |
| NURSE | enf.lopez@nexomed.es | password123 |
| TCAE | tcae.sanchez@nexomed.es | password123 |
