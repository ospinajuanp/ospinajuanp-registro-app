"use client";

import Link from "next/link";
import styles from "../dashboard.module.css";

export default function BackButton() {
  return (
    <Link 
      href="/dashboard" 
      className={styles.btnPrimary}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.6rem', 
        textDecoration: 'none', 
        marginBottom: '2rem',
        padding: '0.5rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        boxShadow: 'none',
        color: '#cbd5e1'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Volver al Resumen
    </Link>
  );
}
