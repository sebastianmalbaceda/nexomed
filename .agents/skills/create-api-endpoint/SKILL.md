---
name: create-api-endpoint
description: |
  Usar cuando se necesita crear un nuevo endpoint REST en el backend de NexoMed.
  Triggers: "crea un endpoint para", "añade una ruta para", "nuevo endpoint de", "crear API para".
  NO usar para modificar endpoints existentes (en ese caso, editar directamente).
---

# Skill: Crear Endpoint REST en NexoMed

## 1. Estructura de archivos

Cada entidad requiere 3 archivos siguiendo el patrón existente:

```
backend/src/
├── routes/[entidad].routes.ts       ← Definición de rutas
├── controllers/[entidad].controller.ts  ← Orquestación (máx 20 líneas)
└── services/[entidad].service.ts    ← Lógica de negocio
```

Si la entidad necesita validación, añadir:
```
backend/src/validations/[entidad].validation.ts  ← Schema Zod
```

## 2. Rutas

```typescript
// routes/[entidad].routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { [Entidad]Controller } from '../controllers/[entidad].controller';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['NURSE', 'DOCTOR', 'TCAE']), [Entidad]Controller.getAll);
router.get('/:id', roleMiddleware(['NURSE', 'DOCTOR', 'TCAE']), [Entidad]Controller.getById);
router.post('/', roleMiddleware(['DOCTOR']), [Entidad]Controller.create);
router.put('/:id', roleMiddleware(['DOCTOR']), [Entidad]Controller.update);
router.delete('/:id', roleMiddleware(['DOCTOR']), [Entidad]Controller.remove);

export default router;
```

Registrar en `backend/src/index.ts`:
```typescript
import [entidad]Routes from './routes/[entidad].routes';
app.use('/api/[rutas]', [entidad]Routes);
```

## 3. Controller

Máximo 20 líneas. Solo orquestación — toda la lógica va al service.

```typescript
// controllers/[entidad].controller.ts
import { Request, Response } from 'express';
import { [entidad]Service } from '../services/[entidad].service';

export const [Entidad]Controller = {
  getAll: async (_req: Request, res: Response) => {
    const data = await [entidad]Service.getAll();
    res.json({ data });
  },

  getById: async (req: Request, res: Response) => {
    const data = await [entidad]Service.getById(req.params.id);
    res.json({ data });
  },

  create: async (req: Request, res: Response) => {
    const data = await [entidad]Service.create(req.body, req.user!.id);
    res.status(201).json({ data });
  },

  update: async (req: Request, res: Response) => {
    const data = await [entidad]Service.update(req.params.id, req.body, req.user!.id);
    res.json({ data });
  },

  remove: async (req: Request, res: Response) => {
    await [entidad]Service.remove(req.params.id);
    res.status(204).send();
  },
};
```

## 4. Service

Toda la lógica de negocio, validaciones complejas y notificaciones.

```typescript
// services/[entidad].service.ts
import { prisma } from '../lib/prismaClient';

export const [entidad]Service = {
  async getAll() {
    return prisma.[modelo].findMany({ include: { relations: true } });
  },

  async getById(id: string) {
    const entity = await prisma.[modelo].findUnique({ where: { id }, include: { relations: true } });
    if (!entity) throw new Error('Recurso no encontrado');
    return entity;
  },

  async create(data: any, userId: string) {
    return prisma.[modelo].create({ data: { ...data, createdBy: userId } });
  },

  async update(id: string, data: any, userId: string) {
    const existing = await prisma.[modelo].findUnique({ where: { id } });
    if (!existing) throw new Error('Recurso no encontrado');
    return prisma.[modelo].update({ where: { id }, data });
  },

  async remove(id: string) {
    const existing = await prisma.[modelo].findUnique({ where: { id } });
    if (!existing) throw new Error('Recurso no encontrado');
    return prisma.[modelo].delete({ where: { id } });
  },
};
```

## 5. Validación Zod (cuando aplique)

```typescript
// validations/[entidad].validation.ts
import { z } from 'zod';

export const create[Entidad]Schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  // ... campos requeridos
});
```

Usar en el controller:
```typescript
const parsed = create[Entidad]Schema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
```

## 6. Códigos HTTP

| Código | Cuándo |
|--------|--------|
| 200 | GET/PUT exitoso |
| 201 | POST exitoso (recurso creado) |
| 204 | DELETE exitoso (sin body) |
| 400 | Validación fallida |
| 401 | Sin token o token inválido |
| 403 | Rol sin permiso |
| 404 | Recurso no encontrado |
| 409 | Conflicto de negocio (ej: duplicado) |

## 7. Respuesta JSON

Siempre: `{ data: ... }` para éxito, `{ error: "mensaje" }` para error.
