"use client";

import Link from "next/link";

export default function BackButton() {
  return (
    <Link 
      href="/" 
      className="back-link"
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.6rem', 
        textDecoration: 'none', 
        color: 'var(--text-light)', 
        fontSize: '1.1rem',
        marginBottom: '2rem',
        fontWeight: '800',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        padding: '0.5rem 0',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--primary)';
        e.currentTarget.style.transform = 'translateX(-6px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-light)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f3f5',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        transition: 'all 0.3s ease'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </div>
      Volver al Inicio
    </Link>
  );
}
