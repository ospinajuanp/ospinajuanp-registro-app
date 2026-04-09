"use client";

import { VisitLog } from "../actions";

interface DownloadButtonProps {
  data: VisitLog[];
}

export default function DownloadButton({ data }: DownloadButtonProps) {
  const downloadCSV = () => {
    if (data.length === 0) return;

    // Define the headers
    const headers = ["ID Buscado", "Nombre", "Fecha/Hora", "Dispositivo", "ID Único"];
    
    // Map the data to rows
    const rows = data.map(visit => [
      `"${visit.id}"`,
      `"${visit.name || "N/A"}"`,
      `"${new Date(visit.timestamp).toLocaleString()}"`,
      `"${visit.device.replace(/"/g, '""')}"`, // Escape quotes in device string
      `"${visit.uniqueId}"`
    ]);

    // Create the CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Add Byte Order Mark for UTF-8 compatibility with Excel
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
      className="btn"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        backgroundColor: 'var(--success, #28a745)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 14px 0 rgba(40, 167, 69, 0.39)',
        marginTop: '1rem'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.45)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(40, 167, 69, 0.39)';
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
