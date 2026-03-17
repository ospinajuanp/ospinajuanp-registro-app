"use client";

import { useState } from "react";

type Registro = {
  "Tipo de documento del niño"?: string;
  "Número de documento del niño": string;
  "Nombre completo del niño": string;
  "Sede": string;
  "Tipo de paquete": string;
  "Recibe paquete": string;
  "fecha": string;
  "hora": string;
  [key: string]: any;
};

export default function Home() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Registro | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id.trim()) {
      setError("Por favor ingresa un ID.");
      return;
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
      }
    } catch (err) {
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
    <main className="main-container">
      {!resultado ? (
        <form onSubmit={handleSubmit} className="input-group">
          <h1>¡Bienvenido!</h1>
          <p>Ingresa el número de documento del niño para buscar la información.</p>
          
          <input
            type="text"
            className="input-field"
            placeholder="Ejemplo: 1001"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={loading}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : "Buscar"}
          </button>
        </form>
      ) : (
        <div className="result-view">
          {((resultado["Recibe paquete"] || '').toLowerCase() === "si") && (
            <div className="icon-bounce">🎉</div>
          )}
          
          <div className="result-card">
            <h3>{resultado["Nombre completo del niño"] || "Tu peque"}</h3>
            <p><strong>Sede:</strong> {resultado["Sede"] || "General"}</p>
            
            <div className="delivery-info">
              <p>Estado de entrega</p>
              <span className={`badge ${((resultado["Recibe paquete"] || '').toLowerCase() === 'si') ? 'success' : 'pending'}`}>
                {resultado["Recibe paquete"] === 'si' ? 'Se le entregará' : 'No recibe'}
              </span>
              
              <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resultado["Tipo de paquete"] && (
                  <p style={{ fontWeight: 700, color: 'var(--primary)', borderLeft: '3px solid var(--primary)', paddingLeft: '10px' }}>
                    📦 Paquete: {resultado["Tipo de paquete"]}
                  </p>
                )}

                {resultado.fecha && (
                  <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                    📅 Fecha: {resultado.fecha}
                  </p>
                )}

                {resultado.hora && (
                  <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                    ⏰ Hora: {resultado.hora}
                  </p>
                )}
                
                {resultado["Tipo de documento del niño"] && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                    DOC: {resultado["Tipo de documento del niño"]} {resultado["Número de documento del niño"]}
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
  );
}
