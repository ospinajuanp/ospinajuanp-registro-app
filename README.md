# Aplicación de Registro de Niños

Esta aplicación permite buscar información de entrega de paquetes para niños utilizando su número de documento. La información se gestiona a través de un archivo Excel que se convierte automáticamente a JSON para su uso en la web.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- npm (incluido con Node.js)

## Comandos Principales

### Desarrollo y Producción

*   **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```
*   **Construir para producción:**
    ```bash
    npm run build
    ```
*   **Iniciar en producción:**
    ```bash
    npm run start
    ```

### Gestión de Datos (Excel)

*   **Generar Excel de prueba:** Crea un archivo `datos.xlsx` con datos de ejemplo.
    ```bash
    npm run excel:create
    ```
*   **Convertir Excel a JSON:** Toma el contenido de `datos.xlsx` y lo guarda en `src/data/registros.json`.
    ```bash
    npm run excel:convert
    ```
*   **Sincronizar todo:** Ejecuta la creación y la conversión en un solo paso.
    ```bash
    npm run excel:sync
    ```

## Estructura de Datos

El sistema espera un Excel con las siguientes columnas:

- **Tipo de documento del niño** (Ej: Rc, Ti)
- **Número de documento del niño** (Campo de búsqueda)
- **Nombre completo del niño**
- **Sede**
- **Tipo de paquete**
- **Recibe paquete** (si/no)
- **fecha**
- **hora**

## Tecnologías Utilizadas

- **Frontend:** Next.js (App Router), React, CSS puro.
- **Backend:** Next.js API Routes.
- **Procesamiento de datos:** biblioteca `xlsx` para manejo de archivos Excel.
