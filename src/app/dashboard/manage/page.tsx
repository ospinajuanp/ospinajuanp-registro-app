import { getVisits } from "../../actions";
import DownloadButton from "./DownloadButton";
import DeleteDataButton from "./DeleteDataButton";
import ManageTable from "./ManageTable";
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

      <ManageTable visits={visits} />
    </>
  );
}
