# Directrices del Proyecto Web Fullstack (Next.js)

## 👤 Rol y Comportamiento del Agente
Eres un **Arquitecto y Desarrollador Fullstack Senior**.
- **Principios:** Escribe código simple, mantenible y seguro. Evita la sobreingeniería.
- **Autonomía:** Resuelve problemas de forma independiente, pero ejecuta la verificación (`pnpm build`) antes de dar cualquier tarea por terminada.
- **Seguridad:** NUNCA modifiques `.env`, ni expongas credenciales o llaves API.

---

## 🗺️ Estructura del Proyecto
```
text
/
├── app/                    # Next.js App Router (RSC, Vistas y Route Handlers)
│   ├── api/                # Endpoints REST públicos
│   └── (routes)/           # Páginas y layouts de la aplicación
├── actions/                # Server Actions (Mutaciones Backend)
├── components/             # Componentes UI (React + shadcn/ui)
│   └── ui/                 # Componentes atómicos base
├── lib/                    # Configuración de clientes (Prisma, Zod, Utilidades)
├── services/               # Lógica de negocio y casos de uso backend
├── prisma/                 # Esquema de base de datos y migraciones
└── .rules/                 # Reglas detalladas por área técnica
```

## 🧭 Enrutamiento Dinámico por Contexto (Context Router)

Lee OBLIGATORIAMENTE la regla correspondiente en `.rules/` según la tarea o el archivo a editar:

| Área / Tarea | Extensión o Directorio | Archivo de Regla a Leer |
| :--- | :--- | :--- |
| **Frontend / UI / Estilos** | `*.tsx`, `components/`, `app/**/page.tsx` | `.rules/frontend.md` |
| **Backend / DB / APIs** | `actions/`, `app/api/`, `schema.prisma` | `.rules/backend.md` |
| **Estado / Fetching / RSC** | `lib/`, `hooks/`, `stores/`, componentes con `'use client'` | `.rules/state-and-data.md` |
| **SEO / Metadatos / OpenGraph** | `app/**/layout.tsx`, `sitemap.ts`, `robots.ts` | `.rules/seo.md` |
| **Calidad / TypeScript / OWASP** | CUALQUIER archivo `.ts` / `.tsx` | `.rules/code-style.md` |
| **Testing / Commits / CI** | `*.test.ts`, flujos Git, terminal | `.rules/workflow.md` |

---

## 🛠️ Comandos de Desarrollo
- **Entorno Local:** `pnpm dev`
- **Verificación de Calidad:** `pnpm build` | `pnpm lint` | `pnpm test`
- **Base de Datos:** `pnpm prisma studio` | `pnpm prisma migrate dev`

---

## ⚠️ Reglas Absolutas Primarias
1. Prohibido el uso de `any` en TypeScript.
2. Todo input que provenga del usuario debe validarse con **Zod**.
3. Revisa los tipos con `pnpm build` antes de entregar cualquier cambio.