---
name: NexoMed project context
description: Stack técnico, convenciones clave y estado del frontend implementado en Sprint 1
type: project
---

NexoMed es una app de gestión clínica hospitalaria (proyecto LIS UAB 2026). React 18 + Vite + TypeScript + Tailwind v4 + Shadcn UI. Backend Node/Express/Prisma en puerto 3000.

**Why:** Proyecto académico con equipo dividido: frontend (Raúl/Irene/Cristina) y backend (Xiang/Cristian/Sebastian).

**Sprint 1 frontend completado (2026-04-06):**
- `src/styles/globals.css` — tema NexoMed oscuro por defecto (#0d1117 bg, #3b82f6 primary, Inter font). `<html class="dark">` en index.html.
- `src/app/store/authStore.ts` — Zustand, token JWT en memoria (NO localStorage).
- `src/app/lib/api.ts` — cliente fetch (no axios) que unwraps `{ data: T }`, añade Bearer token, redirige a /login en 401.
- `src/app/lib/types.ts` — tipos que reflejan el schema Prisma exactamente.
- `src/app/lib/constants.ts` — ROLE_LABELS, POLLING_INTERVAL_MS=5000, SEED_CREDENTIALS, getCurrentShift().
- `src/vite-env.d.ts` — creado porque node_modules no existía al inicio (npm install corrido).
- Router en App.tsx: BrowserRouter + AppLayout (Outlet con Sidebar+Header) + rutas protegidas.
- Páginas: LoginPage, DashboardPage, PatientsPage, BedMapPage, NotificationsPage, DiagnosticTestsPage, UnifiedHistoryPage.
- Sidebar filtrada por rol, Header con polling de notificaciones, DashboardOverview conectado a API.

**How to apply:** Al modificar frontend, seguir estas convenciones. El alias `@/` apunta a `src/app/`. No usar localStorage para tokens. TanStack Query para todo fetching.
