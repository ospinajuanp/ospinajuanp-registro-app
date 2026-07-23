"use client";

import { useState } from "react";
import { Trash2, AlertCircle, AlertTriangle } from "lucide-react";
import { deleteAllVisits } from "../../actions";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

export default function DeleteDataButton({ count }: { count: number }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNextStep = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const result = await deleteAllVisits();
      if (result.success) {
        alert("Todos los registros han sido eliminados.");
        router.refresh();
        setStep(0);
      } else {
        alert("Error: " + result.error);
      }
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep(0);
  };

  const getButtonConfig = () => {
    switch (step) {
      case 0:
        return {
          text: "Limpiar Base de Datos",
          color: "rgba(239, 68, 68, 0.1)",
          textColor: "#fca5a5",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          icon: <Trash2 size={18} aria-hidden />,
        };
      case 1:
        return {
          text: "¿Estás seguro?",
          color: "rgba(249, 115, 22, 0.2)",
          textColor: "#fdba74",
          border: "1px solid rgba(249, 115, 22, 0.3)",
          icon: <AlertCircle size={18} aria-hidden />,
        };
      case 2:
        return {
          text: `CONFIRMAR: Borrar ${count} registros`,
          color: "rgba(220, 38, 38, 0.4)",
          textColor: "#f87171",
          border: "1px solid rgba(220, 38, 38, 0.6)",
          icon: <AlertTriangle size={18} aria-hidden />,
        };
      default:
        return { text: "Error", color: "red", textColor: "red", border: "none", icon: null };
    }
  };

  const config = getButtonConfig();

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button
        type="button"
        onClick={handleNextStep}
        disabled={loading || count === 0}
        className={styles.btnPrimary}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: loading ? 'rgba(255,255,255,0.1)' : config.color,
          color: config.textColor,
          border: config.border,
          boxShadow: 'none',
          opacity: count === 0 ? 0.5 : 1,
        }}
      >
        {loading ? (
          <span className={styles.spinner}></span>
        ) : (
          <>
            {config.icon}
            {config.text}
          </>
        )}
      </button>

      {step > 0 && !loading && (
        <button
          type="button"
          onClick={handleCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.8rem',
            textDecoration: 'underline',
            minHeight: '44px',
            padding: '0 0.5rem',
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
