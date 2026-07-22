"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

export default function CacheSettingsToggle() {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/cache-settings")
      .then((res) => res.json())
      .then((data) => {
        setForceUpdate(data.forceUpdate === true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    const newValue = !forceUpdate;
    try {
      await fetch("/api/cache-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceUpdate: newValue }),
      });
      setForceUpdate(newValue);
    } catch {
      console.error("Failed to save setting");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className={styles.cacheToggle}>Cargando...</div>;
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
      </div>
      <button
        className={`${styles.toggleSwitch} ${forceUpdate ? styles.toggleSwitchActive : ""}`}
        onClick={handleToggle}
        disabled={saving}
        aria-pressed={forceUpdate}
      >
        <span className={styles.toggleKnob} />
      </button>
    </div>
  );
}