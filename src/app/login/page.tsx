"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedIdentifier = localStorage.getItem("login-identifier");
    const savedRemember = localStorage.getItem("login-remember-me") === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedIdentifier) setIdentifier(savedIdentifier);
    if (savedRemember) setRememberMe(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Si no pone identificador, mandamos "admin" para que no salte el error de 400
        // y pueda entrar usando la contraseña maestra sola.
        body: JSON.stringify({ 
          identifier: identifier || "admin", 
          password,
          rememberMe 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("login-identifier", identifier);
        localStorage.setItem("login-remember-me", "true");
      } else {
        localStorage.removeItem("login-identifier");
        localStorage.removeItem("login-remember-me");
      }

      if (data.isAuthorized) {
        router.push("/dashboard");
      } else {
        router.push("/espera-aprobacion");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="main-container" style={{ backgroundImage: 'none', backgroundColor: 'var(--bg)' }}>
      <div className="input-group">
        <h1>Iniciar Sesión</h1>
        <p>Ingresa para acceder al panel de administración.</p>
        
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label htmlFor="identifier" className="visually-hidden">Correo electrónico o usuario</label>
            <input
              id="identifier"
              type="text"
              className="input-field"
              placeholder="Correo electrónico o Usuario"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              aria-invalid={!!error}
            />

            <label htmlFor="password" className="visually-hidden">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              aria-describedby={error ? "login-error" : undefined}
              aria-invalid={!!error}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                style={{ cursor: 'pointer' }}
              />
              Recordar información en este navegador
            </label>
          </div>

          {error && <div id="login-error" className="error-message" style={{ marginTop: '1rem' }} role="alert">{error}</div>}
          
          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1.5rem', width: '100%' }}>
            {loading ? <span className="loading-spinner" style={{ display: 'inline-block' }} aria-label="Cargando..."></span> : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
              Regístrate aquí
            </Link>
          </p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            <Link href="/" style={{ color: 'var(--text-light)', textDecoration: 'underline' }}>
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
