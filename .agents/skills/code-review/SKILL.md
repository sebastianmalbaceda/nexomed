---
name: code-review
description: |
  Usar cuando se necesita revisar código del proyecto NexoMed antes de merge.
  Triggers: "revisa este código", "code review de", "revisar PR", "revisar cambios".
  NO usar para implementar features o corregir bugs directamente.
---

# Skill: Code Review en NexoMed

## 1. Checklist de revisión

### Backend
- [ ] Controller delega toda lógica al service (máx 20 líneas)
- [ ] Service contiene toda la lógica de negocio
- [ ] Validación Zod en controller antes de usar datos externos
- [ ] Middleware de auth y role aplicados correctamente
- [ ] Códigos HTTP correctos (400, 401, 403, 404, 409, 500)
- [ ] No hay SQL crudo (usar Prisma siempre)
- [ ] No hay secretos hardcodeados
- [ ] Respuestas siguen formato `{ data: ... }` o `{ error: ... }`
- [ ] Notificaciones generadas cuando corresponde (medicación → NURSE)

### Frontend
- [ ] Componentes en PascalCase, un archivo por componente
- [ ] Hooks con prefijo `use` (camelCase)
- [ ] Stores Zustand con sufijo `Store`
- [ ] Formularios usan React Hook Form + Zod (nunca useState para formularios)
- [ ] Fetching usa TanStack Query (nunca useEffect + fetch manual)
- [ ] Estilos solo con clases Tailwind (sin CSS en línea)
- [ ] Sin `any` en TypeScript sin justificación en comentario
- [ ] Importaciones usan alias `@/`
- [ ] No se modifica `components/ui/` directamente (Shadcn)

### Reglas de negocio críticas
- [ ] Recálculo de horarios: al cambiar `startTime` de medicación activa, recalcular MedSchedules pendientes sin alterar administrados
- [ ] Notificación obligatoria: toda creación/modificación/eliminación de medicación activa por DOCTOR genera Notification para NURSE
- [ ] Anti-duplicidad: CareRecord del mismo type para mismo patientId en < 15 min → 409
- [ ] Tokens de sesión: expiración 8h, frontend maneja 401 redirigiendo a login

### Git
- [ ] Rama: `feature/NXM-XX-descripcion` o `fix/NXM-XX-descripcion`
- [ ] Commit: Conventional Commits — `feat(componente): descripción en imperativo`
- [ ] No hay `.env` o secretos en el commit
- [ ] No hay datos reales de pacientes en seed o tests

## 2. Severidad de hallazgos

| Nivel | Acción |
|-------|--------|
| 🔴 Crítico | Bloquea el merge (seguridad, reglas de negocio violadas) |
| 🟡 Advertencia | Debería corregirse antes de merge (convenciones, mejores prácticas) |
| 🔵 Sugerencia | Mejora opcional (legibilidad, rendimiento) |

## 3. Formato de reporte

```markdown
## Code Review — [archivo/componente]

### 🔴 Críticos
- [Descripción del problema]

### 🟡 Advertencias
- [Descripción del problema]

### 🔵 Sugerencias
- [Descripción del problema]
```
