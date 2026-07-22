"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { VisitLog } from "@/lib/types/visit";
import Pagination from "@/components/Pagination";
import styles from "../dashboard.module.css";

interface ManageTableProps {
  visits: VisitLog[];
}

export default function ManageTable({ visits }: ManageTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(
    1,
    Number(searchParams.get("size")) || 20,
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(visits.length / pageSize));
    if (currentPage > totalPages && visits.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(totalPages));
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [visits.length, pageSize, currentPage, router, pathname, searchParams]);

  const totalPages = Math.max(1, Math.ceil(visits.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedVisits = visits.slice(start, end);

  const handlePageChange = (page: number, size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("size", String(size));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
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
              {paginatedVisits.map((visit) => (
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

      <Pagination
        currentPage={safePage}
        pageSize={pageSize}
        totalItems={visits.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}