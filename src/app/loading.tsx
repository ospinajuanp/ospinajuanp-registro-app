export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        minHeight: "50vh",
        color: "#94a3b8",
        padding: "2rem",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(56,189,248,0.2)",
          borderTopColor: "#38bdf8",
          borderRadius: "50%",
          animation: "spin 0.85s linear infinite",
        }}
      />
      <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>Cargando…</span>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}