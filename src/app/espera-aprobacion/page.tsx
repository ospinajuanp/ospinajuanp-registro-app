import Link from "next/link";

export default function EsperaAprobacionPage() {
  return (
    <div className="public-page-wrapper">
    <main className="main-container" style={{ backgroundImage: 'none', backgroundColor: 'var(--bg)' }}>
      <div className="input-group" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
        <h1 style={{ marginBottom: '1rem' }}>Cuenta en espera</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem', lineHeight: '1.5' }}>
          Tu cuenta ha sido creada correctamente, pero aún no tienes los permisos necesarios para acceder al panel de administración.
          <br /><br />
          Por favor, contacta a un administrador para que autorice tu acceso (estableciendo tu estado como autorizado).
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Volver al Login
          </Link>
          <Link href="/" className="btn" style={{ textDecoration: 'none' }}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
    </div>
  );
}
