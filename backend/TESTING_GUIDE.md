# BACKEND — Guía de Testing para el Equipo

> **IMPORTANTE:** Esta es la ÚNICA tarea pendiente para completar el backend.
> El resto del backend está 100% funcional y probado. NO toques nada fuera de `src/__tests__/`.

---

## 📌 Qué NO tocar

| Carpeta/Archivo | Razón |
|---|---|
| `src/controllers/` | Ya funcionales con validación y errores |
| `src/routes/` | Ya documentadas con Swagger |
| `src/services/` | Lógica de negocio completa |
| `src/validations/` | Schemas Zod completos |
| `src/middlewares/` | Auth + role guard funcionales |
| `src/lib/` | PrismaClient + errorHandler |
| `src/index.ts` | Server configurado |
| `src/swagger.ts` | Documentación Swagger |
| `prisma/schema.prisma` | Modelo de datos completo |
| `prisma/seed.ts` | Datos de prueba funcionales |

**Solo crea archivos nuevos en `src/__tests__/`**. No modifiques nada existente.

---

## 🛠️ Setup

Las dependencias de test ya están instaladas (`jest`, `supertest`, `ts-jest`). Solo necesitas configurar Jest si no existe:

```bash
# Si no existe jest.config.js, créalo en la raíz del backend:
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
```

---

## 📋 Tests a implementar

### 1. Auth (`src/__tests__/auth.test.ts`)

```typescript
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('debe devolver 400 si el email es inválido', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'no-es-email', password: 'test' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('debe devolver 400 si falta la contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });

    it('debe devolver 401 con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('debe devolver token con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toHaveProperty('role');
    });
  });
});
```

### 2. Pacientes (`src/__tests__/patients.test.ts`)

```typescript
import request from 'supertest';
import express from 'express';
import patientRoutes from '../routes/patients.routes';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

let token: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
  token = loginRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Patient Endpoints', () => {
  describe('GET /api/patients', () => {
    it('debe devolver lista de pacientes con auth', async () => {
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debe devolver 401 sin token', async () => {
      const res = await request(app).get('/api/patients');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('debe devolver 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/patients/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
```

### 3. Camas (`src/__tests__/beds.test.ts`)

```typescript
import request from 'supertest';
import express from 'express';
import bedRoutes from '../routes/beds.routes';
import authRoutes from '../routes/auth.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/beds', bedRoutes);

let token: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
  token = loginRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Bed Endpoints', () => {
  describe('GET /api/beds', () => {
    it('debe devolver todas las camas ordenadas', async () => {
      const res = await request(app)
        .get('/api/beds')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('PUT /api/beds/:id/assign', () => {
    it('debe devolver 400 si falta patientId', async () => {
      const beds = await request(app)
        .get('/api/beds')
        .set('Authorization', `Bearer ${token}`);
      const freeBed = beds.body.find((b: any) => !b.patient);
      
      if (freeBed) {
        const res = await request(app)
          .put(`/api/beds/${freeBed.id}/assign`)
          .set('Authorization', `Bearer ${token}`)
          .send({});
        expect(res.status).toBe(400);
      }
    });
  });
});
```

### 4. Medicación (`src/__tests__/medications.test.ts`)

```typescript
import request from 'supertest';
import express from 'express';
import medicationRoutes from '../routes/medications.routes';
import authRoutes from '../routes/auth.routes';
import patientRoutes from '../routes/patients.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);

let token: string;
let patientId: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dr.garcia@nexomed.es', password: 'password123' });
  token = loginRes.body.token;

  const patientsRes = await request(app)
    .get('/api/patients')
    .set('Authorization', `Bearer ${token}`);
  patientId = patientsRes.body[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Medication Endpoints', () => {
  describe('GET /api/medications/:patientId', () => {
    it('debe devolver medicación activa del paciente', async () => {
      const res = await request(app)
        .get(`/api/medications/${patientId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/medications', () => {
    it('debe devolver 400 si faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${token}`)
        .send({ patientId });
      expect(res.status).toBe(400);
    });

    it('debe devolver 403 si no es DOCTOR', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'enf.martinez@nexomed.es', password: 'password123' });
      const nurseToken = loginRes.body.token;

      const res = await request(app)
        .post('/api/medications')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientId,
          drugName: 'Test',
          dose: '10mg',
          route: 'oral',
          frequencyHrs: 8,
          startTime: new Date().toISOString()
        });
      expect(res.status).toBe(403);
    });
  });
});
```

### 5. Cuidados — Anti-duplicidad (`src/__tests__/careRecords.test.ts`)

```typescript
import request from 'supertest';
import express from 'express';
import careRoutes from '../routes/careRecords.routes';
import authRoutes from '../routes/auth.routes';
import patientRoutes from '../routes/patients.routes';
import { prisma } from '../lib/prismaClient';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/cares', careRoutes);

let nurseToken: string;
let patientId: string;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'enf.martinez@nexomed.es', password: 'password123' });
  nurseToken = loginRes.body.token;

  const patientsRes = await request(app)
    .get('/api/patients')
    .set('Authorization', `Bearer ${nurseToken}`);
  patientId = patientsRes.body[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('CareRecord Endpoints', () => {
  describe('POST /api/cares', () => {
    it('debe crear un cuidado correctamente', async () => {
      const res = await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          patientId,
          type: 'test_unico_' + Date.now(),
          value: '37.5',
          unit: '°C'
        });
      expect(res.status).toBe(201);
    });

    it('debe devolver 409 por duplicado en menos de 15 min', async () => {
      const uniqueType = 'test_dup_' + Date.now();
      
      // Primer registro
      await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({ patientId, type: uniqueType, value: '37.0' });

      // Segundo registro del mismo tipo (debe fallar)
      const res = await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({ patientId, type: uniqueType, value: '37.5' });
      
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('15 minutos');
    });

    it('debe devolver 403 si es TCAE intentando crear (debería funcionar)', async () => {
      // TCAE SÍ puede crear care records
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'tcae.sanchez@nexomed.es', password: 'password123' });
      const tcaeToken = loginRes.body.token;

      const res = await request(app)
        .post('/api/cares')
        .set('Authorization', `Bearer ${tcaeToken}`)
        .send({
          patientId,
          type: 'test_tcae_' + Date.now(),
          value: '120/80',
          unit: 'mmHg'
        });
      expect(res.status).toBe(201);
    });
  });
});
```

---

## 🚀 Ejecutar tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar un archivo específico
npx jest src/__tests__/auth.test.ts

# Ejecutar con output detallado
npx jest --verbose

# Ejecutar con coverage
npx jest --coverage
```

---

## ✅ Checklist mínimo para considerar el backend completo

- [ ] auth.test.ts — al menos 3 tests (validación, credenciales incorrectas, login exitoso)
- [ ] patients.test.ts — al menos 2 tests (lista con auth, sin auth)
- [ ] beds.test.ts — al menos 1 test (lista de camas)
- [ ] medications.test.ts — al menos 2 tests (lista, validación o permisos)
- [ ] careRecords.test.ts — al menos 2 tests (crear, anti-duplicidad 409)

**Con esto el backend queda 100% completo y listo para producción académica.**
