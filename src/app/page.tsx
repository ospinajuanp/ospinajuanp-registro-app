"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { logVisit } from "./actions";
import { useCacheStore } from "./store";
import type { Kid } from "@/lib/types/kid";
import {
  CAPTURE_FORM_ANIMATION_MS,
  getLastSeenTimestamp,
  isSameLocalDay,
  setLastSeenTimestamp,
} from "@/lib/utils/captureFormAnimation";

type Registro = Kid;

export default function Home() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Registro | null>(null);
  const [userName, setUserName] = useState("");
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  const [showCaptureForm, setShowCaptureForm] = useState(true);
  // Capture-form slide-down animation state.
  // `shouldAnimate`: true only on the first visit of the day.
  // `hasAnimated`:   becomes true after the animation finishes (or
  //                  immediately if the form shouldn't animate), so the
  //                  wrapper stays in the --shown state on subsequent
  //                  renders (e.g. when toggling back from the search
  //                  form) without replaying the animation.
  const [shouldAnimateCaptureForm, setShouldAnimateCaptureForm] = useState(false);
  const [hasAnimatedCaptureForm, setHasAnimatedCaptureForm] = useState(false);

  const { getCache, setCache, clearExpired } = useCacheStore();

  useEffect(() => {
    clearExpired();
    if (typeof window === "undefined") return;

    const now = Date.now();
    const lastSeen = getLastSeenTimestamp();
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (lastSeen === null || !isSameLocalDay(lastSeen, now)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldAnimateCaptureForm(true);
      // Save the timestamp INSIDE the timer callback (not here) so that
      // React StrictMode's double-invocation in dev doesn't immediately
      // cancel the animation: on the second pass the localStorage entry
      // is still empty, so the "first visit" decision stays valid.
      timer = setTimeout(() => {
        setLastSeenTimestamp(now);
        setHasAnimatedCaptureForm(true);
      }, CAPTURE_FORM_ANIMATION_MS);
    } else {
      setHasAnimatedCaptureForm(true);
    }

    const saved = localStorage.getItem("user-name");
    if (saved && saved.trim().length > 0) {
      setUserName(saved.trim());
      setShowCaptureForm(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [clearExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Logging technical visit
    try {
      await logVisit({
        id,
        name: hasAcceptedPrivacy ? userName : undefined,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
      });
      localStorage.setItem("visit-captured", "true");
    } catch (err) {
      console.warn("KV Log failed, continuing with search...", err);
    }

    if (!id.trim()) {
      setError("Por favor ingresa un ID.");
      return;
    }

    // Obtener setting de cache
    let forceUpdate = false;
    try {
      const settingsRes = await fetch("/api/cache-settings");
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        forceUpdate = settings.forceUpdate === true;
      }
    } catch {
      console.warn("Could not fetch cache settings, using default behavior");
    }

    // Si forceUpdate es false, intentar usar cache primero
    if (!forceUpdate) {
      const cachedData = getCache(id);
      if (cachedData) {
        setResultado(cachedData);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError("No se encontró ningún registro con ese ID.");
        } else {
          setError("Ocurrió un error al buscar. Intenta nuevamente.");
        }
        setResultado(null);
      } else {
        const data = await res.json();
        setResultado(data);
        setCache(id, data);
      }
    } catch {
      setError("Error de conexión al servidor.");
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResultado(null);
    setId("");
    setError(null);
  };

  return (
    <div className="public-page-wrapper">
      <main
        id="main-content"
        className="main-container"
        style={{
          backgroundColor: resultado ? 'var(--bg)' : 'transparent',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!resultado && (
          <Image
            src="/buen-comienzo.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={70}
            style={{ objectFit: "cover", zIndex: -1 }}
            aria-hidden
          />
        )}
      {!resultado ? (
        <div className="input-group">
          <h1 className="welcome-heading">¡Bienvenido!</h1>
          
          {showCaptureForm ? (
            <div
              className={
                hasAnimatedCaptureForm
                  ? "capture-form-wrapper capture-form-wrapper--shown"
                  : shouldAnimateCaptureForm
                  ? "capture-form-wrapper capture-form-wrapper--animate"
                  : "capture-form-wrapper"
              }
              aria-hidden={!hasAnimatedCaptureForm && shouldAnimateCaptureForm ? undefined : false}
            >
              <div className="capture-form">
                <p>Por favor, regístrate para continuar.</p>
                <label htmlFor="userName" className="visually-hidden">Tu nombre (opcional)</label>
                <input
                  id="userName"
                  type="text"
                  className="input-field"
                  placeholder="Tu Nombre (Opcional)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                />
                <label className="privacy-checkbox">
                  <input
                    type="checkbox"
                    checked={hasAcceptedPrivacy}
                    onChange={(e) => setHasAcceptedPrivacy(e.target.checked)}
                  />
                  <span style={{ color: 'black' }}>Acepto la Política de Privacidad</span>
                </label>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (userName.trim()) {
                      localStorage.setItem("user-name", userName.trim());
                    }
                    setShowCaptureForm(false);
                  }}
                  style={{ marginTop: '1rem'}}
                >
                  Continuar a la búsqueda
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <p>Ingresa el número de documento del niño para buscar la información.</p>
              
              <label htmlFor="doc-search" className="visually-hidden">Número de documento del niño</label>
              <input
                id="doc-search"
                type="text"
                className="input-field"
                placeholder="Ejemplo: 1001"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={loading}
                aria-describedby={error ? "search-error" : undefined}
                aria-invalid={!!error}
                inputMode="numeric"
                autoComplete="off"
              />
              
              {error && <div id="search-error" className="error-message" role="alert">{error}</div>}
              
              <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? <span className="loading-spinner" aria-label="Cargando..."></span> : "Buscar"}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ marginTop: '0.5rem', opacity: 0.7 }}
                onClick={() => setShowCaptureForm(true)}
              >
                Volver al registro
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="result-view">
          {(String(resultado["Recibe paquete"] ?? "").toLowerCase() === "si") && (
            <div className="icon-bounce">🎉</div>
          )}

          <div className="result-card">
            <h3>{resultado["Nombre completo del niño"] || "Tu peque"}</h3>
            <p><strong>Sede:</strong> {resultado["Sede"] || "General"}</p>

            <div className="delivery-info">
              <p>Estado de entrega</p>
              <span className={`badge ${String(resultado["Recibe paquete"] ?? "").toLowerCase() === 'si' ? 'success' : 'pending'}`}>
                {String(resultado["Recibe paquete"] ?? "").toUpperCase() === 'SI' ? 'Se le entregará' : 'No recibe'}
              </span>

              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resultado["Tipo de paquete"] && (
                  <p style={{ fontWeight: 700, color: 'var(--primary)', borderLeft: '3px solid var(--primary)', paddingLeft: '10px' }}>
                    📦 Paquete: {resultado["Tipo de paquete"]}
                  </p>
                )}

                {resultado.fecha && (
                  <p style={{ fontWeight: 500, fontSize: '1rem' }}>
                    📅 Fecha: {resultado.fecha}
                  </p>
                )}

                {resultado.hora && (
                  <p style={{ fontWeight: 500, fontSize: '1rem' }}>
                    ⏰ Hora: {resultado.hora}
                  </p>
                )}

                {resultado["Tipo de documento del niño"] && (
                  <p style={{ fontSize: '1.2rem', opacity: 0.7, marginTop: '0.5rem' }}>
                    DOC: {resultado["Tipo de documento del niño"]} {String(resultado["Número de documento del niño"] ?? "")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button onClick={handleReset} className="btn btn-secondary">
            Buscar Otro
          </button>
        </div>
      )}
    </main>
    </div>
  );
}
