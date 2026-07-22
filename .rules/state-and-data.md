# Reglas de Estado y Gestión de Datos (Next.js App Router)

## 🔄 1. Server Components vs. Client Components
- **Servidor por Defecto:** Mantén los componentes en el servidor (`RSC`) siempre que sea posible para reducir el JS enviado al navegador.
- **Client Components:** Usa `'use client'` ÚNICAMENTE cuando necesites interactividad (`useState`, `useEffect`), eventos (`onClick`) o APIs del navegador.
- **Elevación de Estado:** Pasa los componentes de cliente como `children` a los Server Components para mantener las vistas pesadas en el servidor.

## 📡 2. Fetching de Datos y Caché
- **Fetching Directo:** Haz las consultas de datos (`prisma.user.findMany()`) directamente dentro de Server Components o Server Actions. No uses `fetch()` interno para llamar a tu propia API en el mismo servidor.
- **Gestión de Estado Global:** Si el proyecto requiere estado global en cliente (Zustand/Jotai), aísla el `Provider` en un componente de cliente y envuélvelo en el `layout.tsx` principal.