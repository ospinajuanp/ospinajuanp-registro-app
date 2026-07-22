import { getVisits } from "../../actions";
import DownloadButton from "./DownloadButton";
import DeleteDataButton from "./DeleteDataButton";
import styles from "../dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const visits = await getVisits();

  return (
    <>
      <div className={styles.header} style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className={styles.headerTitle}>Historial de Consultas</h1>
          <p className={styles.headerSubtitle}>
            Registro total de búsquedas en el sistema · {visits.length} entradas
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <DownloadButton data={visits} />
          <DeleteDataButton count={visits.length} />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableScroll}>
          <table className={styles.manageTable}>
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>ID Buscado</th>
                <th>Nombre</th>
                <th>Dispositivo</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.uniqueId}>
                  <td>{new Date(visit.timestamp).toLocaleString()}</td>
                  <td>
                    <span style={{
                      background: "rgba(56,189,248,0.1)",
                      color: "#38bdf8",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      border: "1px solid rgba(56,189,248,0.2)",
                      display: "inline-block",
                    }}>
                      {visit.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: "#f8fafc" }}>
                    {visit.name || <span style={{ opacity: 0.4 }}>N/A</span>}
                  </td>
                  <td style={{
                    maxWidth: "240px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                  }}>
                    {visit.device}
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyCell ?? ""} style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 1rem", opacity: 0.4 }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No hay consultas registradas aún.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
