/* eslint-disable react/prop-types */
// Cambiar la contraseña del usuario del equipo. Sirve sobre todo después de entrar con el enlace al correo: la nueva
// contraseña vale en /r4apertura, /leads y el cotizador del equipo, porque es la misma cuenta.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiKey, FiX, FiAlertTriangle } from 'react-icons/fi';
import { supabaseR4 } from './r4/r4Api';
import { traducir } from '../lib/equipo';
import '../assets/Leads.css';

export default function CambiarClave({ className = 'ld-btn ld-btn--plano' }) {
  const [abierto, setAbierto] = useState(false);
  const [nueva, setNueva] = useState('');
  const [otra, setOtra] = useState('');
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);

  const cerrar = () => { setAbierto(false); setNueva(''); setOtra(''); setError(''); setListo(false); };

  useEffect(() => {
    if (!abierto) return undefined;
    const alTeclear = (e) => e.key === 'Escape' && cerrar();
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  async function guardar(e) {
    e.preventDefault();
    setError('');
    if (nueva.length < 8) { setError('Usa al menos 8 caracteres.'); return; }
    if (nueva !== otra) { setError('Las dos contraseñas no son iguales.'); return; }
    setCargando(true);
    const { error: err } = await supabaseR4.auth.updateUser({ password: nueva });
    setCargando(false);
    if (err) setError(traducir(err)); else setListo(true);
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setAbierto(true)}>
        <FiKey aria-hidden="true" /> Contraseña
      </button>
      {abierto && createPortal(
        <div className="ld-modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && cerrar()}>
          <form className="ld-modal" onSubmit={guardar}>
            <div className="ld-modal__cabecera">
              <h2>Cambiar contraseña</h2>
              <button type="button" className="ld-modal__cerrar" onClick={cerrar} aria-label="Cerrar"><FiX /></button>
            </div>
            {listo ? (
              <p className="ld-enviado" role="status">Listo: desde ahora entras con la nueva contraseña en /leads, /r4apertura y el cotizador.</p>
            ) : (
              <>
                <label className="ld-etiqueta" htmlFor="ld-nueva">Nueva contraseña</label>
                <input id="ld-nueva" className="ld-campo" type="password" autoComplete="new-password" autoFocus required
                  value={nueva} onChange={(e) => setNueva(e.target.value)} />
                <label className="ld-etiqueta" htmlFor="ld-otra">Repítela</label>
                <input id="ld-otra" className="ld-campo" type="password" autoComplete="new-password" required
                  value={otra} onChange={(e) => setOtra(e.target.value)} />
                {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
                <button className="ld-btn ld-btn--primario ld-modal__guardar" disabled={cargando}>Guardar</button>
              </>
            )}
          </form>
        </div>,
        document.body,
      )}
    </>
  );
}
