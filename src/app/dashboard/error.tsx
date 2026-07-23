"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        maxWidth: 520,
        margin: "2rem auto",
        background: "rgba(30, 41, 59, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 20,
        padding: "2rem",
        textAlign: "center",
        color: "#f8fafc",
      }}
    >
      <AlertTriangle
        size={40}
        aria-hidden
        style={{ color: "#fca5a5", marginBottom: "0.75rem" }}
      />
      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        Error en el panel
      </h2>
      <p
        style={{
          color: "#94a3b8",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          marginBottom: "1.5rem",
        }}
      >
        No se pudo cargar esta sección del panel. Reintenta o vuelve a la
        página anterior.
      </p>
      {error.digest && (
        <p
          style={{
            color: "#64748b",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            marginBottom: "1rem",
          }}
        >
          {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "0.75rem 1.25rem",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        <RefreshCw size={18} aria-hidden /> Reintentar
      </button>
    </div>
  );
}