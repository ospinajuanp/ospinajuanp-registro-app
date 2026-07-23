"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main
      role="alert"
      aria-live="assertive"
      style={{
        maxWidth: 520,
        margin: "4rem auto",
        background: "rgba(30, 41, 59, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 20,
        padding: "2rem",
        textAlign: "center",
        color: "#f8fafc",
      }}
    >
      <AlertTriangle
        size={48}
        aria-hidden
        style={{ color: "#fca5a5", marginBottom: "1rem" }}
      />
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Algo salió mal
      </h1>
      <p
        style={{
          color: "#94a3b8",
          fontSize: "0.95rem",
          lineHeight: 1.5,
          marginBottom: "1.5rem",
        }}
      >
        Ocurrió un error inesperado. Puedes intentar nuevamente o volver al
        inicio.
      </p>
      {error.digest && (
        <p
          style={{
            color: "#64748b",
            fontSize: "0.8rem",
            fontFamily: "monospace",
            marginBottom: "1.5rem",
          }}
        >
          Código: {error.digest}
        </p>
      )}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={reset}
          style={btnPrimary}
        >
          <RefreshCw size={18} aria-hidden /> Reintentar
        </button>
        <Link href="/" style={btnSecondary}>
          <Home size={18} aria-hidden /> Ir al inicio
        </Link>
      </div>
    </main>
  );
}

const btnPrimary: React.CSSProperties = {
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
  textDecoration: "none",
  minHeight: 44,
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "rgba(255,255,255,0.05)",
  color: "#cbd5e1",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "0.75rem 1.25rem",
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: "pointer",
  textDecoration: "none",
  minHeight: 44,
};