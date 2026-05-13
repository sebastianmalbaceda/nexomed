# ARCHITECTURE.md — Arquitectura Técnica de NexoMed

> Versión: 2.1.0 | Fecha: Mayo 2026

---

## 1. Visión General

NexoMed sigue una arquitectura **Cliente-Servidor desacoplada**, con una SPA (Single Page Application) como cliente y una API REST como servidor. Ambas capas se comunican exclusivamente por HTTP/JSON. El sistema se despliega en entornos Windows de hospital accediendo desde cualquier navegador moderno.

```
┌──────────────────────────────────────┐
│           NAVEGADOR (SPA)            │
│   React 19 + Vite 8 + TypeScript 5.9 │
│   Tailwind CSS + Shadcn UI           │
│   TanStack Query + Zustand           │
└────────────┬───────────────────────┘
               │  HTTP / REST (JSON)
               │  JWT en Authorization header
┌────────────▼───────────────────────┐
│           API REST (Backend)         │
│   Node.js + Express                  │
│   Middleware: auth, roles, cors      │
│   Motor de notificaciones (SSE)      │
└──────┬───────────────────────┬───────┘
       │                       │
┌──────▼──────┐        ┌───────▼──────────┐
│  PostgreSQL  │        │  API CIMA/AEMPS  │
│  Prisma ORM  │        │  (medicamentos)  │
└─────────────┘        └──────────────────┘
```

---

## 2. Capa de Presentación — Frontend

### Stack

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19 | Framework UI principal |
| Vite | 8 | Build tool y dev server (HMR) |
| TypeScript | 5.9 | Tipado estático |
| Tailwind CSS | 3 | Utilidades CSS |
| Shadcn UI | latest | Componentes accesibles (modales, cards, sheets) |
| Lucide React | latest | Iconografía médica |
| React Router DOM | v7 | Enrutamiento SPA sin recarga |
| React Hook Form | latest | Gestión de formularios |
| Zod | latest | Validación de esquemas en cliente |
| TanStack Query | v5 | Cache, fetching y revalidación en segundo plano |
| Zustand | latest | Estado global ligero (sesión, token JWT, rol) |

### Estructura de Directorios (Frontend)

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                    ← Enrutador raíz
│   │   ├── components/
│   │   │   ├── ui/                    ← Shadcn UI (accordion, button, card…)
│   │   │   ├── hospital/               ← Componentes específicos hospitalarios
│   │   │   │   ├── Sidebar.tsx            ← Barra de navegación lateral por rol
│   │   │   │   ├── Header.tsx             ← Cabecera con usuario, turno y notificaciones
│   │   │   │   ├── DashboardOverview.tsx  ← Panel resumen del turno
│   │   │   │   ├── MedicalSchedule.tsx    ← Cronograma de tareas / medicación
│   │   │   │   ├── DiagnosticTests.tsx    ← Pruebas diagnósticas
│   │   │   │   ├── ShiftReport.tsx        ← Informe de traspaso de turno
│   │   │   │   ├── UnifiedHistory.tsx     ← Historial unificado del paciente
│   │   │   │   ├── RealtimeNotifications.tsx ← Panel de alertas en tiempo real
│   │   │   │   └── QuickActions.tsx       ← Acciones rápidas (≤ 3 clics)
│   │   │   └── auth/                  ← Componentes de autenticación
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── BedMapPage.tsx         ← Mapa de camas funcional (USA ESTE)
│   │   │   ├── PatientsPage.tsx
│   │   │   ├── NursePage.tsx
│   │   │   ├── DoctorPage.tsx
│   │   │   ├── TCAEPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── UnifiedHistoryPage.tsx
│   │   │   ├── NurseShiftSchedulePage.tsx
│   │   │   └── IncidentsPage.tsx
│   │   ├── hooks/                     ← Custom hooks (usePatient, useMedication…)
│   │   ├── store/                     ← Zustand stores (authStore, notificationStore)
│   │   └── lib/                       ← Helpers, axios instance, constantes
│   ├── styles/
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

### Flujo de Navegación por Rol

```
Login
  ├── rol: enfermero  → /dashboard (NursePage + BedMapPage)
  ├── rol: medico     → /dashboard (DoctorPage + Prescripción)
  └── rol: tcae       → /dashboard (TCAEPage + Constantes)

Rutas comunes (con guard por rol):
  /patients/:id          ← Ficha del paciente (datos según rol)
  /beds                  ← Mapa de camas
  /schedule              ← Cronograma de turno (Enfermero)
  /incidents             ← Módulo de incidencias
  /tests                 ← Pruebas diagnósticas
  /history               ← Historial unificado
```

---

## 3. Capa de Negocio — Backend

### Stack

| Tecnología | Propósito |
|-----------|-----------|
| Node.js 20 | Runtime |
| Express 5 | Framework REST |
| Prisma ORM | Modelado DB + migraciones |
| jsonwebtoken | Tokens JWT por sesión |
| bcrypt | Hash de contraseñas |
| cors | Política CORS entre front y back |
| axios | Proxy a API CIMA/AEMPS |

### Estructura de Directorios (Backend)

```
backend/
├── src/
│   ├── index.ts               ← Entry point + server setup
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── medication.routes.ts
│   │   ├── careRecord.routes.ts
│   │   ├── bed.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── incident.routes.ts
│   │   ├── diagnosticTest.routes.ts
│   │   ├── drug.routes.ts     ← Proxy CIMA/AEMPS
│   │   └── schedule.routes.ts
│   ├── controllers/           ← Lógica de entrada/salida por entidad
│   │   ├── auth.controller.ts
│   │   ├── patients.controller.ts
│   │   ├── medications.controller.ts
│   │   ├── careRecords.controller.ts
│   │   ├── beds.controller.ts
│   │   ├── notifications.controller.ts
│   │   ├── incidents.controller.ts
│   │   ├── diagnosticTests.controller.ts
│   │   └── drugs.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts  ← Verificación JWT
│   │   └── role.middleware.ts  ← Guard de permisos por rol
│   ├── services/
│   │   ├── medication.service.ts  ← Lógica de recálculo de horarios
│   │   ├── notification.service.ts← Emisión de alertas (dirigidas al enfermero asignado)
│   │   └── cima.service.ts        ← Integración API CIMA
│   ├── prisma/
│   │   └── schema.prisma      ← Modelo de datos (v2.0.0)
│   ├── lib/
│   │   ├── prismaClient.ts    ← Instancia singleton de Prisma
│   │   ├── errorHandler.ts     ← Manejo centralizado de errores
│   │   └── notificationEvents.ts ← EventEmitter para SSE
│   └── swagger.ts            ← Configuración Swagger
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                ← Datos de prueba
└── package.json
```

### Middleware Pipeline

```
Request
  → cors() (origen restringido)
  → express.json()
  → authMiddleware (verifica JWT, adjunta req.user)
  → roleMiddleware (verifica permisos del rol)
  → Controller
  → Response
```

---

## 4. Capa de Datos — Base de Datos

### Motor

**PostgreSQL 15** — base de datos relacional. Elegida por su robustez con relaciones complejas propias de historiales clínicos y su excelente soporte en Prisma ORM.

### Esquema Principal (Prisma v2.0.0)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  NURSE
  DOCTOR
  TCAE
}

enum PatientStatus {
  ESTABLE
  MODERADO
  CRITICO
  OBSERVACION
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role
  name         String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  notifications        Notification[]
  prescribedMeds      Medication[]      @relation("PrescribedBy")
  administeredSchedules MedSchedule[]     @relation("AdministeredBy")
  recordedCareRecords   CareRecord[]     @relation("RecordedBy")
  reportedIncidents     Incident[]         @relation("ReportedBy")
  requestedTests       DiagnosticTest[]   @relation("RequestedBy")
  assignedPatients     Patient[]         @relation("AssignedNurse")
}

model Patient {
  id                   String    @id @default(uuid())
  dni                  String?   @unique
  name                 String
  surnames             String?
  dob                  DateTime
  diagnosis            String
  allergies            String[]
  dietRestriction      String?
  isolationRestriction String?
  mobilityRestriction  String?
  admissionDate        DateTime  @default(now())
  discharged           Boolean   @default(false)
  dischargeDate        DateTime?
  bedId                String?   @unique
  bed                  Bed?      @relation(fields: [bedId], references: [id])
  assignedNurseId     String?
  assignedNurse        User?     @relation("AssignedNurse", fields: [assignedNurseId], references: [id])
  status               PatientStatus @default(ESTABLE)

  medications      Medication[]
  careRecords      CareRecord[]
  incidents        Incident[]
  diagnosticTests  DiagnosticTest[]
  notifications    Notification[]
}

model Bed {
  id         String   @id @default(uuid())
  room       Int
  letter     String
  floor      Int      @default(1)
  patient    Patient?

  @@unique([room, letter])
}

model Medication {
  id           String   @id @default(uuid())
  patient      Patient @relation(fields: [patientId], references: [id])
  patientId    String
  drugName     String
  nregistro    String?
  dose         String
  route        String
  frequencyHrs Int
  startTime    DateTime
  active       Boolean  @default(true)
  prescribedBy User     @relation("PrescribedBy", fields: [prescribedById], references: [id])
  prescribedById String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  schedules MedSchedule[]
}

model MedSchedule {
  id             String      @id @default(uuid())
  medication     Medication  @relation(fields: [medicationId], references: [id])
  medicationId   String
  scheduledAt    DateTime
  administeredAt DateTime?
  administeredBy User?       @relation("AdministeredBy", fields: [administeredById], references: [id])
  administeredById String?
}

model CareRecord {
  id         String   @id @default(uuid())
  patient    Patient  @relation(fields: [patientId], references: [id])
  patientId  String
  type       String
  value      String
  unit       String?
  notes      String?
  recordedBy User     @relation("RecordedBy", fields: [recordedById], references: [id])
  recordedById String
  recordedAt DateTime @default(now())
}

model Notification {
  id               String   @id @default(uuid())
  user             User     @relation(fields: [userId], references: [id])
  userId           String
  type             String
  message          String
  relatedPatientId String?
  patient          Patient? @relation(fields: [relatedPatientId], references: [id])
  read             Boolean  @default(false)
  createdAt        DateTime @default(now())
}

model Incident {
  id          String   @id @default(uuid())
  patient     Patient  @relation(fields: [patientId], references: [id])
  patientId   String
  type        String
  description String
  reportedBy  User     @relation("ReportedBy", fields: [reportedById], references: [id])
  reportedById String
  reportedAt  DateTime @default(now())
}

model DiagnosticTest {
  id          String    @id @default(uuid())
  patient     Patient   @relation(fields: [patientId], references: [id])
  patientId   String
  type        String
  name        String
  scheduledAt DateTime
  status     String    @default("PENDING")
  result      String?
  requestedBy User      @relation("RequestedBy", fields: [requestedById], references: [id])
  requestedById String
  createdAt   DateTime @default(now())
}
```

---

## 5. Integración Externa — API CIMA/AEMPS

El backend actúa como proxy para la API pública de medicamentos del CIMA (AEMPS), evitando problemas de CORS y centralizando el cacheo de resultados.

```
Frontend → GET /api/drugs/search?q=paracetamol
         → Backend → GET https://cima.aemps.es/cima/rest/medicamentos?nombre=paracetamol
         → Backend filtra y normaliza respuesta → Frontend
```

Documentación oficial: [CIMA-REST-API v1.19](https://sede.aemps.gob.es/docs/CIMA-REST-API_1_19.pdf)

---

## 6. Autenticación y Seguridad

- **JWT**: tokens firmados (HS256) con expiración de 8 horas (duración de un turno hospitalario). Almacenados en Zustand (memoria) en el cliente — no en localStorage.
- **bcrypt**: hash de contraseñas con salt rounds = 12. Campo en DB: `passwordHash`.
- **CORS**: lista blanca de orígenes (solo `localhost:5173` en desarrollo, dominio de despliegue en producción).
- **Role Guard**: middleware `roleMiddleware` rechaza peticiones con código 403 si el rol del token no tiene permisos para el endpoint solicitado.
- **Validación**: Zod en frontend y validación de tipos TypeScript en backend para todas las entradas de usuario.

---

## 7. Notificaciones en Tiempo Real

Se implementa mediante **SSE (Server-Sent Events)** y **polling activo** desde el cliente:

- **SSE**: EventSource en frontend se conecta a `/api/notifications/stream?token=...`
- **Polling fallback**: TanStack Query realiza un refetch de `/api/notifications` cada **5 segundos** cuando el usuario está activo.
- Las notificaciones se envían al **enfermero asignado** al paciente (campo `assignedNurseId` en `Patient`).
- Las notificaciones no leídas se muestran como badge en el Header y en el panel `RealtimeNotifications`.

> **Nota de arquitectura:** Para un sistema en producción real se reemplazaría el polling por WebSockets (Socket.io) o Server-Sent Events más robustos para reducir la latencia y la carga en el servidor.

---

## 8. Decisiones de Arquitectura Clave

| Decisión | Alternativa considerada | Motivo |
|----------|------------------------|--------|
| SPA + API REST desacopladas | Monolito server-side (Next.js SSR) | Mayor flexibilidad de despliegue; separa la lógica de frontend y backend; más fácil de mantener entre dos equipos |
| PostgreSQL | MySQL | PostgreSQL maneja mejor arrays (alergias), JSON parcial y tipos complejos propios de datos clínicos |
| Prisma ORM | SQL directo / Sequelize | Migraciones automáticas, tipado TypeScript nativo, reducción de errores por SQL manual |
| JWT en memoria (Zustand) | localStorage | Evita ataques XSS de lectura de token; el token se pierde al cerrar el tab (comportamiento deseable en entorno clínico) |
| SSE + Polling (vs WebSockets) | Socket.io | SSE es más simple de implementar y suficiente para el MVP académico con 8 usuarios; reduce complejidad de despliegue |
| Proxy CIMA en backend | Llamada directa desde frontend | Evita CORS, permite cacheo futuro, centraliza el manejo de errores de la API externa |
| Enfermero asignado (v2.0.0) | Notificar a todos los enfermeros | Las notificaciones dirigidas son más realistas y evitan saturación de notificaciones irrelevantes |

---

## 9. Estado de Implementación (Actualizado Mayo 2026)

### ✅ Completado
- Backend Express 5 + Prisma + JWT funcional
- Frontend React 19 + Vite 8 + TanStack Query operativo
- SSE para notificaciones en tiempo real
- Mapa de camas funcional (BedMapPage.tsx) con pestañas General/Mis Pacientes
- Registro de cuidados con anti-duplicidad (15 min)
- Integración CIMA (proxy backend)
- Shadcn UI + Tailwind configurados
- Prescripción de medicación (DoctorPage + búsqueda CIMA)
- Módulo de incidencias completo
- Cronograma de medicación visual por turnos
- Evolutivos y notas de turno
- Asignación de enfermera a pacientes (persiste en BD)
- Estado del paciente (ESTABLE/MODERADO/CRITICO/OBSERVACION)
- Enfermero puede solicitar pruebas diagnósticas
- Error Boundary en React (ErrorBoundary.tsx)
- **43 tests de integración** (11 archivos, 100% pasando)
- Swagger UI en /api/docs
- Endpoint GET /api/users/nurses
- Endpoint GET /api/schedule (agregación unificada)
- **Auditoría de seguridad y estabilidad completada**:
  - JWT hardening (HS256 explícito, validación de tipos)
  - PII filtering en endpoints públicos
  - Atomicidad en operaciones de medicación (transacciones Prisma)
  - Corrección de race conditions en care records
  - Eliminación de código muerto y estado huérfano

### ✅ Completado recientemente (Auditoría Final)
- Tests de integración: notifications, incidents, drugs, users (todos pasando)
- Unit tests básicos para services
- Pulido exhaustivo de UI/UX — refactorización de formularios a RHF + Zod
- Alertas de restricciones visuales para TCAE (TCAEPage con getRestrictions)
- READMEs dedicados para frontend y backend
- Preparación DEMO final

### 📋 Pendiente
- Validación final con profesor
