"use client";

import type { VisitLog } from "@/lib/types/visit";
import styles from "../dashboard.module.css";

interface DownloadButtonProps {
  data: VisitLog[];
}

export default function DownloadButton({ data }: DownloadButtonProps) {
  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = ["ID Buscado", "Nombre", "Fecha/Hora", "Dispositivo", "ID Único"];
    
    const rows = data.map(visit => [
      `"${visit.id}"`,
      `"${visit.name || "N/A"}"`,
      `"${new Date(visit.timestamp).toLocaleString()}"`,
      `"${visit.device.replace(/"/g, '""')}"`,
      `"${visit.uniqueId}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const fileName = `visitas_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadCSV} 
      className={styles.btnPrimary}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        background: 'rgba(34, 197, 94, 0.2)',
        color: '#86efac',
        boxShadow: 'none',
        border: '1px solid rgba(34, 197, 94, 0.3)'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Descargar Excel (CSV)
    </button>
  );
}
