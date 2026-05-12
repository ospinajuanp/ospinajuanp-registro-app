"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrarse");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container" style={{ backgroundImage: 'none', backgroundColor: 'var(--bg)' }}>
      <div className="input-group">
        <h1>Registro</h1>
        <p>Crea una cuenta para solicitar acceso al panel.</p>
        
        {success ? (
          <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', background: '#e7f0ff', borderRadius: '12px', color: '#1b3db8' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>¡Registro exitoso!</h3>
            <p style={{ marginTop: '0.5rem' }}>Serás redirigido al login. Recuerda que un administrador debe aprobar tu cuenta para poder ingresar al panel.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />

              <input
                type="email"
                className="input-field"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              
              <input
                type="password"
                className="input-field"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
            
            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1.5rem', width: '100%' }}>
              {loading ? <span className="loading-spinner" style={{ display: 'inline-block' }}></span> : "Crear cuenta"}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
              Inicia sesión
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
