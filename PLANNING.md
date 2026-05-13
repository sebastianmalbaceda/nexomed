# PLANNING.md — Tareas Activas NexoMed

> Actualizado: Mayo 2026 | Sprint actual: **Sprint 4 — Pulido Final** ✅ COMPLETADO

---

## Instrucciones para agentes IA

Este archivo es la fuente de verdad del estado de implementación. Antes de escribir código, lee este archivo para saber qué está hecho, qué está en curso y qué queda pendiente. Al completar una tarea, márcala con `[x]`. Al encontrar una tarea bloqueada, añade `⚠️ BLOQUEADA:` con la razón.

---

## Sprint 1 — Cimientos y Setup ✅ COMPLETADO

- [x] Firma del contrato y definición del alcance del proyecto
- [x] Creación de la presentación inicial del proyecto (NexoMed)
- [x] Definición de la arquitectura técnica y selección del stack
- [x] Prototipo visual inicial en Figma Make
- [x] **Setup del repositorio de frontend (React 18 + Vite + TypeScript + Tailwind + Shadcn UI)**
  - Inicializar proyecto con `npm create vite@latest`
  - Configurar Tailwind CSS + Shadcn UI
  - Instalar dependencias: React Router DOM v7, TanStack Query, Zustand, React Hook Form, Zod, Lucide React
  - Configurar ESLint + Prettier + Husky (pre-commit)
  - Crear estructura de carpetas base: `pages/`, `components/`, `hooks/`, `store/`, `lib/`
  - Crear rama `sprint-1` en GitHub y proteger `main`
- [x] **Setup del repositorio de backend (Node.js + Express + TypeScript)**
  - Inicializar proyecto Node.js con TypeScript
  - Instalar dependencias: Express, Prisma, jsonwebtoken, bcrypt, cors, dotenv
  - Configurar ESLint + Prettier + Husky
  - Crear estructura de carpetas: `routes/`, `controllers/`, `middleware/`, `services/`, `prisma/`
  - Crear `.env.example` con variables requeridas
- [x] **Modelado completo de la base de datos con Prisma (v2.0.0)**
  - Definir `schema.prisma` con todos los modelos: User, Patient, Bed, Medication, MedSchedule, CareRecord, Notification, Incident, DiagnosticTest
  - Añadido campo `assignedNurseId` a `Patient` para notificaciones dirigidas
  - Renombrado campo `password` a `passwordHash` en `User`
  - Aplicar migración: `npx prisma migrate dev --name init`
  - Crear script de seed con datos de prueba (1 médico, 2 enfermeros, 1 TCAE, 6 pacientes, 24 camas)
- [x] **Implementación de autenticación JWT**
  - Endpoint `POST /api/auth/login` — validar credenciales, devolver JWT
  - Endpoint `POST /api/auth/logout` — invalidar sesión cliente
  - Endpoint `GET /api/auth/me` — retornar datos del usuario autenticado
  - Middleware `auth.middleware.ts` — verificar JWT en cabecera Authorization
  - Middleware `role.middleware.ts` — guard de permisos por rol (NURSE, DOCTOR, TCAE)
- [x] **Implementar pantalla de Login en el frontend**
  - Formulario con React Hook Form + Zod (validación de email y contraseña)
  - Integración con `POST /api/auth/login`
  - Almacenamiento del token en Zustand (authStore)
  - Redirección al dashboard correspondiente según rol tras login exitoso
  - Manejo de errores (credenciales inválidas, servidor caído)
- [x] **Configuración de CORS restringido**
  - Cambiado de `origin: '*'` a `origin: process.env.CORS_ORIGIN || 'http://localhost:5173'`
- [x] **Optimización de logs de Prisma**
  - Configurado para solo loggear queries en desarrollo (`NODE_ENV=development`)
- [x] **Eliminación de código muerto**
  - Eliminado `BedMap.tsx` con datos hardcodeados (se usa `BedMapPage.tsx`)
- [x] **Corrección de tipos TypeScript**
  - Eliminada declaración duplicada de `NotificationType` en `types.ts`
- [x] **Actualización de documentación**
  - SPEC.md actualizado a v2.0.0
  - ARCHITECTURE.md actualizado a v2.0.0
  - PLANNING.md actualizado (este archivo)

---

## Sprint 2 — Core Clínico ✅ COMPLETADO

### ✅ Completado
- [x] **Panel principal del Enfermero (DashboardOverview)**
  - Lista de pacientes asignados con nombre, habitación, alertas activas
  - Acceso rápido a ficha del paciente en ≤ 2 clics
  - Medicación pendiente del turno con botón "Administrar"
- [x] **Mapa de camas (BedMapPage)**
  - Grid de 12 habitaciones × 2 camas = 24 celdas
  - Estado visual: cama libre (blanco), ocupada (color por alerta), en limpieza
  - Modal de alta de paciente: asignar nombre, diagnóstico, alergias a cama libre
  - Modal de baja: liberar cama con confirmación
  - Reubicación de pacientes entre camas
  - **Pestañas General/Mis Pacientes** — enfermera puede ver solo sus pacientes asignados
  - **Asignación de enfermera** — desde el mapa de camas (persiste en BD)
- [x] **Ficha del paciente (PatientsPage)**
  - Datos generales: nombre, edad, diagnóstico, motivo de ingreso
  - Alergias con badge de alerta roja
  - Constantes vitales recientes (últimas 24h)
  - Medicación activa del día con estado (pendiente / administrada)
  - Cuidados del turno actual
  - Registro de ingreso / re-ingreso por DNI
  - **Estado del paciente** (ESTABLE/MODERADO/CRITICO/OBSERVACION)
  - **Alta/baja eliminada del doctor** — solo administración puede dar de alta
- [x] **Módulo de medicación del enfermero (NursePage)**
  - **Cronograma de medicación** visual por turnos (Mañana/Tarde/Noche)
  - Botón "Administrar" → registra MedSchedule con timestamp y usuario
  - Indicador de dosis vencidas (pulse animation)
  - Leyenda de medicación activa
- [x] **Registro de cuidados y constantes (CareRecord)**
  - Formulario por tipo: constante (PA, FC, SpO2, temperatura, glucemia), cura, higiene
  - Validación anti-duplicidad: aviso si mismo tipo < 15 min
- [x] **Notificaciones en tiempo real (SSE + Polling)**
  - Backend: SSE en `/api/notifications/stream`
  - Frontend: EventSource + TanStack Query polling cada 5s
  - Notificaciones dirigidas al enfermero asignado (no a todos)
- [x] **Registro básico TCAE (TCAEPage)**
  - Registro de higiene y alimentación
  - Visualización de historial de turnos anteriores
- [x] **Conexión con API CIMA (servicio proxy en backend)**
  - `cima.service.ts` implementado
  - Endpoints: `GET /api/drugs/search?q=:nombre` y `GET /api/drugs/:nregistro`
- [x] **Prescripción de medicación (DoctorPage)**
  - Frontend: formulario completo con búsqueda CIMA integrada
  - Backend: implementado con generación automática de horarios
  - Notificación a enfermero asignado al prescribir/retirar medicación
- [x] **Módulo de incidencias (IncidentsPage)**
  - Frontend: página completa con filtros y formulario
  - Backend: `incidents.controller.ts` y `incidents.routes.ts` implementados
  - Tipos de incidencias: rechazo de medicación, incidente de cuidados, efectos adversos, caídas
  - Notificación automática al registrar incidencia
- [x] **Evolutivos y notas de turno (NursePage)**
  - Tipos: EVOLUTIVO, FIN_TURNO, TRASLADO, INCIDENCIA
  - Formulario integrado en la vista de enfermero
  - Historial de notas por paciente
- [x] **Cronograma MedicalSchedule**
  - Vista de planta (SYS-RF5): NurseShiftSchedulePage implementada
  - Vista de paciente (SYS-RF6): MedCronogram integrado en NursePage

### ✅ Completado / 🔄 En Progreso
- [x] **Prescripción de medicación (DoctorPage)**
  - Frontend: ✅ formulario completo con búsqueda CIMA integrada
  - Backend: ✅ implementado con generación automática de horarios
  - Notificación a enfermero asignado al prescribir/retirar medicación
- [x] **Módulo de incidencias (IncidentsPage)**
  - Frontend: ✅ página completa con filtros y formulario
  - Backend: ✅ `incidents.controller.ts` y `incidents.routes.ts` implementados
  - Tipos de incidencias: rechazo de medicación, incidente de cuidados, efectos adversos, caídas
  - Notificación automática al registrar incidencia
- [x] **Cronograma MedicalSchedule**
  - Vista de planta (SYS-RF5): ✅ NurseShiftSchedulePage implementada
  - Vista de paciente (SYS-RF6): ✅ PatientSchedule integrado en NursePage
- [x] **Alertas para TCAE**
  - ✅ Mostrar restricciones de dieta, aislamiento, movilidad en el paciente (TCAEPage con getRestrictions())
  - ✅ Visualización de estado de medicación (pendiente vs administrada) — TCAE-RF3

---

## Sprint 3 — Visualización e Incidencias ✅ COMPLETADO

- [x] Notificaciones en tiempo real (polling TanStack Query cada 5s) — ✅ IMPLEMENTADO
- [x] Panel médico completo (historial, prescripción, pruebas) — ✅ COMPLETADO
- [x] Prescripción de medicación → genera tarea en enfermero + notificación — ✅ COMPLETADO
- [x] Cronograma MedicalSchedule (SYS-RF5, SYS-RF6) — ✅ COMPLETADO
- [x] Módulo de incidencias (SYS-RF8) — ✅ COMPLETADO
- [x] Evolutivos y notas de turno — ✅ COMPLETADO
- [x] Asignación de pacientes a enfermera — ✅ COMPLETADO
- [x] Estado del paciente (ESTABLE/MODERADO/CRITICO/OBSERVACION) — ✅ COMPLETADO
- [x] Enfermero puede solicitar pruebas diagnósticas — ✅ COMPLETADO
- [x] Alertas de restricciones para TCAE — ✅ IMPLEMENTADO (TCAEPage muestra restricciones visuales con getRestrictions())

---

## Sprint 4 — Pulido Final ✅ COMPLETADO

- [x] Testing integrado (Jest + Supertest para API crítica)
  - ✅ 11 archivos de tests: auth, patients, beds, medications, careRecords, diagnosticTests, schedule, notifications, incidents, drugs, users
  - ✅ 43 tests pasando (0 fallos)
  - ✅ ts-jest actualizado a versión compatible con Jest 30
- [x] UX refinement completo
  - ✅ TCAE-RF2: Alertas visuales de restricciones implementadas (getRestrictions con inferencia por diagnóstico)
  - ✅ TCAE-RF3: Estado de medicación + registro de incidencias en TCAEPage
  - ✅ Error Boundary en React
  - ✅ SSE + polling para notificaciones en tiempo real
- [x] Documentación Swagger de la API — swagger.ts con documentación de todos los endpoints
- [x] READMEs de frontend y backend — creados con instrucciones completas
- [x] Preparación DEMO final — proyecto funcional end-to-end
- [ ] Validación final con el profesor — pendiente de revisión académica
- [x] Corrección de inconsistencias de documentación (ROADMAP, CHANGELOG, AGENTS, SPEC, ARCHITECTURE, etc.)

---

## Bloqueadores Activos

_No hay bloqueadores activos en este momento._

---

## Preguntas Abiertas

1. ~~¿El polling de notificaciones cada 5 segundos es aceptable para el profesor como implementación de "tiempo real" en el MVP?~~ → **RESUELTO**: Se implementó SSE + polling como fallback.
2. ~~¿Los datos del seed de prueba deben incluir pacientes con medicación ya administrada (turnos anteriores) para demostrar el historial?~~ → **RESUELTO**: Seed incluye medicación con horarios pasados y futuros.
3. ~~¿La integración CIMA se presentará como funcionalidad activa en el Sprint 2 o se puede dejar como mock para ese sprint y activar en Sprint 3?~~ → **RESUELTO**: Backend implementado, frontend en desarrollo.

---

## Cambios Recientes (Mayo 2026)

### Merge de rama `features` a `main`
- ✅ Merge completado — avances del equipo integrados
- ✅ Asignación de enfermera persiste en BD (`assignedNurseId` en `updatePatientSchema`)
- ✅ Relación Prisma `assignedNurse` restaurada en schema
- ✅ Schema sincronizado con Neon PostgreSQL
- ✅ Frontend y backend compilan sin errores
- ✅ Login funcional end-to-end

### Correcciones Críticas
- ✅ Corregido `types.ts`: eliminada declaración duplicada de `NotificationType`
- ✅ Actualizado `schema.prisma` a v2.0.0:
  - Renombrado `User.password` → `User.passwordHash`
  - Añadido `Patient.assignedNurseId` para notificaciones dirigidas
  - Añadido `Patient.status` (PatientStatus enum)
  - Corregido `CareRecord.recordedBy` relación (campo `recordedById`)
- ✅ Implementado `POST /api/auth/logout` en backend
- ✅ Restringido CORS: de `*` a `http://localhost:5173`
- ✅ Optimizado logging de Prisma: solo en desarrollo
- ✅ Eliminado código muerto (`BedMap.tsx` hardcoded)
- ✅ Actualizada documentación (SPEC.md v2.1.0, ARCHITECTURE.md v2.1.0)
- ✅ Corregido `api.put` en frontend — añadido segundo argumento requerido
- ✅ Schema sincronizado con Neon PostgreSQL (`prisma db pull`)
- ✅ Frontend y backend compilados sin errores
- ✅ Login funcional end-to-end

### Auditoría de Documentación (Mayo 2026)
- ✅ ROADMAP.md actualizado: sprints 1-3 marcados como completados, sprint 4 en progreso
- ✅ CHANGELOG.md actualizado: entradas añadidas para Sprints 2, 3, 4
- ✅ README.md corregido: eliminado `npm run install:all` (no existe), instrucciones separadas
- ✅ AGENTS.md actualizado: React 19, TypeScript 5.9, Vite 8, React Router v7
- ✅ ARCHITECTURE.md corregido: eliminada referencia a BedMap.tsx eliminado, Error Boundary marcado ✅, PatientStatus enum añadido
- ✅ SPEC.md actualizado: eliminada afirmación de "aprobación médica" inexistente, endpoints faltantes añadidos
- ✅ PROMPTS.md actualizado: React 18 → 19
- ✅ backend/TODO.md actualizado: tests completados marcados, endpoints de users añadidos
- ✅ backend/.env.example actualizado: añadido CIMA_BASE_URL
- ✅ memory/project_nexomed.md actualizado: Tailwind v3, estado completo del proyecto
- ✅ 4 archivos de tests creados: notifications, incidents, drugs, users

### Auditoría de Seguridad y Estabilidad (Mayo 2026) — ✅ COMPLETADA
- ✅ JWT hardening: HS256 explícito, validación de tipos, prevención de auth confusion
- ✅ PII filtering: campos sensibles eliminados de endpoints públicos (`/api/beds`)
- ✅ Atomicidad en medicación: transacciones Prisma para creación + schedules
- ✅ Corrección de race conditions: serialización en `CareRecord`, reschedule acotado
- ✅ Error handling: captura de `PrismaClientValidationError`, manejo de throws no-Error
- ✅ Límites de query: `take: 500` en endpoints sin paginación explícita
- ✅ Body limits: 100KB en `express.json()` y `express.urlencoded()`
- ✅ Refactorización de formularios: 8 páginas migradas a RHF + Zod con enums alineados
- ✅ Eliminación de código muerto: campo `gender` en BedMapPage, estado huérfano
- ✅ 43 tests pasando (11 archivos), 0 fallos — suite de integración completa

### Estado Final del Proyecto
**Sprint 4 — Pulido Final + Auditoría** ✅ COMPLETADO
- Código compilable: frontend (`tsc -b && vite build`) y backend (`tsc`) sin errores
- Tests: 43/43 passing (backend), lint limpio (frontend)
- Documentación: README, SPEC, ARCHITECTURE, ROADMAP, CHANGELOG, AGENTS, PLANNING sincronizados
- Preparado para: validación con el profesor y presentación DEMO

### Próximos Pasos
1. 📋 Validación final con el profesor (Sprint Review)
2. 📋 Presentación DEMO final
