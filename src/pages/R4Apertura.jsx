/* eslint-disable react/prop-types */
// Panel interno de apertura de cuentas R4 (/r4apertura).
// No forma parte del sitio público: sin navbar ni footer, y fuera del sitemap.
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiLogIn, FiLogOut, FiAlertTriangle, FiEye } from 'react-icons/fi';
import { supabaseR4 } from '../components/r4/r4Api';
import R4Lista from '../components/r4/R4Lista';
import R4Cliente from '../components/r4/R4Cliente';
import '../assets/R4Apertura.css';

export default function R4Apertura() {
  const [sesion, setSesion] = useState(undefined);
  const [rol, setRol] = useState(null);
  const [clienteId, setClienteId] = useState(null);

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

  const soloLectura = rol === 'lectura';

  return (
    <div className="r4">
      <Helmet>
        <title>Apertura de cuentas R4 · Web Bonding</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {sesion === undefined ? (
        <p className="r4-cargando">Cargando…</p>
      ) : !sesion ? (
        <Acceso />
      ) : (
        <>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {soloLectura && (
                  <span className="r4-chip r4-chip-neutro"><FiEye size={13} /> Solo lectura</span>
                )}
                <button className="r4-btn r4-btn-plano r4-btn-icono"
                        onClick={() => supabaseR4.auth.signOut()} aria-label="Cerrar sesión">
                  <FiLogOut size={16} />
                </button>
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
        </>
      )}
    </div>
  );
}

function Acceso() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setCargando(true); setError('');
    const { error } = await supabaseR4.auth.signInWithPassword({ email: correo, password: clave });
    if (error) setError(error.message);
    setCargando(false);
  }

  return (
    <div className="r4-acceso">
      <form className="r4-tarjeta" onSubmit={entrar}>
        <div className="r4-acceso-logos">
          <img src="/r4-logo.png" alt="R4" />
          <span className="r4-marca-divisor" />
          <img src="/logoennegro.png" alt="Web Bonding" />
        </div>
        <h1>Apertura de cuentas</h1>
        <p>Acceso del equipo</p>

        <label className="r4-etiqueta">Correo</label>
        <input className="r4-campo" type="email" autoComplete="username" style={{ marginBottom: 12 }}
               value={correo} onChange={e => setCorreo(e.target.value)} required />

        <label className="r4-etiqueta">Contraseña</label>
        <input className="r4-campo" type="password" autoComplete="current-password" style={{ marginBottom: 20 }}
               value={clave} onChange={e => setClave(e.target.value)} required />

        {error && <p className="r4-error"><FiAlertTriangle size={15} /> {error}</p>}

        <button className="r4-btn r4-btn-primario" disabled={cargando}>
          <FiLogIn size={16} /> Entrar
        </button>

        <div className="r4-acceso-credito">
          <img src="/logoennegro.png" alt="Web Bonding" />
          Desarrollado por Web Bonding
        </div>
      </form>
    </div>
  );
}
