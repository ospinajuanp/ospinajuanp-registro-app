# Reglas de SEO y Visibilidad Web (Next.js App Router)

## 🎯 1. Arquitectura de Metadatos (Metadata API)
- **Metadatos Estáticos y Dinámicos:** Declara `export const metadata: Metadata` en layouts o páginas estáticas. Usa `generateMetadata()` para páginas dinámicas (ej. `/blog/[slug]`).
- **Campos Indispensables en Cada Página:**
  - `title`: Único por página, entre 50-60 caracteres, incluyendo la marca o contexto.
  - `description`: Claro y persuasivo, entre 120-155 caracteres.
  - `openGraph` y `twitter`: Incluye título, descripción, URL canónica e imágenes optimizadas (1200x630px).
- **URLs Canónicas:** Define `alternates: { canonical: '...' }` en cada vista para evitar problemas de contenido duplicado.

## 🏗️ 2. Estructura Semántica y Encabezados (HTML5)
- **Jerarquía de Encabezados Strict:** Cada página debe tener **UN SOLO `<h1>`** principal. Mantén un orden lógico descendente (`<h1>` -> `<h2>` -> `<h3>`). NUNCA saltes de `<h1>` a `<h3>`.
- **Etiquetas Semánticas:** Usa `<header>`, `<main>`, `<article>`, `<section>`, `<aside>` y `<footer>` en lugar de `<div>` genéricos para delimitar las áreas clave.
- **Microdatos y Datos Estructurados (JSON-LD):** Inserta esquemas de Schema.org (`Organization`, `Article`, `Product`, `WebSite`) usando scripts de JSON-LD para habilitar *Rich Snippets* en Google.

## ⚡ 3. Indexación, Rendimiento y Accesibilidad VisuaI
- **Sitemap y Robots:** Genera automáticamente el mapa del sitio usando `app/sitemap.ts` y gestiona la indexación con `app/robots.ts`.
- **Optimización de Medios:**
  - Toda imagen (`next/image`) debe tener un atributo `alt` descriptivo y relevante para la búsqueda (prohibido `alt=""` o descripciones genéricas como "imagen1").
  - Evita enlaces rotos; usa URLs relativas internas y enlaces externos con `rel="noopener noreferrer"`.
- **Core Web Vitals:** Prevé problemas de CLS reservando espacio de imágenes y prioriza la carga de elementos críticos sobre el pliegue (*above-the-fold*) con la propiedad `priority` en `next/image`.