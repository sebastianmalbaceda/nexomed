# NexoMed Frontend

> Interfaz web de gestión clínica hospitalaria — React 19 + Vite 8 + TypeScript

---

## Stack

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19 | Framework UI |
| Vite | 8 | Build tool + dev server |
| TypeScript | 5.9 | Tipado estático |
| Tailwind CSS | 3.4 | Utilidades CSS |
| Shadcn UI | latest | Componentes accesibles |
| React Router DOM | v7 | Enrutamiento SPA |
| TanStack Query | v5 | Cache + fetching |
| Zustand | 5 | Estado global (auth) |
| React Hook Form | latest | Formularios |
| Zod | 4 | Validación de esquemas |

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Arrancar en desarrollo (puerto 5173)
npm run dev

# Build de producción
npm run build

# Lint
npm run lint

# Tests
npm run test
```

### Variables de entorno

El archivo `.env` ya viene configurado. Variables disponibles:

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | URL base de la API REST |
| `VITE_BACKEND_URL` | `http://localhost:3000` | URL del backend para el proxy de Vite |

---

## Estructura

```
src/app/
├── components/
│   ├── ui/            ← Shadcn UI (no modificar directamente)
│   ├── hospital/      ← Componentes específicos (Sidebar, Header, etc.)
│   ├── auth/          ← ProtectedRoute, AuthProvider
│   └── ErrorBoundary.tsx
├── pages/             ← 12 páginas (Login, Dashboard, Patients, Beds, etc.)
├── hooks/             ← Custom hooks (useNotificationStream, etc.)
├── store/             ← Zustand stores (authStore)
└── lib/               ← api client, types, constants, utils
```

---

## Rutas

| Ruta | Componente | Roles |
|------|-----------|-------|
| `/login` | LoginPage | Público |
| `/dashboard` | DashboardPage | Todos |
| `/patients` | PatientsPage | DOCTOR, NURSE |
| `/beds` | BedMapPage | Todos |
| `/doctor` | DoctorPage | DOCTOR |
| `/nurse` | NursePage | NURSE |
| `/vitals` | TCAEPage | TCAE, NURSE |
| `/notifications` | NotificationsPage | DOCTOR, NURSE |
| `/tests` | DiagnosticTestsPage | DOCTOR, NURSE |
| `/history` | UnifiedHistoryPage | DOCTOR, NURSE |
| `/incidents` | IncidentsPage | Todos |
| `/schedule` | NurseShiftSchedulePage | Todos |

---

## Convenciones

- **Componentes**: PascalCase, un archivo por componente
- **Hooks**: camelCase con prefijo `use`
- **Formularios**: React Hook Form + Zod (nunca useState manual)
- **Fetching**: TanStack Query (nunca useEffect + fetch)
- **Estilos**: Solo clases Tailwind (sin CSS en línea)
- **Imports**: Alias `@/` apunta a `src/app/`
- **Tokens**: Almacenados en Zustand (memoria), nunca localStorage

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| DOCTOR | dr.garcia@nexomed.es | password123 |
| NURSE | enf.martinez@nexomed.es | password123 |
| TCAE | tcae.sanchez@nexomed.es | password123 |
