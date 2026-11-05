/* eslint-disable react/prop-types */
// Panel del equipo (/admin): lo interno de Web Bonding en un solo lugar. Se entra con el usuario del equipo (Supabase Auth
// del proyecto de R4, el mismo de /leads, el cotizador y R4) y cada quien ve las herramientas de su rol en public.perfiles:
// 'admin' todas, 'ventas' los leads, el cotizador y R4, y 'lectura' solo R4. /admin/portafolio es el gestor de los videos
// de /portafolio (components/admin/GestorVideos), solo para 'admin'. Quien manda es la base: aquí el rol solo muestra u
// oculta.
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle, FiArrowLeft, FiArrowRight, FiArrowUpRight, FiCreditCard, FiFileText, FiFilm, FiInbox, FiLogOut,
} from 'react-icons/fi';
import { supabaseR4 } from '../components/r4/r4Api';
import AccesoEquipo from '../components/AccesoEquipo';
import CambiarClave from '../components/CambiarClave';
import GestorVideos from '../components/admin/GestorVideos';
import { leadsNuevos, listar } from '../components/admin/datos';
import { DEMO } from '../data/portafolio';
import { rolDe } from '../lib/equipo';
import '../assets/Leads.css';
import '../assets/Admin.css';

// en el modo demo, los enlaces del panel se quedan en el demo
const aqui = (ruta) => (DEMO && ruta.startsWith('/admin') ? `${ruta}?demo` : ruta);

const HERRAMIENTAS = [
  { ruta: '/leads', icono: FiInbox, nombre: 'Leads', roles: ['admin', 'ventas'],
    texto: 'Los que llenan el formulario de /crea-tu-app: en qué va cada uno, tus notas y su WhatsApp a un toque.' },
  { ruta: '/admin/portafolio', icono: FiFilm, nombre: 'Portafolio', roles: ['admin'],
    texto: 'Los videos de /portafolio: pegas el enlace de Instagram y sale en la página.' },
  { ruta: '/cotizador', icono: FiFileText, nombre: 'Cotizador', roles: ['admin', 'ventas'],
    texto: 'El cotizador del equipo, con la guía de ventas para cerrar.' },
  { ruta: '/r4apertura', icono: FiCreditCard, nombre: 'Cuentas R4', roles: ['admin', 'ventas', 'lectura'],
    texto: 'La apertura de cuentas R4: los clientes por aperturar y sus recaudos.' },
];
const PAGINAS = [['/', 'Inicio'], ['/portafolio', 'Portafolio'], ['/crea-tu-app', 'Crea tu app'], ['/privacidad', 'Privacidad']];
const NOMBRE_ROL = { admin: 'Administrador', ventas: 'Ventas', lectura: 'Solo lectura' };

export default function Admin({ seccion = null }) {
  const [sesion, setSesion] = useState(DEMO ? { user: { id: 'demo', email: 'demo@ejemplo.com' } } : undefined); // undefined: aún no se sabe
  const [sinConexion, setSinConexion] = useState(false);
  const [rol, setRol] = useState(DEMO ? 'admin' : null);
  const usuario = sesion?.user?.id;

  useEffect(() => {
    if (DEMO) return undefined;
    let supo = false;
    const saber = (s) => { supo = true; setSesion(s); };
    // una sesión vieja que no se puede renovar deja getSession() esperando: a los 6 s se muestra el acceso igual
    const espera = setTimeout(() => { if (!supo) { setSinConexion(true); setSesion(null); } }, 6000);
    supabaseR4.auth.getSession()
      .then(({ data }) => saber(data.session))
      .catch(() => { setSinConexion(true); saber(null); });
    const { data: sub } = supabaseR4.auth.onAuthStateChange((_e, s) => saber(s));
    return () => { clearTimeout(espera); sub.subscription.unsubscribe(); };
  }, []);

  // el rol, una vez por usuario (no en cada renovación de la sesión)
  useEffect(() => {
    if (DEMO) return undefined;
    let vivo = true;
    setRol(null);
    if (usuario) rolDe({ user: { id: usuario } }).then((r) => vivo && setRol(r)).catch(() => vivo && setRol('lectura'));
    return () => { vivo = false; };
  }, [usuario]);

  return (
    <div className="ld ad">
      <Helmet>
        <title>{seccion === 'portafolio' ? 'Portafolio · Panel' : 'Panel'} · Web Bonding</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {sesion === undefined || (sesion && !rol) ? <p className="ld-cargando">Cargando…</p>
        : !sesion ? (
          <AccesoEquipo titulo="Panel del equipo"
            texto="Entra con tu usuario del equipo de Web Bonding, el mismo de /leads, el cotizador y R4."
            aviso={sinConexion ? 'No se pudo conectar con la base de datos. Revisa la conexión y vuelve a intentar.' : ''} />
        ) : (
          <>
            <Cabecera sesion={sesion} seccion={seccion} />
            {seccion !== 'portafolio' ? <Inicio rol={rol} />
              : rol === 'admin' ? <GestorVideos />
                : (
                  <main className="ad-contenido">
                    <p className="ld-error" role="alert">
                      <FiAlertTriangle aria-hidden="true" /> El portafolio solo lo cambia un administrador. Pídele el rol a Williams.
                    </p>
                    <p><Link className="ld-btn" to="/admin"><FiArrowLeft aria-hidden="true" /> Volver al panel</Link></p>
                  </main>
                )}
          </>
        )}
    </div>
  );
}

function Cabecera({ sesion, seccion }) {
  return (
    <header className="ld-cabecera">
      <div className="ld-cabecera__in">
        {seccion ? (
          <Link to={aqui('/admin')} className="ld-marca ad-marca">
            <FiArrowLeft aria-hidden="true" /> <span><b>Portafolio</b> Panel de Web Bonding</span>
          </Link>
        ) : (
          <a href="/" className="ld-marca"><img src="/logoenblanco.png" alt="" /> <span><b>Panel</b> Web Bonding</span></a>
        )}
        <div className="ld-cabecera__acciones">
          <span className="ld-usuario">{sesion.user?.email}</span>
          {!DEMO && <CambiarClave />}
          <button type="button" className="ld-btn ld-btn--plano" onClick={() => (DEMO ? null : supabaseR4.auth.signOut())}>
            <FiLogOut aria-hidden="true" /> <span className="ld-btn__txt">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// las herramientas del rol, con lo que espera en cada una
function Inicio({ rol }) {
  const mias = HERRAMIENTAS.filter((h) => h.roles.includes(rol));
  const [cuentas, setCuentas] = useState({});

  useEffect(() => {
    let vivo = true;
    const poner = (ruta, valor) => vivo && setCuentas((c) => ({ ...c, [ruta]: valor }));
    if (rol === 'admin' || rol === 'ventas') {
      leadsNuevos().then((n) => n > 0 && poner('/leads', { texto: n === 1 ? '1 nuevo' : `${n} nuevos`, tono: 'coral' })).catch(() => {});
    }
    if (rol === 'admin') {
      listar().then((l) => poner('/admin/portafolio', { texto: l.length === 1 ? '1 video' : `${l.length} videos`, tono: 'tinta' })).catch(() => {});
    }
    return () => { vivo = false; };
  }, [rol]);

  return (
    <main className="ad-contenido">
      <section className="ad-hola">
        <span className="ad-rol">{NOMBRE_ROL[rol] ?? rol}</span>
        <h1>Panel del equipo</h1>
        <p>Lo interno de Web Bonding en un solo lugar: entras una vez y abres cualquiera.</p>
      </section>

      <nav className="ad-grid" aria-label="Herramientas del equipo">
        {mias.map(({ ruta, icono: Icono, nombre, texto }) => (
          <Link key={ruta} to={aqui(ruta)} className="ad-carta">
            <span className="ad-carta__ico"><Icono aria-hidden="true" /></span>
            {cuentas[ruta] && <span className={`ad-carta__num ad-carta__num--${cuentas[ruta].tono}`}>{cuentas[ruta].texto}</span>}
            <b>{nombre}</b>
            <p>{texto}</p>
            <span className="ad-carta__ruta">{ruta} <FiArrowRight aria-hidden="true" /></span>
          </Link>
        ))}
      </nav>

      <section className="ad-web">
        <h2>En la web</h2>
        <ul>
          {PAGINAS.map(([ruta, nombre]) => (
            <li key={ruta}>
              <a href={ruta} target="_blank" rel="noopener noreferrer">{nombre} <FiArrowUpRight aria-hidden="true" /></a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
