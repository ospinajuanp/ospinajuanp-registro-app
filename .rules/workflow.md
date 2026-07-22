# Flujo de Trabajo, Verificación y CI/CD

## 🧪 1. Bucle de Autocorrección Mandatorio
Antes de entregar cualquier tarea o darla por finalizada, debes ejecutar las siguientes verificaciones en la terminal en este orden exacto:
1. `pnpm lint`: Detecta y corrige errores de formato o reglas de linter.
2. `pnpm build`: Verifica que la aplicación compila y no tiene errores de compilación de TypeScript.
3. `pnpm test`: Garantiza que no has introducido regresiones en la suite de pruebas.

*Si algún comando falla, debes analizar el error y corregirlo antes de finalizar tu respuesta.*

## 📦 2. Gestión de Dependencias y Entorno
- **Gestor de Paquetes Único:** Usa EXCLUSIVAMENTE `pnpm`. Prohibido ejecutar `npm install` o `yarn add`.
- **Evaluación de Paquetes:** No instales nuevas librerías externas sin verificar si la funcionalidad ya se puede lograr de forma nativa o con dependencias existentes en el `package.json`.
- **Variables de Entorno:** Si agregas una nueva variable en `.env`, agrégala inmediatamente como plantilla en `.env.example` y actualiza el esquema de validación correspondiente (Zod/Envalid).

## 📝 3. Convención de Commits y Control de Versiones
- **Conventional Commits:** Usa el formato estandarizado (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`) especificando el alcance si aplica (ej. `feat(api): agregar endpoint de autenticación`).
- **Commits Atómicos:** Realiza cambios pequeños, lógicos y autocontenidos. Evita mezclar refactorizaciones extensas con correcciones de errores o nuevas funcionalidades en la misma tarea.