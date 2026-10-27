/* eslint-disable react/prop-types */
// Acceso del equipo (Supabase Auth del proyecto r4-cuentas): con contraseña o con un enlace al correo, para quien no
// la recuerda. Lo usan /leads y el cotizador del equipo; el enlace vuelve a la misma página.
import { useState } from 'react';
import { FiLogIn, FiAlertTriangle, FiMail, FiArrowLeft } from 'react-icons/fi';
import { supabaseR4 } from './r4/r4Api';
import { traducir } from '../lib/equipo';
import '../assets/Leads.css';

export default function AccesoEquipo({ titulo, texto, aviso = '', volver = null }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [conEnlace, setConEnlace] = useState(false); // entrar con un enlace al correo, sin contraseña
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setCargando(true); setError('');
    if (conEnlace) {
      // shouldCreateUser: false → solo entran los usuarios que ya existen; desde aquí no se abren cuentas
      const { error: err } = await supabaseR4.auth.signInWithOtp({
        email: correo, options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}`, shouldCreateUser: false },
      });
      setCargando(false);
      if (err) setError(traducir(err)); else setEnviado(true);
      return;
    }
    const { error: err } = await supabaseR4.auth.signInWithPassword({ email: correo, password: clave });
    if (err) { setError(traducir(err)); setCargando(false); }
  }

  const cambiarModo = () => { setConEnlace(!conEnlace); setEnviado(false); setError(''); };

  return (
    <main className="ld-entrar">
      <form className="ld-entrar__caja" onSubmit={entrar}>
        <img src="/logoennegro.png" alt="Web Bonding" className="ld-entrar__logo" />
        <h1>{titulo}</h1>
        <p>{texto}</p>
        {aviso && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {aviso}</p>}
        {enviado ? (
          <p className="ld-enviado" role="status">Listo: revisa tu correo ({correo}) y abre el enlace en este mismo navegador.</p>
        ) : (
          <>
            <label className="ld-etiqueta" htmlFor="ld-correo">Correo</label>
            <input id="ld-correo" className="ld-campo" type="email" autoComplete="username" autoFocus required
              value={correo} onChange={(e) => setCorreo(e.target.value)} />
            {!conEnlace && (
              <>
                <label className="ld-etiqueta" htmlFor="ld-clave">Contraseña</label>
                <input id="ld-clave" className="ld-campo" type="password" autoComplete="current-password" required
                  value={clave} onChange={(e) => setClave(e.target.value)} />
              </>
            )}
            {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
            <button className="ld-btn ld-btn--primario" disabled={cargando}>
              {conEnlace ? <><FiMail aria-hidden="true" /> Enviarme el enlace</> : <><FiLogIn aria-hidden="true" /> Entrar</>}
            </button>
          </>
        )}
        <button type="button" className="ld-entrar__otro" onClick={cambiarModo}>
          {conEnlace ? 'Entrar con contraseña' : '¿No recuerdas la contraseña? Entra con un enlace a tu correo'}
        </button>
        {volver && (
          <button type="button" className="ld-entrar__otro ld-entrar__volver" onClick={volver.onClick}>
            <FiArrowLeft aria-hidden="true" /> {volver.texto}
          </button>
        )}
      </form>
    </main>
  );
}
