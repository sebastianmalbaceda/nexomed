# ROADMAP.md — Dirección y Milestones de NexoMed

> Proyecto académico LIS — UAB 2026

---

## Estado actual

**Sprint 4 — Pulido Final** ✅ COMPLETADO. Sprints 1-4 completados.

---

## Milestones del MVP Académico (Versión 1.0)

### 🏁 Milestone 1 — Prototipo Básico (Nota 5) · ✅ COMPLETADO

- [x] Firma del contrato y definición de arquitectura
- [x] Setup completo de repositorios frontend y backend
- [x] Modelado de base de datos con Prisma + roles de usuario
- [x] Autenticación JWT funcional (login / logout por rol)
- [x] Dashboard del Enfermero: ficha de paciente, alergias, medicación pendiente
- [x] Registro básico de cuidados sin duplicidades (ENF-RF4)
- [x] Mapa de camas con altas y bajas de pacientes (SYS-RF4)
- [x] Registro de constantes vitales para TCAE (TCAE-RF1)
- [x] Historial de constantes y turnos anteriores (TCAE-RF4)
- [x] Tareas frecuentes en ≤ 3 clics (ENF-RNF1)
- [x] Cifrado de contraseñas y acceso restringido por rol (SYS-RNF1)

---

### 🚀 Milestone 2 — Coordinación Médico-Enfermero (Nota 7) · ✅ COMPLETADO

- [x] Gestión completa de medicación pautada con recálculo automático (SYS-RF1, ENF-RF2)
- [x] Notificaciones visuales en tiempo real al enfermero (ENF-RF3)
- [x] Panel médico con historial clínico completo (MED-RF1)
- [x] Programación de pruebas diagnósticas por el médico (MED-RF3)
- [x] Alertas de restricciones para TCAE (dieta, aislamiento, movilidad) (TCAE-RF2) — campos en BD, UI en TCAEPage
- [x] Visualización del estado de medicación e incidencias básicas para TCAE (TCAE-RF3)
- [x] Registro unificado de cuidados, constantes y balances (SYS-RF2)

---

### ⭐ Milestone 3 — Producto Completo y Pulido (Nota 10) · ✅ COMPLETADO

- [x] Prescripción médica integrada automáticamente en tareas del enfermero + alerta (MED-RF2)
- [x] Cronograma de tareas generales por enfermero (SYS-RF5)
- [x] Cronograma de tareas por paciente dentro de su perfil (SYS-RF6)
- [x] Módulo completo de pruebas de laboratorio e imagen (SYS-RF7)
- [x] Módulo integral de incidencias: rechazos y accidentes de cuidados (SYS-RF8)
- [x] Pulido exhaustivo de UI/UX (refinamiento de todos los paneles)
- [x] Testing integrado para flujos críticos — 43 tests pasando en 11 archivos
- [x] Documentación técnica completa (Swagger API, READMEs)
- [ ] Preparación de la DEMO final — pendiente de revisión con profesor

---

## Visión a Largo Plazo (Post-Académico)

> Las siguientes líneas de evolución quedan fuera del alcance del MVP académico pero definen la dirección natural del producto si se desarrollara en un contexto real.

### v2.0 — Integración Real
- Integración con sistemas hospitalarios reales (SAP, Gacela Care, Silicon) mediante APIs o HL7 FHIR.
- Autenticación corporativa mediante SSO / Active Directory hospitalario.
- Cumplimiento completo LOPD/RGPD clínico y certificación EN 82304-1.

### v3.0 — Plataforma Multiservicio
- Soporte para múltiples plantas y unidades especializadas (UCI, Urgencias, Quirófano).
- Supervisores como nuevo rol con vistas de gestión de planta.
- App móvil nativa para consulta de datos en tiempo real.
- Notificaciones push en dispositivos del personal.

### v4.0 — Inteligencia Clínica
- Alertas proactivas por patrones anómalos en constantes vitales.
- Sugerencias de medicación basadas en el historial del paciente.
- Dashboard analítico para supervisores (carga de trabajo, tiempos de respuesta).
- Integración con sistemas de prescripción electrónica.

---

## Calendario de Sprints

| Sprint | Duración | Objetivo | Estado |
|--------|----------|----------|--------|
| Sprint 1 | Semanas 1-3 | Cimientos y setup | ✅ Completado |
| Sprint 2 | Semanas 4-6 | Core clínico | ✅ Completado |
| Sprint 3 | Semanas 7-9 | Médico + notificaciones | ✅ Completado |
| Sprint 4 | Semanas 10-12 | Pulido final | ✅ Completado |
