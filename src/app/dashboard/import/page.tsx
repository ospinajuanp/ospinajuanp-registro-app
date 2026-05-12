"use client";

import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import styles from "../dashboard.module.css";

const REQUIRED_COLUMNS = [
  "Tipo de documento del niño",
  "Número de documento del niño",
  "Nombre completo del niño",
  "Sede",
  "Tipo de paquete",
  "Recibe paquete",
  "fecha",
  "hora"
];

type ImportMode = "merge" | "replace";

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [confirmReplace, setConfirmReplace] = useState(false);

  const validateAndParseExcel = (f: File) => {
    setError(null);
    setSuccess(null);
    setConfirmReplace(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length === 0) {
          setError("El archivo está vacío.");
          return;
        }

        const headers = json[0] as string[];
        const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

        if (missingColumns.length > 0) {
          setError(`Faltan las siguientes columnas requeridas: ${missingColumns.join(", ")}`);
          return;
        }

        const rows = XLSX.utils.sheet_to_json(worksheet);
        setParsedData(rows);
        setFile(f);
      } catch (err) {
        console.error(err);
        setError("Error al leer el archivo. Asegúrate de que sea un archivo Excel o CSV válido.");
      }
    };
    reader.readAsBinaryString(f);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndParseExcel(droppedFile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndParseExcel(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!parsedData) return;
    if (mode === "replace" && !confirmReplace) {
      setError("Debes marcar la casilla de confirmación antes de continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: parsedData, mode }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al subir los datos");

      setSuccess(
        mode === "replace"
          ? `¡Éxito! La base de datos fue reemplazada con ${result.count} registros nuevos.`
          : `¡Éxito! Se fusionaron ${result.count} registros con los datos existentes.`
      );
      setFile(null);
      setParsedData(null);
      setConfirmReplace(false);
    } catch (err: any) {
      setError(err.message || "Error de conexión al subir los datos");
    } finally {
      setLoading(false);
    }
  };

  const selectMode = (m: ImportMode) => {
    setMode(m);
    setConfirmReplace(false);
    setError(null);
  };

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Importar Datos</h1>
          <p className={styles.headerSubtitle}>
            Sube archivos Excel o CSV para actualizar la base de datos de niños
          </p>
        </div>
      </div>

      {/* ── Step 1: Mode selector ── */}
      <p style={{ color: "#94a3b8", marginBottom: "1rem", fontWeight: 600 }}>
        Paso 1 — Elige cómo quieres importar los datos:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        {/* Merge */}
        <button
          onClick={() => selectMode("merge")}
          style={{
            background: mode === "merge" ? "rgba(56,189,248,0.12)" : "rgba(30,41,59,0.5)",
            border: mode === "merge" ? "2px solid rgba(56,189,248,0.6)" : "2px solid rgba(255,255,255,0.06)",
            borderRadius: "20px",
            padding: "1.75rem",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔀</div>
          <h3 style={{ color: mode === "merge" ? "#38bdf8" : "#f8fafc", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Agregar / Actualizar
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: "1.6", margin: 0 }}>
            Los registros nuevos se <strong style={{ color: "#cbd5e1" }}>suman</strong> a los existentes.
            Si un niño ya está (mismo número de documento), sus datos se actualizan.
            El resto queda intacto. <strong style={{ color: "#cbd5e1" }}>✅ Opción segura.</strong>
          </p>
          {mode === "merge" && (
            <div style={{ marginTop: "1rem", display: "inline-block", background: "rgba(56,189,248,0.2)", color: "#38bdf8", padding: "0.3rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700 }}>
              ✓ Seleccionado
            </div>
          )}
        </button>

        {/* Replace */}
        <button
          onClick={() => selectMode("replace")}
          style={{
            background: mode === "replace" ? "rgba(239,68,68,0.1)" : "rgba(30,41,59,0.5)",
            border: mode === "replace" ? "2px solid rgba(239,68,68,0.5)" : "2px solid rgba(255,255,255,0.06)",
            borderRadius: "20px",
            padding: "1.75rem",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>♻️</div>
          <h3 style={{ color: mode === "replace" ? "#f87171" : "#f8fafc", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Reemplazar Todo
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: "1.6", margin: 0 }}>
            <strong style={{ color: "#fca5a5" }}>Se borran TODOS los datos actuales</strong> y se reemplazan
            solo por los del archivo. Úsalo cuando quieras empezar desde cero.{" "}
            <strong style={{ color: "#fca5a5" }}>⚠️ No se puede deshacer.</strong>
          </p>
          {mode === "replace" && (
            <div style={{ marginTop: "1rem", display: "inline-block", background: "rgba(239,68,68,0.2)", color: "#f87171", padding: "0.3rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700 }}>
              ✓ Seleccionado
            </div>
          )}
        </button>
      </div>

      {/* ── Step 2: File drop ── */}
      <p style={{ color: "#94a3b8", marginBottom: "1rem", fontWeight: 600 }}>
        Paso 2 — Selecciona el archivo a importar:
      </p>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.active : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById("fileUpload")?.click()}
      >
        <input
          type="file"
          id="fileUpload"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className={styles.uploadIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <h3 className={styles.uploadText}>Haz clic o arrastra tu archivo aquí</h3>
        <p className={styles.uploadSub}>Formatos soportados: .xlsx, .xls, .csv</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {success && <div className={styles.successMessage}>{success}</div>}

      {/* ── Step 3: Review & confirm ── */}
      {file && parsedData && !error && (
        <>
          <p style={{ color: "#94a3b8", margin: "1.5rem 0 1rem", fontWeight: 600 }}>
            Paso 3 — Revisa y confirma la importación:
          </p>
          <div className={styles.fileInfoCard} style={{ flexDirection: "column", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h4 style={{ color: "#fff", marginBottom: "0.25rem" }}>📄 {file.name}</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  {parsedData.length} registros detectados &middot; Modo:{" "}
                  <strong style={{ color: mode === "merge" ? "#38bdf8" : "#f87171" }}>
                    {mode === "merge" ? "Agregar / Actualizar" : "Reemplazar Todo"}
                  </strong>
                </p>
              </div>
            </div>

            {mode === "replace" && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "1rem", cursor: "pointer", width: "100%" }}>
                <input
                  type="checkbox"
                  checked={confirmReplace}
                  onChange={(e) => setConfirmReplace(e.target.checked)}
                  style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ color: "#fca5a5", fontSize: "0.9rem", lineHeight: "1.5" }}>
                  Entiendo que esta acción <strong>eliminará permanentemente todos los registros actuales</strong> de la base de datos y los reemplazará con los {parsedData.length} registros del archivo. Esta acción no se puede deshacer.
                </span>
              </label>
            )}

            <button
              className={styles.btnPrimary}
              onClick={handleUpload}
              disabled={loading || (mode === "replace" && !confirmReplace)}
              style={{
                alignSelf: "flex-end",
                opacity: loading || (mode === "replace" && !confirmReplace) ? 0.5 : 1,
              }}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Procesando...
                </>
              ) : mode === "replace" ? (
                "⚠️ Reemplazar Base de Datos"
              ) : (
                "🚀 Cargar e Integrar"
              )}
            </button>
          </div>
        </>
      )}
    </>
  );
}
