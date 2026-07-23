import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main
      role="alert"
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
      <FileQuestion
        size={48}
        aria-hidden
        style={{ color: "#38bdf8", marginBottom: "1rem" }}
      />
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
        404 — Página no encontrada
      </h1>
      <p
        style={{
          color: "#94a3b8",
          fontSize: "0.95rem",
          lineHeight: 1.5,
          marginBottom: "1.5rem",
        }}
      >
        La página que buscas no existe o fue movida. Verifica la URL o vuelve al
        inicio.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
          color: "#fff",
          borderRadius: 12,
          padding: "0.75rem 1.25rem",
          fontWeight: 700,
          fontSize: "0.95rem",
          textDecoration: "none",
          minHeight: 44,
        }}
      >
        <Home size={18} aria-hidden /> Ir al inicio
      </Link>
    </main>
  );
}