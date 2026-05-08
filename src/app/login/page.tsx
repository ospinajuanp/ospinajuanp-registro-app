"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Si no pone email, mandamos "admin" para que no salte el error de 400
        // y pueda entrar usando la contraseña maestra sola.
        body: JSON.stringify({ email: email || "admin", password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      if (data.isAuthorized) {
        router.push("/admin");
      } else {
        router.push("/espera-aprobacion");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container" style={{ backgroundImage: 'none', backgroundColor: 'var(--bg)' }}>
      <div className="input-group">
        <h1>Iniciar Sesión</h1>
        <p>Ingresa para acceder al panel de administración.</p>
        
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Correo electrónico (o vacío si usas clave maestra)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            
            <input
              type="password"
              className="input-field"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
          
          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1.5rem', width: '100%' }}>
            {loading ? <span className="loading-spinner" style={{ display: 'inline-block' }}></span> : "Entrar"}
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
