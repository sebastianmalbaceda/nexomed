# Guía para el equipo - Configuración tras Pull

## Cambios importantes en esta versión

✅ **Schema de BD actualizado:**
- Campo `password` renombrado a `passwordHash` en tabla `User`
- Añadido `assignedNurseId` y `surnames` en tabla `Patient`
- Nuevos archivos: `ErrorBoundary.tsx`, `error.middleware.ts`

---

## Pasos para que todo funcione (IMPORTANTE)

### 1. Hacer Pull de los cambios
```powershell
cd C:\Users\TU_USUARIO\Desktop\NexoMed
git pull origin main
```

### 2. Instalar dependencias actualizadas
```powershell
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Sincronizar la Base de Datos (CRÍTICO)

Si tu base de datos **ya tiene datos** (usuarios, pacientes):

```powershell
cd backend

# Opción A: Aplicar el script SQL directo (recomendado - preserva datos)
# Este script renombra la columna y añade los nuevos campos
npx prisma db execute --file=rename_password.sql

# Luego regenerar el cliente Prisma
npx prisma generate
```

Si tu base de datos **está vacía** o no te importan los datos:

```powershell
cd backend

# Opción B: Forzar reseteo (BORRA TODOS LOS DATOS)
npx prisma db push --force-reset

# Regenerar cliente
npx prisma generate

# Volver a poblar con datos de prueba
npx prisma db seed
```

Si usas **Neon** y tienes problemas de conexión:
- Verifica que el archivo `backend/.env` tenga la `DATABASE_URL` correcta
- Asegúrate de que el proyecto Neon esté activo (no en pausa)

### 4. Verificar que todo compila
```powershell
# Terminal 1 - Backend
cd backend
npm run build  # Debe salir sin errores

# Terminal 2 - Frontend
cd frontend
npm run build  # Debe salir sin errores
```

### 5. Ejecutar el proyecto
```powershell
# Terminal 1 - Backend
cd backend
npm run dev  # Debe mostrar: "NexoMed backend corriendo en puerto 3000"

# Terminal 2 - Frontend
cd frontend
npm run dev  # Debe mostrar: "VITE vX.X.X ready in XXXms"
```

---

## Verificación rápida

1. Abre http://localhost:5173/
2. Inicia sesión con:
   - **Email:** `dr.garcia@nexomed.es`
   - **Contraseña:** `password123`
3. Deberías ver el dashboard sin errores en consola

---

## Si algo falla

### Error 500 en login:
- Verifica que ejecutaste `npx prisma generate` después de sincronizar la BD
- Asegúrate de que la columna en la BD se llama `passwordHash`, no `password`

### Error de compilación TypeScript:
- Borra `node_modules` y `package-lock.json`, luego `npm install`
- En backend: borra `node_modules/.prisma` y ejecuta `npx prisma generate`

### Error de conexión a BD:
- Verifica `backend/.env` - la `DATABASE_URL` debe apuntar a tu instancia de Neon
- Ejecuta `npx prisma db pull` para verificar conexión

---

## Cambios en el código (para referencia)

| Archivo | Cambio |
|---------|--------|
| `schema.prisma` | `password` → `passwordHash`, añadido `assignedNurseId` |
| `auth.controller.ts` | `user.password` → `user.passwordHash` |
| `seed.ts` | `password:` → `passwordHash:` |
| `notification.service.ts` | Notifica al enfermero asignado, no a todos |
| `main.tsx` | Añadido `ErrorBoundary` wrapper |
| `hospital/index.ts` | Eliminado (barrel file innecesario) |
| `BedMap.tsx` | Eliminado (código muerto) |

---

**¡Listo! Con estos pasos tu equipo tendrá todo funcionando correctamente.** 🚀
