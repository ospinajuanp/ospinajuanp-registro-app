import Link from "next/link";
import styles from "./dashboard.module.css";
import { getVisits } from "../actions";
import { redis } from "@/lib/redis";
import type { Kid } from "@/lib/types/kid";
import CacheSettingsToggle from "./CacheSettingsToggle";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dataKids = await redis.get<Kid[]>("dataKids") ?? [];
  const kidsCount = dataKids.length;

  const visits = await getVisits();
  const visitsCount = visits.length;

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Resumen General</h1>
          <p className={styles.headerSubtitle}>Métricas y accesos rápidos de tu aplicación</p>
        </div>
      </div>

      <CacheSettingsToggle />

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{kidsCount}</span>
            <span className={styles.statLabel}>Niños Registrados</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{visitsCount}</span>
            <span className={styles.statLabel}>Historial de Consultas</span>
          </div>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        <Link href="/dashboard/import" className={styles.actionCard}>
          <div className={styles.actionIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3 className={styles.actionTitle}>Importar Datos</h3>
          <p className={styles.actionDesc}>
            Carga masiva de registros a través de archivos Excel (.xlsx, .xls) o CSV.
            Soporta drag and drop y validación de columnas.
          </p>
        </Link>

        <Link href="/dashboard/manage" className={styles.actionCard}>
          <div className={styles.actionIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 className={styles.actionTitle}>Historial de Consultas</h3>
          <p className={styles.actionDesc}>
            Visualiza, descarga o elimina los registros de visitas almacenados en la base de datos.
          </p>
        </Link>
      </div>
    </>
  );
}
