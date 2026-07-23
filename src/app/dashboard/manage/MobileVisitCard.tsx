"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { VisitLog } from "@/lib/types/visit";
import styles from "../dashboard.module.css";

interface MobileVisitCardProps {
  visit: VisitLog;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/**
 * Collapsible card representation of a VisitLog, used on mobile only.
 * Header shows the searched ID + name (or N/A). Body reveals timestamp
 * and device when expanded via the chevron toggle.
 */
export default function MobileVisitCard({ visit }: MobileVisitCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`${styles.mobileCard} ${expanded ? styles.mobileCardExpanded : ""}`}
    >
      <div className={styles.mobileCardHeader}>
        <span className={styles.mobileCardId}>{visit.id}</span>
        <span className={styles.mobileCardName}>
          {visit.name || <span style={{ opacity: 0.4 }}>N/A</span>}
        </span>
        <button
          type="button"
          className={styles.mobileCardToggle}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={`visit-card-body-${visit.uniqueId}`}
          aria-label={expanded ? "Contraer detalles" : "Expandir detalles"}
        >
          <ChevronDown size={18} aria-hidden />
        </button>
      </div>

      {expanded && (
        <div id={`visit-card-body-${visit.uniqueId}`} className={styles.mobileCardBody}>
          <div className={styles.mobileCardField}>
            <span className={styles.mobileCardLabel}>Fecha / Hora</span>
            <span className={styles.mobileCardValue}>{formatTimestamp(visit.timestamp)}</span>
          </div>
          <div className={styles.mobileCardField}>
            <span className={styles.mobileCardLabel}>Dispositivo</span>
            <span className={styles.mobileCardValue}>{visit.device}</span>
          </div>
        </div>
      )}
    </div>
  );
}