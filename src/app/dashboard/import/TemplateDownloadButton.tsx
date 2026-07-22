"use client";

import * as XLSX from "xlsx";
import { REQUIRED_KID_COLUMNS } from "@/lib/types/kid";

const EXAMPLE_ROW: ReadonlyArray<string> = [
  "RC",
  "1234567890",
  "Ejemplo Apellido Nombre",
  "Sede Principal",
  "Mensual",
  "Si",
  "2024-01-15",
  "08:30",
];

export default function TemplateDownloadButton() {
  const handleDownload = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      REQUIRED_KID_COLUMNS as unknown as string[],
      EXAMPLE_ROW as unknown as string[],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla_importar_ninos.xlsx");
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      aria-label="Descargar plantilla de Excel de ejemplo"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "rgba(34, 197, 94, 0.12)",
        color: "#86efac",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        padding: "0.625rem 1rem",
        borderRadius: "10px",
        fontWeight: 600,
        fontSize: "0.9rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Descargar plantilla (.xlsx)
    </button>
  );
}