"use client";

import { Download } from "lucide-react";
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
  const handleDownload = async () => {
    const XLSX = await import("xlsx");
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
        minHeight: "44px",
      }}
    >
      <Download size={18} aria-hidden />
      Descargar plantilla (.xlsx)
    </button>
  );
}