"use client";

import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "../dashboard.module.css";
import { REQUIRED_KID_COLUMNS } from "@/lib/types/kid";
import TemplateDownloadButton from "./TemplateDownloadButton";

const REQUIRED_COLUMNS: readonly string[] = REQUIRED_KID_COLUMNS;

type ImportMode = "merge" | "replace";

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<Array<Record<string, unknown>> | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [confirmReplace, setConfirmReplace] = useState(false);

  const validateAndParseExcel = useCallback((f: File) => {
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

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
        if (rows.length === 0) {
          setError("El archivo no contiene registros válidos (solo encabezados).");
          return;
        }

        setParsedData(rows);
        setFile(f);
      } catch (err) {
        console.error(err);
        setError("Error al leer el archivo. Asegúrate de que sea un archivo Excel o CSV válido.");
      }
    };
    reader.readAsBinaryString(f);
  }, []);

  // ── Global drag & drop: capture file dropped anywhere on the page ──
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);

      const droppedFile = e.dataTransfer?.files[0];
      if (droppedFile) {
        const ext = droppedFile.name.split(".").pop()?.toLowerCase();
        if (ext === "xlsx" || ext === "xls" || ext === "csv") {
          validateAndParseExcel(droppedFile);
        } else {
          setError("Formato no soportado. Solo se aceptan archivos .xlsx, .xls o .csv");
        }
      }
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [validateAndParseExcel]);

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

      const totalMsg = result.total ? ` (Total en BD: ${result.total})` : "";

      setSuccess(
        mode === "replace"
          ? `¡Éxito! La base de datos fue reemplazada con ${result.count} registros nuevos.`
          : `¡Éxito! Se agregaron/actualizaron ${result.count} registros.${totalMsg}`
      );
      setFile(null);
      setParsedData(null);
      setConfirmReplace(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión al subir los datos");
    } finally {
      setLoading(false);
    }
  };

  const selectMode = (m: ImportMode) => {
    setMode(m);
    setConfirmReplace(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      {/* Full-page drag overlay */}
      {isDragging && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          pointerEvents: "none",
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p style={{ color: "#38bdf8", fontSize: "1.3rem", fontWeight: 700 }}>
            Suelta el archivo aquí
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            .xlsx, .xls o .csv
          </p>
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Importar Datos</h1>
          <p className={styles.headerSubtitle}>
            Sube archivos Excel o CSV para actualizar la base de datos de niños
          </p>
        </div>
      </div>

      {/* ── Step 1: Mode selector ── */}
      <p className={styles.stepLabel}>
        Paso 1 — Elige cómo quieres importar los datos:
      </p>
      <div className={styles.modeGrid}>
        {/* Merge */}
        <button
          type="button"
          onClick={() => selectMode("merge")}
          aria-pressed={mode === "merge"}
          className={styles.modeCard}
          style={{
            background: mode === "merge" ? "rgba(56,189,248,0.12)" : "rgba(30,41,59,0.5)",
            border: mode === "merge" ? "2px solid rgba(56,189,248,0.6)" : "2px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className={styles.modeEmoji}>🔀</span>
          <span className={styles.modeCardTitle} style={{ color: mode === "merge" ? "#38bdf8" : "#f8fafc" }}>
            Agregar / Actualizar
          </span>
          <span className={styles.modeCardDesc}>
            Los registros nuevos se <strong style={{ color: "#cbd5e1" }}>suman</strong> a los existentes.
            Si un niño ya está (mismo número de documento), sus datos se actualizan.
            El resto queda intacto. <strong style={{ color: "#cbd5e1" }}>✅ Opción segura.</strong>
          </span>
          {mode === "merge" && (
            <span className={styles.modeBadge} style={{ background: "rgba(56,189,248,0.2)", color: "#38bdf8" }}>
              ✓ Seleccionado
            </span>
          )}
        </button>

        {/* Replace */}
        <button
          type="button"
          onClick={() => selectMode("replace")}
          aria-pressed={mode === "replace"}
          className={styles.modeCard}
          style={{
            background: mode === "replace" ? "rgba(239,68,68,0.1)" : "rgba(30,41,59,0.5)",
            border: mode === "replace" ? "2px solid rgba(239,68,68,0.5)" : "2px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className={styles.modeEmoji}>♻️</span>
          <span className={styles.modeCardTitle} style={{ color: mode === "replace" ? "#f87171" : "#f8fafc" }}>
            Reemplazar Todo
          </span>
          <span className={styles.modeCardDesc}>
            <strong style={{ color: "#fca5a5" }}>Se borran TODOS los datos actuales</strong> y se reemplazan
            solo por los del archivo. Úsalo cuando quieras empezar desde cero.{" "}
            <strong style={{ color: "#fca5a5" }}>⚠️ No se puede deshacer.</strong>
          </span>
          {mode === "replace" && (
            <span className={styles.modeBadge} style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>
              ✓ Seleccionado
            </span>
          )}
        </button>
      </div>

      {/* ── Step 2: File drop zone ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <p className={styles.stepLabel} style={{ margin: 0 }}>
          Paso 2 — Selecciona el archivo a importar:
        </p>
        <TemplateDownloadButton />
      </div>
      <label
        htmlFor="fileUpload"
        className={`${styles.dropZone} ${isDragging ? styles.active : ""}`}
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
        <span className={styles.uploadText}>Haz clic o arrastra tu archivo aquí</span>
        <span className={styles.uploadSub} style={{ display: "block" }}>
          También puedes soltar el archivo en <strong>cualquier parte</strong> de la página
        </span>
      </label>

      {error && (
        <div className={styles.errorMessage}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {success && <div className={styles.successMessage}>{success}</div>}

      {/* ── Step 3: Review & confirm ── */}
      {file && parsedData && !error && (
        <>
          <p className={styles.stepLabel} style={{ marginTop: "1.5rem" }}>
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
              type="button"
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
