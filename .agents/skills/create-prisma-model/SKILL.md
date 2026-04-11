---
name: create-prisma-model
description: |
  Usar cuando se necesita crear o modificar modelos en el schema de Prisma de NexoMed.
  Triggers: "crea un modelo para", "añade un campo a", "modifica el schema", "nueva tabla", "nueva relación".
  NO usar para consultas SQL directas (usar Prisma Client siempre).
---

# Skill: Crear Modelo Prisma en NexoMed

## 1. Ubicación

El schema está en `backend/prisma/schema.prisma`.

## 2. Convenciones de nombrado

- Modelos: PascalCase singular (`User`, `Patient`, `Bed`)
- Campos: camelCase (`firstName`, `createdAt`)
- Relaciones: usar nombres descriptivos cuando hay múltiples relaciones al mismo modelo

## 3. Tipos disponibles

```prisma
// Enums del proyecto
enum Role {
  NURSE
  DOCTOR
  TCAE
}
```

## 4. Patrón de modelo estándar

```prisma
model [NombreModelo] {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Campos de negocio aquí
  
  // Relaciones
  relatedModel RelatedModel @relation(fields: [relatedModelId], references: [id])
  relatedModelId String
}
```

## 5. Relaciones

### Uno a uno
```prisma
model Patient {
  bedId String? @unique
  bed   Bed?    @relation(fields: [bedId], references: [id])
}

model Bed {
  patient Patient?
}
```

### Uno a muchos
```prisma
model User {
  medications Medication[]
}

model Medication {
  prescribedBy   User   @relation("PrescribedBy", fields: [prescribedById], references: [id])
  prescribedById String
}
```

### Muchos a muchos (implícito)
```prisma
model Patient {
  allergies String[]
}
```

## 6. Después de modificar el schema

```bash
cd backend
npx prisma migrate dev --name descripcion-del-cambio
npx prisma generate
```

## 7. Reglas importantes

- **NUNCA** modificar migraciones existentes
- **SIEMPRE** crear nueva migración para cada cambio
- Usar `@unique` para campos que deben ser únicos
- Usar `@relation` con nombre cuando hay múltiples relaciones al mismo modelo
- Campos opcionales llevan `?` (ej: `String?`)
- Arrays usan `[]` (ej: `String[]`)
- Fechas: `DateTime @default(now())` o `DateTime @updatedAt`

## 8. Ejemplo completo

```prisma
model Medication {
  id           String   @id @default(uuid())
  patient      Patient  @relation(fields: [patientId], references: [id])
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
```
