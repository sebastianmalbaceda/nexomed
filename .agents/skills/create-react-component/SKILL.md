---
name: create-react-component
description: |
  Usar cuando se necesita crear un nuevo componente React en el frontend de NexoMed.
  Triggers: "crea un componente para", "nuevo componente de", "añade una página para", "crear vista de".
  NO usar para modificar componentes existentes.
---

# Skill: Crear Componente React en NexoMed

## 1. Ubicación

- Componentes reutilizables: `frontend/src/app/components/[categoria]/[Nombre].tsx`
- Páginas (rutas): `frontend/src/app/pages/[Nombre]Page.tsx`
- Custom hooks: `frontend/src/app/hooks/use[Nombre].ts`
- Stores Zustand: `frontend/src/app/store/[nombre]Store.ts`

## 2. Estructura de componente

```tsx
// components/[categoria]/[Nombre].tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { [Tipo] } from '@/lib/types';

interface [Nombre]Props {
  // props aquí
}

export function [Nombre]({ }: [Nombre]Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['[entidad]'],
    queryFn: () => api.get<[Tipo]>('/[ruta]'),
  });

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="...">
      {/* Solo clases Tailwind, sin CSS en línea */}
    </div>
  );
}
```

## 3. Estructura de página

```tsx
// pages/[Nombre]Page.tsx
import { [NombreComponent] } from '@/components/[categoria]/[Nombre]';

export default function [Nombre]Page() {
  return <[NombreComponent] />;
}
```

Registrar ruta en `frontend/src/app/App.tsx`:
```tsx
<Route path="/[ruta]" element={<[Nombre]Page />} />
```

## 4. Reglas obligatorias

- **NUNCA** usar `useState` para formularios — usar React Hook Form + Zod
- **NUNCA** usar `useEffect` + `fetch` manual — usar TanStack Query
- **SOLO** clases Tailwind para estilos — sin CSS en línea
- **SIN** `any` en TypeScript — definir tipos en `@/lib/types.ts`
- **USAR** alias `@/` para importaciones
- **PascalCase** para nombres de componentes
- **Un archivo por componente**

## 5. Formularios (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  nombre: z.string().min(1, 'Campo obligatorio'),
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof formSchema>;

function MiFormulario() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    // enviar datos
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('nombre')} />
      {errors.nombre && <span>{errors.nombre.message}</span>}
      <button type="submit">Enviar</button>
    </form>
  );
}
```

## 6. Componentes UI

Usar componentes de Shadcn UI desde `@/components/ui/`:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

**NUNCA** modificar archivos en `components/ui/` directamente.

## 7. Estado global

Para estado compartido entre componentes, usar Zustand:
```tsx
// store/[nombre]Store.ts
import { create } from 'zustand';

interface [Nombre]State {
  valor: string | null;
  setValor: (valor: string) => void;
}

export const use[Nombre]Store = create<[Nombre]State>((set) => ({
  valor: null,
  setValor: (valor) => set({ valor }),
}));
```
