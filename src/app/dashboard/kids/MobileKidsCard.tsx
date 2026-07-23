"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { Kid } from "@/lib/types/kid";
import s from "./kids.module.css";

interface MobileKidsCardProps {
  kid: Kid;
  isSelected: boolean;
  onSelect: (docId: string) => void;
  onEdit: (kid: Kid) => void;
  onDelete: (docId: string) => void;
}

/**
 * Collapsible card representation of a Kid record, used on mobile only.
 *
 * Header row shows: checkbox + name + action icons + chevron toggle.
 * Clicking the chevron (or the header padding) expands the body with
 * the remaining fields as label/value pairs.
 *
 * The desktop <table> continues to be rendered in parallel (hidden on
 * mobile via CSS). The two representations stay in sync because both
 * are driven by the same `kids` state in the parent page.
 */
export default function MobileKidsCard({
  kid,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: MobileKidsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const docId = String(kid["Número de documento del niño"] ?? "");
  const docType = String(kid["Tipo de documento del niño"] ?? "");
  const name = kid["Nombre completo del niño"] || "Sin nombre";
  const sede = kid["Sede"] || "—";
  const paquete = kid["Tipo de paquete"] || "—";
  const recibeRaw = String(kid["Recibe paquete"] ?? "");
  const recibeLower = recibeRaw.toLowerCase();
  const recibeLabel = recibeRaw || "—";

  const handleDelete = () => {
    if (!docId) return;
    onDelete(docId);
  };

  return (
    <div
      className={`${s.mobileCard} ${expanded ? s.mobileCardExpanded : ""} ${isSelected ? s.mobileCardSelected : ""}`}
    >
      <div className={s.mobileCardHeader}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => docId && onSelect(docId)}
          aria-label={`Seleccionar ${name}`}
          className={s.mobileCardCheckbox}
        />
        <button
          type="button"
          className={s.mobileCardName}
          onClick={() => onEdit(kid)}
          aria-label={`Editar registro de ${name}`}
        >
          {name}
        </button>
        <div className={s.mobileCardActions}>
          <button
            type="button"
            className={s.mobileCardIconBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(kid);
            }}
            aria-label={`Editar registro de ${name}`}
          >
            <Pencil size={14} aria-hidden />
          </button>
          <button
            type="button"
            className={`${s.mobileCardIconBtn} ${s.mobileCardIconBtnDanger}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            aria-label={`Eliminar registro de ${name}`}
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className={s.mobileCardToggle}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={`mobile-card-body-${docId}`}
          aria-label={expanded ? "Contraer detalles" : "Expandir detalles"}
        >
          <ChevronDown size={18} aria-hidden />
        </button>
      </div>

      {expanded && (
        <div id={`mobile-card-body-${docId}`} className={s.mobileCardBody}>
          <div className={s.mobileCardField}>
            <span className={s.mobileCardLabel}>Documento</span>
            <span className={s.mobileCardValue}>
              {docType} {docId}
            </span>
          </div>
          <div className={s.mobileCardField}>
            <span className={s.mobileCardLabel}>Sede</span>
            <span className={s.mobileCardValue}>{sede}</span>
          </div>
          <div className={s.mobileCardField}>
            <span className={s.mobileCardLabel}>Paquete</span>
            <span className={s.mobileCardValue}>{paquete}</span>
          </div>
          <div className={s.mobileCardField}>
            <span className={s.mobileCardLabel}>Recibe</span>
            <span className={s.mobileCardValue}>
              <span
                className={
                  recibeLower === "si" ? s.badgeYes : s.badgeNo
                }
              >
                {recibeLabel}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}