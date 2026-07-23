export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando panel"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        minHeight: "40vh",
        color: "#94a3b8",
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
      <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>Cargando panel…</span>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}