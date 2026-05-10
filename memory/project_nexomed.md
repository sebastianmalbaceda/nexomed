---
name: NexoMed project context
description: Stack técnico, convenciones clave y estado actual del proyecto NexoMed
type: project
---

NexoMed es una app de gestión clínica hospitalaria (proyecto LIS UAB 2026). React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS 3 + Shadcn UI. Backend Node/Express 5/Prisma en puerto 3000. Base de datos PostgreSQL en Neon.

**Why:** Proyecto académico con equipo dividido: frontend (Raúl/Irene/Cristina) y backend (Xiang/Cristian/Sebastian).

**Estado actual (Mayo 2026):** Sprint 4 en progreso. Sprints 1-3 completados.

**Frontend (src/app/):**
- `src/styles/globals.css` — tema NexoMed oscuro por defecto (`#0d1117` bg, `#3b82f6` primary, Inter font). `<html class="dark">` en index.html.
- `src/app/store/authStore.ts` — Zustand, token JWT en memoria (NO localStorage).
- `src/app/lib/api.ts` — cliente fetch (no axios) que unwraps `{ data: T }`, añade Bearer token, redirige a /login en 401.
- `src/app/lib/types.ts` — tipos que reflejan el schema Prisma exactamente.
- `src/app/lib/constants.ts` — ROLE_LABELS, POLLING_INTERVAL_MS=5000, SEED_CREDENTIALS, getCurrentShift().
- Router en App.tsx: BrowserRouter + AppLayout (Outlet con Sidebar+Header) + rutas protegidas.
- 12 páginas: LoginPage, DashboardPage, PatientsPage, BedMapPage, NotificationsPage, DiagnosticTestsPage, UnifiedHistoryPage, DoctorPage, NursePage, TCAEPage, IncidentsPage, NurseShiftSchedulePage.
- 10 componentes hospital: DashboardOverview, Sidebar, Header, RealtimeNotifications, PatientSchedule, UnifiedHistory, ShiftReport, QuickActions, MedicalSchedule, DiagnosticTests.
- 4 hooks: useNotificationStream, useNotificationToast, useIsMobile, use-toast.
- ErrorBoundary.tsx para manejo de errores globales.
- SSE configurado en vite proxy para notificaciones en tiempo real.

**Backend (src/):**
- 11 route modules, 11 controllers, 5 services, 8 validation schemas.
- 36 endpoints implementados.
- Auth: JWT + bcrypt (passwordHash). Middleware authenticate + authorize.
- Servicios: medication (recálculo horarios), notification (SSE + dirigidas), careRecord (anti-dup 15 min), cima (proxy API), schedule (agregación unificada).
- 21 tests de integración (7 archivos). Faltan: notifications, incidents, drugs, users.
- Swagger UI en `/api/docs`.

**Base de datos (Neon PostgreSQL):**
- Schema sincronizado via `prisma db pull`.
- Modelos: User, Patient, Bed, Medication, MedSchedule, CareRecord, Notification, Incident, DiagnosticTest.
- Enums: Role (NURSE/DOCTOR/TCAE), PatientStatus (ESTABLE/MODERADO/CRITICO/OBSERVACION).

**How to apply:** Al modificar cualquier parte del proyecto, seguir estas convenciones. El alias `@/` apunta a `src/app/` en frontend. No usar localStorage para tokens. TanStack Query para todo fetching en frontend. Delegar lógica de negocio a services en backend.
