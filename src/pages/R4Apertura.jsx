/* eslint-disable react/prop-types */
// Panel de apertura de cuentas R4 (/r4apertura).
// Se abre sin sesión y se ve todo; el botón "Acceso" del encabezado es para
// que el equipo entre y pueda editar. Fuera del sitemap y de los buscadores.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { FiLogIn, FiLogOut, FiAlertTriangle, FiEye, FiX } from 'react-icons/fi';
import { supabaseR4 } from '../components/r4/r4Api';
import R4Lista from '../components/r4/R4Lista';
import R4Cliente from '../components/r4/R4Cliente';
import '../assets/R4Apertura.css';

export default function R4Apertura() {
  const [sesion, setSesion] = useState(null);
  const [rol, setRol] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [acceso, setAcceso] = useState(false);

  useEffect(() => {
    supabaseR4.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data: sub } = supabaseR4.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // El panel ocupa toda la pantalla y desplaza por su cuenta: sin esto asoma
  // la barra de scroll oscura del sitio por detrás.
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previo; };
  }, []);

  // El rol manda en la base (RLS); aquí solo sirve para no mostrar botones que fallarían.
  useEffect(() => {
    if (!sesion) { setRol(null); return; }
    supabaseR4.from('perfiles').select('rol').eq('id', sesion.user.id).maybeSingle()
      .then(({ data }) => setRol(data?.rol ?? 'lectura'));
  }, [sesion]);

  // Sin sesión se ve todo igual, solo que sin poder tocar nada.
  const soloLectura = rol !== 'admin';

  return (
    <div className="r4">
      <Helmet>
        <title>Apertura de cuentas R4 · Web Bonding</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="r4-cabecera">
        <div className="r4-cabecera-interior">
          <button className="r4-marca" onClick={() => setClienteId(null)}>
            <img src="/r4-logo.png" alt="R4" />
            <span className="r4-marca-divisor" />
            <img src="/logoennegro.png" alt="Web Bonding" />
            <span className="r4-marca-divisor" />
            <span className="r4-marca-texto">
              <strong>Apertura de cuentas</strong>
              <span>Clientes por aperturar</span>
            </span>
          </button>

          <div className="r4-cabecera-acciones">
            {soloLectura && (
              <span className="r4-chip r4-chip-neutro"><FiEye size={13} /> Solo lectura</span>
            )}
            {sesion ? (
              <button className="r4-btn r4-btn-plano" onClick={() => supabaseR4.auth.signOut()}>
                <FiLogOut size={16} /> Salir
              </button>
            ) : (
              <button className="r4-btn r4-btn-primario" onClick={() => setAcceso(true)}>
                <FiLogIn size={16} /> Acceso
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="r4-contenido">
        {clienteId
          ? <R4Cliente id={clienteId} soloLectura={soloLectura} onBack={() => setClienteId(null)} />
          : <R4Lista soloLectura={soloLectura} onOpen={setClienteId} />}
      </main>

      <footer className="r4-pie">
        <img src="/logoennegro.png" alt="Web Bonding" />
        Desarrollado por Web Bonding
      </footer>

      {acceso && <Acceso onClose={() => setAcceso(false)} />}
    </div>
  );
}

function Acceso({ onClose }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const alTeclear = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [onClose]);

  async function entrar(e) {
    e.preventDefault();
    setCargando(true); setError('');
    const { error } = await supabaseR4.auth.signInWithPassword({ email: correo, password: clave });
    if (error) { setError(error.message); setCargando(false); return; }
    onClose();
  }

  return createPortal(
    <div className="r4-fondo" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="r4-modal r4-modal-angosto" onSubmit={entrar}>
        <div className="r4-modal-cabecera">
          <h2>Acceso del equipo</h2>
          <button type="button" className="r4-btn r4-btn-plano r4-btn-icono" onClick={onClose} aria-label="Cerrar">
            <FiX size={16} />
          </button>
        </div>

        <div className="r4-modal-cuerpo">
          <div className="r4-ancho">
            <label className="r4-etiqueta">Correo</label>
            <input className="r4-campo" type="email" autoComplete="username" autoFocus
                   value={correo} onChange={e => setCorreo(e.target.value)} required />
          </div>
          <div className="r4-ancho">
            <label className="r4-etiqueta">Contraseña</label>
            <input className="r4-campo" type="password" autoComplete="current-password"
                   value={clave} onChange={e => setClave(e.target.value)} required />
          </div>
          {error && <p className="r4-error r4-ancho"><FiAlertTriangle size={15} /> {error}</p>}
        </div>

        <div className="r4-modal-pie">
          <button type="button" className="r4-btn r4-btn-plano" onClick={onClose}>Cancelar</button>
          <button className="r4-btn r4-btn-primario" disabled={cargando}>
            <FiLogIn size={16} /> Entrar
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
