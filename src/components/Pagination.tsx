"use client";

import { useId } from "react";

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number, pageSize: number) => void;
  labels?: {
    showing?: string;
    prev?: string;
    next?: string;
    pageSize?: string;
  };
}

function buildPageList(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | "…"> = [1];
  const rangeStart = Math.max(2, current - 2);
  const rangeEnd = Math.min(total - 1, current + 2);

  if (rangeStart > 2) pages.push("…");
  for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
  if (rangeEnd < total - 1) pages.push("…");
  pages.push(total);

  return pages;
}

export function clampPage(page: number, pageSize: number, totalItems: number): number {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return Math.min(Math.max(1, page), totalPages);
}

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  labels,
}: PaginationProps) {
  const showingText = labels?.showing ?? "Mostrando";
  const prevText = labels?.prev ?? "Anterior";
  const nextText = labels?.next ?? "Siguiente";
  const pageSizeText = labels?.pageSize ?? "Por página:";
  const selectId = useId();

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clampPage(currentPage, pageSize, totalItems);
  const isEmpty = totalItems === 0;

  const start = isEmpty ? 0 : (safePage - 1) * pageSize + 1;
  const end = isEmpty ? 0 : Math.min(safePage * pageSize, totalItems);

  const goTo = (page: number) => onPageChange(clampPage(page, pageSize, totalItems), pageSize);
  const changeSize = (newSize: number) => {
    onPageChange(1, newSize);
  };

  const pageList = buildPageList(safePage, totalPages);
  const isFirst = safePage <= 1;
  const isLast = safePage >= totalPages;

  return (
    <nav
      aria-label="Paginación"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.875rem 1rem",
        background: "rgba(30, 41, 59, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        marginTop: "0.75rem",
      }}
    >
      <span style={{ color: "#94a3b8", fontSize: "0.88rem", fontWeight: 500 }}>
        {showingText} <strong style={{ color: "#f8fafc" }}>{start}-{end}</strong> de{" "}
        <strong style={{ color: "#f8fafc" }}>{totalItems}</strong>
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <label
          htmlFor={selectId}
          style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}
        >
          {pageSizeText}
        </label>
        <select
          id={selectId}
          value={pageSize}
          onChange={(e) => changeSize(Number(e.target.value))}
          disabled={isEmpty}
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "0.35rem 0.6rem",
            fontSize: "0.85rem",
            cursor: isEmpty ? "not-allowed" : "pointer",
          }}
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => goTo(safePage - 1)}
          disabled={isFirst}
          aria-label="Página anterior"
          style={navButtonStyle(isFirst)}
        >
          ‹ {prevText}
        </button>

        {pageList.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              aria-hidden="true"
              style={{ color: "#64748b", padding: "0 0.25rem" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              aria-label={`Ir a página ${p}`}
              aria-current={p === safePage ? "page" : undefined}
              style={pageButtonStyle(p === safePage)}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goTo(safePage + 1)}
          disabled={isLast}
          aria-label="Página siguiente"
          style={navButtonStyle(isLast)}
        >
          {nextText} ›
        </button>
      </div>
    </nav>
  );
}

function navButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: "rgba(15, 23, 42, 0.6)",
    color: disabled ? "#475569" : "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "0.4rem 0.75rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
}

function pageButtonStyle(active: boolean): React.CSSProperties {
  if (active) {
    return {
      minWidth: "2.25rem",
      background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "0.4rem 0.5rem",
      fontSize: "0.85rem",
      fontWeight: 700,
      cursor: "default",
    };
  }
  return {
    minWidth: "2.25rem",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "0.4rem 0.5rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  };
}