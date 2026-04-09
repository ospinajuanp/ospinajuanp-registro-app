import { getVisits } from "../actions";
import { headers } from "next/headers";
import DownloadButton from "./DownloadButton";

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
    <div className="main-container" style={{ maxWidth: '900px', width: '95%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ textAlign: 'left', marginBottom: '0.2rem' }}>Panel Admin</h1>
          <p style={{ textAlign: 'left', fontSize: '1rem' }}>Viendo registro de visitas ({visits.length})</p>
        </div>
        <DownloadButton data={visits} />
      </div>
      
      <div style={{ 
        marginTop: '1rem', 
        overflowX: 'auto', 
        width: '100%', 
        background: '#f8f9fa', 
        borderRadius: '16px',
        padding: '1rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <th style={{ padding: '0.75rem' }}>Fecha / Hora</th>
              <th style={{ padding: '0.75rem' }}>ID Buscado</th>
              <th style={{ padding: '0.75rem' }}>Nombre</th>
              <th style={{ padding: '0.75rem' }}>Dispositivo</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.uniqueId} style={{ 
                background: 'white', 
                borderRadius: '12px',
                transition: 'transform 0.2s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}>
                <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 'bold', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                  {new Date(visit.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    background: '#e7f0ff', 
                    color: '#1b3db8', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {visit.id}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>
                  {visit.name || <span style={{ opacity: 0.4 }}>N/A</span>}
                </td>
                <td style={{ 
                  padding: '1rem', 
                  fontSize: '0.75rem', 
                  opacity: 0.7, 
                  maxWidth: '250px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  borderTopRightRadius: '12px',
                  borderBottomRightRadius: '12px'
                }}>
                  {visit.device}
                </td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                  No hay visitas registradas aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <a href="/" className="btn btn-secondary" style={{ 
        marginTop: '2rem', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        textDecoration: 'none'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver al Inicio
      </a>
    </div>
  );
}
