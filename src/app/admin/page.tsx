import { getVisits } from "../actions";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ pass?: string }>;
}) {
  const { pass } = await searchParams;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return (
      <div className="main-container">
        <h1>Error</h1>
        <p>ADMIN_PASSWORD no está configurada en el servidor.</p>
      </div>
    );
  }

  if (pass !== adminPassword) {
    return (
      <div className="main-container">
        <h1>Acceso Denegado</h1>
        <p>Por favor ingresa la contraseña en la URL (?pass=...)</p>
        <form style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input 
            type="password" 
            name="pass" 
            className="input-field" 
            placeholder="Contraseña" 
          />
          <button type="submit" className="btn">Entrar</button>
        </form>
      </div>
    );
  }

  const visits = await getVisits();

  return (
    <div className="main-container" style={{ maxWidth: '800px' }}>
      <h1>Panel Admin</h1>
      <p>Visitas Registradas ({visits.length})</p>
      
      <div style={{ marginTop: '2rem', overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--primary)' }}>
              <th style={{ padding: '0.5rem' }}>Fecha/Hora</th>
              <th style={{ padding: '0.5rem' }}>ID Buscado</th>
              <th style={{ padding: '0.5rem' }}>Nombre</th>
              <th style={{ padding: '0.5rem' }}>Dispositivo</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.uniqueId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                  {new Date(visit.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: '0.5rem' }}>{visit.id}</td>
                <td style={{ padding: '0.5rem' }}>{visit.name || "N/A"}</td>
                <td style={{ padding: '0.5rem', fontSize: '0.7rem', opacity: 0.7, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {visit.device}
                </td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No hay visitas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <a href="/" className="btn btn-secondary" style={{ marginTop: '2rem', display: 'block', textDecoration: 'none', textAlign: 'center' }}>
        Volver al Inicio
      </a>
    </div>
  );
}
