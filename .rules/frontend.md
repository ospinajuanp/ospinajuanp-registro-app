# Reglas de Frontend (Next.js App Router + React + Tailwind)

## 🏗️ 1. Arquitectura de Componentes y Renderizado
- **Server Components (RSC) por Defecto:** Todo componente en `/app` debe ser RSC. Aísla las partes interactivas en componentes hoja (*leaf components*) con `'use client'`.
- **Estructura de Carpetas:** Organiza los componentes por dominio/característica en lugar de por tipo (ej. `features/auth/components/` en lugar de `components/auth/`).
- **Sistema de Diseño (UI):** Usa únicamente componentes base de `shadcn/ui` y clases utilitarias de Tailwind CSS. Prohibidos los estilos en línea o archivos CSS dedicados.

## ⚡ 2. Performance y Optimización Web Vitals
- **Imágenes y Fuentes:** Usa obligatoriamente `next/image` con dimensiones explícitas/layout responsive y `next/font` para prevenir Cumulative Layout Shift (CLS).
- **Carga Diferida (Lazy Loading):** Importa dinámicamente componentes pesados o modals usando `next/dynamic` o React `lazy` + `Suspense`.
- **Límites de Carga:** Envuelve vistas de datos asíncronas en límites de carga (*Loading Boundaries*) nativos de Next.js (`loading.tsx` o `Suspense`).

## 🔄 3. Estado, Datos y Resiliencia
- **Server Actions & Mutations:** Usa Server Actions para mutaciones de datos con `useActionState` o `useTransition` para gestionar estados de carga imprevistos sin bloquear la UI.
- **Manejo de Errores UI:** Implementa `error.tsx` y *Error Boundaries* granulares en componentes frágiles para evitar fallos catastróficos en toda la aplicación.
- **Estado Cliente:** Usa `Zustand` únicamente para estado global cliente UI (ej. modales, temas). La sincronización de datos con el servidor debe gestionarse con TanStack Query o revalidación de Next.js (`revalidatePath`/`revalidateTag`).