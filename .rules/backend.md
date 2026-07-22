# Reglas de Backend (Next.js API Routes + Server Actions + Prisma)

## 🏗️ 1. Arquitectura de API y Capa de Servicios
- **Ubicación de APIs:** Usa **Route Handlers** (`app/api/.../route.ts`) para APIs REST públicas/externas y **Server Actions** (`actions/` o `app/.../actions.ts`) para mutaciones directas desde la UI.
- **Invocación Segura:** Separa la lógica de negocio en una capa de servicios/casos de uso (`services/` o `lib/`). NUNCA escribas lógica compleja de base de datos directamente dentro de un Route Handler o Server Action.
- **Tipado End-to-End:** Exporta los tipos de entrada y salida de tus servicios para reusarlos en los componentes del cliente.

## 🛡️ 2. Validación, Autenticación y Manejo de Errores
- **Validación con Zod:** Valida toda entrada de datos (cuerpo del `request`, parámetros de URL o argumentos de Server Actions) usando esquemas de **Zod**.
- **Server Actions Seguras:** Trata a las Server Actions como endpoints públicos. Valida SIEMPRE la sesión del usuario y sus permisos dentro de cada acción antes de mutar datos.
- **Respuestas Normalizadas:** Devuelve estructuras de respuesta consistentes para Server Actions (ejemplo: `{ success: boolean, data?: T, error?: string }`).
- **Manejo de Errores HTTP:** En Route Handlers, usa `NextResponse.json()` con los códigos de estado HTTP adecuados (`400`, `401`, `404`, `500`). NUNCA expongas errores crudos del servidor o trazas de Prisma al cliente.

## ⚡ 3. Base de Datos, Prisma y Optimización
- **Instancia Única de Prisma:** Usa un cliente Singleton de Prisma (`lib/prisma.ts`) para evitar agotar el pool de conexiones en desarrollo por el *Hot Reload*.
- **Transacciones ACID:** Usa `$transaction` de Prisma cuando ejecutes mutaciones dependientes múltiples en la base de datos.
- **Paginación Obligatoria:** Todos los endpoints o acciones que consulten colecciones deben implementar paginación (por cursor o `take`/`skip`).
- **Control de Caché:** Usa `revalidatePath` o `revalidateTag` después de mutaciones exitosas en Server Actions para actualizar la caché de Next.js de forma granular.