# Guía de Estilo, Arquitectura y Calidad de Código

## 📐 1. TypeScript Estricto y Tipado
- **Zero `any`:** Prohibido el uso de `any`. Usa `unknown` cuando el tipo sea incierto y aplica *Type Guards* o *Type Narrowing*.
- **Tipado Explícito:** Toda función debe declarar sus tipos de retorno y parámetros explícitamente.
- **Tipos vs Interfaces:** Usa `interface` para definir formas de objetos/clases exportables y `type` para uniones, intersecciones o utilidades.
- **Inmutabilidad:** Declara arrays y objetos como `readonly` siempre que no requieran mutación explícita.

## 🔒 2. Seguridad (Prácticas OWASP Top 10)
- **Sanitización de Entradas:** NUNCA confíes en los datos del usuario. Sanitiza y valida todo input en el cliente y backend antes de procesarlo.
- **Inyección de Código:** NUNCA ejecutes consultas SQL/NoSQL en texto plano o HTML dinámico usando `dangerouslySetInnerHTML` sin sanitizar.
- **Secretos y Tokens:** Prohibido escribir llaves API, tokens, JWT o credenciales *hardcoded* en el código. Usa `process.env` tipado con Zod o Envalid.
- **Principio de Mínimo Privilegio:** Expon únicamente los campos necesarios en las respuestas HTTP (evita devolver objetos completos de la base de datos).

## 🧹 3. Clean Code y Mantenibilidad
- **Responsabilidad Única (SRP):** Una función o componente debe hacer **una sola cosa y hacerla bien**. Si supera las 30-40 líneas, evalúa dividirlo.
- **Nombres Semánticos:** Usa nombres descriptivos en inglés (`fetchUserProfile` en lugar de `getData`, `isUserActive` en lugar de `check`).
- **Nivel de Abstracción Unificado:** No mezcles lógica de bajo nivel (manipulación de cadenas, cálculos) con lógica de alto nivel (llamadas a APIs) en el mismo bloque.
- **Cláusulas de Guarda (Early Exit / Return Fast):** Evita el anidamiento profundo de condicionales `if/else`. Evalúa y retorna de inmediato las condiciones de error o casos límite al inicio de la función para mantener el flujo principal limpio y plano.
```
typescript
// ❌ MAL (Anidamiento innecesario)
function processUser(user) {
  if (user) {
    if (user.isActive) {
      return save(user);
    }
  }
}

// ✅ BIEN (Guard Clauses)
function processUser(user: User): ProcessResult {
  if (!user || !user.isActive) return { success: false };
  return save(user);
}
```
## 🏗️ 4. Patrones de Diseño Recomendados
- **Inyección de Dependencias (DI):** En backend (NestJS), desacopla la lógica inyectando interfaces de servicios en lugar de instanciar clases directamente.
- **Patrón Repositorio / DAO:** Separa la lógica de acceso a datos (Prisma/TypeORM) de la lógica de negocio.
- **Factory & Strategy:** Usa el patrón *Strategy* para reemplazar bloques extensos de `switch/case` cuando manejes múltiples algoritmos o proveedores de pago/auth.
- **Custom Hooks (Frontend):** Encapsula lógica compleja de React en Custom Hooks reusables (`useDebounce`, `useAuth`, `useLocalStorage`).

## 🧪 5. Estrategia de Testing y Calidad
- **Pruebas Unitarias (Jest / Vitest):**
  - Aplica la estructura **AAA (Arrange, Act, Assert)** en cada prueba.
  - Testea casos de borde (valores nulos, arrays vacíos, errores de red) y no solo el camino feliz (*happy path*).
  - Mantén las pruebas unitarias aisladas usando *Mocks* o *Stubs* para dependencias externas.
- **Cobertura y Mantenibilidad:** Prioriza testear lógica de negocio crítica (servicios, cálculos, utilidades) por encima de componentes puramente visuales.
- **Determinismo:** Los tests deben ser idempotentes. NUNCA dependas de estados globales compartidos o fechas hardcodeadas sin *mockear*.