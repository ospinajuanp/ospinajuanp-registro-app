"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirmation dialog built on the native <dialog> element.
 * - Closes on Escape and backdrop click.
 * - Traps focus inside the dialog while open.
 * - Restores focus to the previously focused element on close.
 *
 * Replaces window.confirm() / window.alert() for destructive actions.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onCancel]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current && !busy) onCancel();
  };

  const isDanger = variant === "danger";
  const confirmBg = isDanger
    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
    : "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)";

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      style={{
        padding: 0,
        border: "none",
        background: "transparent",
        color: "#f8fafc",
        maxWidth: "min(440px, calc(100vw - 2rem))",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(30, 41, 59, 0.98)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          padding: "1.5rem",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flex: 1,
            }}
          >
            {isDanger && (
              <AlertTriangle
                size={24}
                aria-hidden
                style={{ color: "#fca5a5", flexShrink: 0 }}
              />
            )}
            <h2
              id={titleId}
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cerrar diálogo"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: busy ? "not-allowed" : "pointer",
              padding: 4,
              borderRadius: 8,
              minHeight: 44,
              minWidth: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div
          id={messageId}
          style={{
            color: "#cbd5e1",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            marginBottom: "1.5rem",
          }}
        >
          {message}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#cbd5e1",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              padding: "0.75rem 1.25rem",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: busy ? "not-allowed" : "pointer",
              minHeight: 44,
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              background: confirmBg,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "0.75rem 1.25rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: busy ? "not-allowed" : "pointer",
              minHeight: 44,
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}