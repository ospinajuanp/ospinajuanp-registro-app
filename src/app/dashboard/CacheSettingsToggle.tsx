"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

export default function CacheSettingsToggle() {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cache-settings")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setForceUpdate(data.forceUpdate === true);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        setError("No se pudo cargar la configuración");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async () => {
    const previousValue = forceUpdate;
    const newValue = !previousValue;
    // Optimistic update with rollback on failure.
    setForceUpdate(newValue);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cache-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceUpdate: newValue }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setForceUpdate(previousValue);
      setError("No se pudo guardar el cambio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.cacheToggle} aria-busy="true">
        <span className={styles.spinner} aria-hidden /> Cargando configuración…
      </div>
    );
  }

  return (
    <div className={styles.cacheToggle}>
      <div className={styles.cacheToggleInfo}>
        <span className={styles.cacheToggleTitle}>Forzar actualización de cache</span>
        <span className={styles.cacheToggleDesc}>
          {forceUpdate
            ? "Cada consulta actualiza el cache (data siempre actualizada)"
            : "Usa cache local por 5 días (más rápido)"}
        </span>
        {error && (
          <span
            role="alert"
            style={{
              display: "block",
              marginTop: "0.4rem",
              color: "#fca5a5",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </span>
        )}
      </div>
      <button
        type="button"
        className={`${styles.toggleSwitch} ${forceUpdate ? styles.toggleSwitchActive : ""}`}
        onClick={handleToggle}
        disabled={saving}
        aria-pressed={forceUpdate}
        aria-label="Forzar actualización de cache"
      >
        <span className={styles.toggleKnob} />
      </button>
    </div>
  );
}