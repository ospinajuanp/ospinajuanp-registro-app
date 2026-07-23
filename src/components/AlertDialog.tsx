"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type AlertVariant = "success" | "error" | "info";

export interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  buttonLabel?: string;
  variant?: AlertVariant;
  onClose: () => void;
}

/**
 * Accessible single-button modal built on the native <dialog> element.
 * Used for informational / status messages that previously relied on
 * window.alert(). Closes on Escape, backdrop click, or the action button.
 * Restores focus to the previously focused element on close.
 */
export default function AlertDialog({
  open,
  title,
  message,
  buttonLabel = "Aceptar",
  variant = "info",
  onClose,
}: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
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
    actionRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  const palette = {
    success: { Icon: CheckCircle2, color: "#4ade80", bg: "rgba(34, 197, 94, 0.18)" },
    error:   { Icon: AlertTriangle, color: "#fca5a5", bg: "rgba(239, 68, 68, 0.18)" },
    info:    { Icon: Info,          color: "#38bdf8", bg: "rgba(56, 189, 248, 0.18)" },
  }[variant];
  const Icon = palette.Icon;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
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
            <div
              aria-hidden
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: palette.bg,
                flexShrink: 0,
              }}
            >
              <Icon size={22} color={palette.color} />
            </div>
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
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
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
            ref={actionRef}
            type="button"
            onClick={onClose}
            style={{
              background: palette.bg,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "0.75rem 1.25rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
