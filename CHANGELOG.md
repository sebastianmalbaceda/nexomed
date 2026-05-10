# CHANGELOG.md — NexoMed

Todos los cambios notables de este proyecto quedan documentados en este fichero.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y el proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.4.0] — 2026-05 — Sprint 4 (Pulido Final)

### Añadido
- 4 archivos de tests nuevos: notifications (6 tests), incidents (7 tests), drugs (5 tests), users (3 tests)
- README dedicado para frontend con estructura, rutas, convenciones y credenciales
- README dedicado para backend con endpoints, tests, variables de entorno y reglas de negocio
- Alertas visuales de restricciones para TCAE (TCAE-RF2) con getRestrictions() e inferencia por diagnóstico
- Estado de medicación (pendiente/administrado) en TCAEPage (TCAE-RF3)
- Registro de incidencias desde TCAEPage

### Cambiado
- ts-jest actualizado a versión compatible con Jest 30
- Documentación completa actualizada: ROADMAP, CHANGELOG, AGENTS, SPEC, ARCHITECTURE, PLANNING, PROMPTS

### Corregido
- ROADMAP.md: sprints 1-4 marcados como completados
- CHANGELOG.md: entradas añadidas para todos los sprints
- README.md: eliminado script inexistente `npm run install:all`
- AGENTS.md: versiones actualizadas (React 19, TS 5.9, Vite 8, Router v7)
- ARCHITECTURE.md: eliminada referencia a BedMap.tsx, añadido PatientStatus enum
- SPEC.md: eliminada afirmación de "aprobación médica" inexistente, endpoints faltantes añadidos
- backend/TODO.md: tests completados marcados, todos los endpoints documentados
- backend/.env.example: añadido CIMA_BASE_URL
- memory/project_nexomed.md: reescrito con estado completo del proyecto

---

## [Sin publicar] — Sprint 3

### Añadido
- Módulo de incidencias completo (backend + frontend): rechazos de medicación, incidentes de cuidados, caídas
- Cronograma de turno (NurseShiftSchedulePage) con vista de planta (SYS-RF5)
- Cronograma por paciente (PatientSchedule) integrado en NursePage (SYS-RF6)
- Prescripción de medicación con búsqueda CIMA integrada (DoctorPage)
- Notificaciones dirigidas al enfermero asignado (assignedNurseId)
- Estado del paciente (ESTABLE/MODERADO/CRITICO/OBSERVACION)
- Endpoint GET /api/users/nurses para listado de enfermeros
- Endpoint GET /api/schedule con agregación de horarios y cuidados
- Error Boundary en React frontend
- 21 tests de integración (auth, patients, beds, medications, careRecords, diagnosticTests, schedule)

### Cambiado
- Schema Prisma sincronizado con Neon PostgreSQL (prisma db pull)
- Migración a Express 5.x
- Actualización de dependencias: React 19, TypeScript 5.9, Vite 8, Zod 4, Zustand 5

### Corregido
- Campo User.password renombrado a User.passwordHash
- CORS restringido de '*' a orígenes específicos
- Logging de Prisma optimizado (solo en desarrollo)
- Código muerto eliminado (BedMap.tsx hardcoded)
- Declaración duplicada de NotificationType en types.ts

---

## [0.3.0] — 2026-05 — Sprint 3

### Añadido
- Prescripción de medicación (DoctorPage) con generación automática de horarios
- Notificaciones en tiempo real via SSE + polling fallback (5s)
- Panel médico completo (DoctorPage) con historial, prescripción y pruebas
- Módulo de pruebas diagnósticas (DiagnosticTestsPage)
- Servicio de recálculo de horarios de medicación (medication.service.ts)
- Servicio de notificaciones dirigidas (notification.service.ts)
- Anti-duplicidad de CareRecord (15 minutos)
- Integración con API CIMA/AEMPS (proxy en backend)
- Asignación de enfermera a pacientes (persiste en BD)
- Pestañas General/Mis Pacientes en mapa de camas

---

## [0.2.0] — 2026-04 — Sprint 2

### Añadido
- DashboardOverview conectado a API real
- Mapa de camas funcional (BedMapPage) con altas/bajas/reubicaciones
- Ficha del paciente (PatientsPage) con alergias, constantes, medicación
- Módulo de medicación del enfermero (NursePage) con cronograma visual
- Registro de cuidados y constantes (CareRecord)
- Registro básico TCAE (TCAEPage)
- Seed de base de datos con usuarios y pacientes de prueba
- Shadcn UI + Tailwind correctamente configurados

---

## [0.1.0] — 2026-03 — Sprint 1

### Añadido
- Setup inicial del repositorio frontend (React + Vite + TypeScript + Tailwind CSS + Shadcn UI)
- Setup inicial del repositorio backend (Node.js + Express + Prisma)
- Configuración de herramientas de calidad: ESLint + Prettier + Husky
- Modelado de base de datos con Prisma (schema inicial)
- Primera migración de base de datos
- Autenticación JWT: endpoints login / logout / me
- Middleware de autorización por rol (NURSE, DOCTOR, TCAE)
- Pantalla de Login funcional en el frontend
- Script de seed con datos de prueba

---

<!-- Formato de entrada para versiones futuras:

## [X.Y.Z] — YYYY-MM-DD

### Añadido
- Nuevas funcionalidades.

### Cambiado
- Cambios en funcionalidades existentes.

### Corregido
- Bugs solucionados.

### Eliminado
- Funcionalidades eliminadas.

### Seguridad
- Vulnerabilidades corregidas.

-->
