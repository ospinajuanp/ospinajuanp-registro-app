"use client";

import { useState } from "react";
import { deleteAllVisits } from "../actions";
import { useRouter } from "next/navigation";

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
          color: "var(--text-light, #6c757d)",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          )
        };
      case 1:
        return {
          text: "¿Estás seguro?",
          color: "#fd7e14", // Warning Orange
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )
        };
      case 2:
        return {
          text: `CONFIRMAR: Borrar ${count} registros`,
          color: "var(--error, #d32f2f)",
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          )
        };
      default:
        return { text: "Error", color: "red", icon: null };
    }
  };

  const config = getButtonConfig();

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button
        onClick={handleNextStep}
        disabled={loading || count === 0}
        className="btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: loading ? '#ccc' : config.color,
          color: 'white',
          border: 'none',
          padding: '0.6rem 1.2rem',
          borderRadius: '12px',
          fontWeight: '700',
          cursor: count === 0 ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          fontSize: '0.9rem',
          opacity: count === 0 ? 0.5 : 1,
          boxShadow: step > 0 ? `0 6px 15px ${config.color}44` : 'none',
          transform: step > 0 ? 'scale(1.05)' : 'scale(1)',
          width: 'auto'
        }}
      >
        {loading ? (
          <span className="loading-spinner"></span>
        ) : (
          <>
            {config.icon}
            {config.text}
          </>
        )}
      </button>

      {step > 0 && !loading && (
        <button
          onClick={handleCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '0.8rem',
            textDecoration: 'underline'
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
