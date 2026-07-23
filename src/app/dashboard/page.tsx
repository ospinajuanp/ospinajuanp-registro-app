import Link from "next/link";
import { Database, Users, Upload, FileText } from "lucide-react";
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
            <Users size={28} aria-hidden />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{kidsCount}</span>
            <span className={styles.statLabel}>Niños Registrados</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Database size={28} aria-hidden />
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
            <Upload size={24} aria-hidden />
          </div>
          <h3 className={styles.actionTitle}>Importar Datos</h3>
          <p className={styles.actionDesc}>
            Carga masiva de registros a través de archivos Excel (.xlsx, .xls) o CSV.
            Soporta drag and drop y validación de columnas.
          </p>
        </Link>

        <Link href="/dashboard/manage" className={styles.actionCard}>
          <div className={styles.actionIcon}>
            <FileText size={24} aria-hidden />
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
