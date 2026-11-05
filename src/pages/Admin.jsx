/* eslint-disable react/prop-types */
// Panel del equipo (/admin): todo lo de Web Bonding en un solo lugar, con el menú a la izquierda (en el teléfono, detrás
// del botón de menú). Cada sección de components/admin/secciones.js es una ruta, /admin/<sección>: el resumen, los datos
// de la web (portafolio, apps, proyectos, planes, servicios, preguntas, cifras, la cinta, por qué nosotros, cómo
// trabajamos), los leads, el catálogo del cotizador y los usuarios; el cotizador y R4 se abren aparte.
// Se entra con el usuario del equipo (Supabase Auth del proyecto de R4, el mismo del cotizador y R4) y cada quien ve lo de
// su rol en public.perfiles: 'admin' todo, 'ventas' los leads, el cotizador y R4, 'lectura' solo R4. Quien manda es la
// base (supabase/admin.sql): aquí el rol solo muestra u oculta.
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiArrowUpRight, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { supabaseR4 } from '../components/r4/r4Api';
import AccesoEquipo from '../components/AccesoEquipo';
import CambiarClave from '../components/CambiarClave';
import Inicio from '../components/admin/Inicio';
import Coleccion from '../components/admin/Coleccion';
import Equipo from '../components/admin/Equipo';
import PanelLeads from '../components/leads/PanelLeads';
import { GRUPOS, ROLES, SECCIONES, seccionDe } from '../components/admin/secciones';
import { DEMO, leadsNuevos, resumenContenido } from '../components/admin/datos';
import { rolDe } from '../lib/equipo';
import '../assets/Leads.css';
import '../assets/Admin.css';

// en el modo demo, los enlaces del panel se quedan en el demo
const aqui = (ruta) => (DEMO && ruta.startsWith('/admin') ? `${ruta}${ruta.includes('?') ? '&' : '?'}demo` : ruta);
const rutaDe = (s) => (s.vista === 'enlace' ? s.ruta : s.id === 'inicio' ? '/admin' : `/admin/${s.id}`);

export default function Admin() {
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
        <title>Panel · Web Bonding</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {sesion === undefined || (sesion && !rol) ? <p className="ld-cargando">Cargando…</p>
        : !sesion ? (
          <AccesoEquipo titulo="Panel del equipo"
            texto="Entra con tu usuario del equipo de Web Bonding, el mismo del cotizador y R4."
            aviso={sinConexion ? 'No se pudo conectar con la base de datos. Revisa la conexión y vuelve a intentar.' : ''} />
        ) : <Panel sesion={sesion} rol={rol} />}
    </div>
  );
}

function Panel({ sesion, rol }) {
  const { seccion: id = 'inicio' } = useParams();
  const { pathname } = useLocation();
  const seccion = seccionDe(id);
  const venta = rol === 'admin' || rol === 'ventas';
  const [resumen, setResumen] = useState(null); // { seccion: { total, visibles } }
  const [nuevos, setNuevos] = useState(null); // leads sin contactar
  const [menu, setMenu] = useState(false); // el menú en el teléfono

  // los números del menú: se piden al entrar y después de cada cambio
  const refrescar = useCallback(() => {
    if (rol === 'admin') resumenContenido().then(setResumen).catch(() => setResumen((r) => r ?? {}));
    if (venta) leadsNuevos().then(setNuevos).catch(() => {});
  }, [rol, venta]);
  useEffect(() => { refrescar(); }, [refrescar]);

  useEffect(() => { setMenu(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    if (!menu) return undefined;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const tecla = (e) => { if (e.key === 'Escape') setMenu(false); };
    document.addEventListener('keydown', tecla);
    return () => { document.body.style.overflow = previo; document.removeEventListener('keydown', tecla); };
  }, [menu]);

  if (!seccion) return <Navigate to={aqui('/admin')} replace />;
  if (seccion.vista === 'enlace') return <Navigate to={seccion.ruta} replace />;

  const mias = SECCIONES.filter((s) => s.roles.includes(rol));
  const puede = seccion.roles.includes(rol);
  const salir = () => (DEMO ? null : supabaseR4.auth.signOut());

  return (
    <div className={`pn-shell${menu ? ' is-menu' : ''}`}>
      <Helmet><title>{seccion.id === 'inicio' ? 'Panel · Web Bonding' : `${seccion.nombre} · Panel · Web Bonding`}</title></Helmet>

      <aside className="pn-lado" aria-label="Menú del panel">
        <div className="pn-lado__cab">
          <Link to={aqui('/admin')} className="pn-lado__marca"><img src="/logoenblanco.png" alt="" /> <span><b>Panel</b> Web Bonding</span></Link>
          <button type="button" className="pn-lado__cerrar" onClick={() => setMenu(false)} aria-label="Cerrar el menú"><FiX aria-hidden="true" /></button>
        </div>

        <nav className="pn-nav">
          {mias.filter((s) => !s.grupo).map((s) => <ItemMenu key={s.id} s={s} activo={s.id === seccion.id} />)}
          {GRUPOS.map((g) => {
            const items = mias.filter((s) => s.grupo === g.id);
            if (!items.length) return null;
            return (
              <div key={g.id} className="pn-nav__grupo">
                <p className="pn-nav__titulo">{g.nombre}</p>
                {items.map((s) => (
                  <ItemMenu key={s.id} s={s} activo={s.id === seccion.id}
                    numero={s.id === 'leads' ? nuevos : s.vista === 'coleccion' ? resumen?.[s.id]?.total : null}
                    urgente={s.id === 'leads' && nuevos > 0} />
                ))}
              </div>
            );
          })}
        </nav>

        <div className="pn-lado__pie">
          <a className="pn-nav__item pn-nav__web" href="/" target="_blank" rel="noopener noreferrer">
            <span>Abrir webbonding.net</span> <FiArrowUpRight aria-hidden="true" className="pn-nav__ext" />
          </a>
          <div className="pn-yo">
            <span className="pn-yo__ini" aria-hidden="true">{(sesion.user?.email ?? '?').charAt(0).toUpperCase()}</span>
            <span className="pn-yo__txt"><b>{sesion.user?.email}</b><i>{ROLES[rol]?.t ?? rol}</i></span>
          </div>
          <div className="pn-yo__acc">
            {!DEMO && <CambiarClave />}
            <button type="button" className="ld-btn ld-btn--plano" onClick={salir}>
              <FiLogOut aria-hidden="true" /> <span className="ld-btn__txt">Salir</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="pn-velo" onClick={() => setMenu(false)} aria-hidden="true" />

      <div className="pn-cuerpo">
        <header className="pn-tope">
          <button type="button" className="pn-tope__menu" onClick={() => setMenu(true)} aria-label="Abrir el menú" aria-expanded={menu}>
            <FiMenu aria-hidden="true" />
          </button>
          <span className="pn-tope__titulo">{seccion.id === 'inicio' ? 'Panel' : seccion.nombre}</span>
          {nuevos > 0 && seccion.id !== 'leads' && (
            <Link to={aqui('/admin/leads?estado=nuevo')} className="pn-tope__nuevos">{nuevos} {nuevos === 1 ? 'lead nuevo' : 'leads nuevos'}</Link>
          )}
        </header>

        <main className="pn-main" key={seccion.id}>
          {!puede ? (
            <div className="pn-sinpermiso">
              <p className="ld-error" role="alert">
                <FiAlertTriangle aria-hidden="true" /> {seccion.nombre} solo lo maneja un administrador. Pídele el rol a Williams.
              </p>
              <p><Link className="ld-btn" to={aqui('/admin')}><FiArrowLeft aria-hidden="true" /> Volver al resumen</Link></p>
            </div>
          ) : seccion.vista === 'inicio' ? <Inicio rol={rol} resumen={resumen} aqui={aqui} />
            : seccion.vista === 'leads' ? <PanelLeads rol={rol} alCambiar={refrescar} />
              : seccion.vista === 'equipo' ? <Equipo yo={sesion.user?.id} />
                : <Coleccion seccion={seccion} alCambiar={refrescar} />}
        </main>
      </div>
    </div>
  );
}

// una línea del menú: las herramientas aparte (cotizador, R4) se abren en otra pestaña
function ItemMenu({ s, activo, numero = null, urgente = false }) {
  const Icono = s.icono;
  if (s.vista === 'enlace') {
    return (
      <a className="pn-nav__item" href={s.ruta} target="_blank" rel="noopener noreferrer">
        <Icono aria-hidden="true" /> <span>{s.nombre}</span> <FiArrowUpRight aria-hidden="true" className="pn-nav__ext" />
      </a>
    );
  }
  return (
    <Link to={aqui(rutaDe(s))} className={`pn-nav__item${activo ? ' is-activo' : ''}`} aria-current={activo ? 'page' : undefined}>
      <Icono aria-hidden="true" /> <span>{s.nombre}</span>
      {numero !== null && numero !== undefined && (urgente || numero > 0) && (
        <b className={`pn-nav__num${urgente ? ' is-urgente' : ''}`} title={urgente ? 'Sin contactar' : undefined}>{numero.toLocaleString('es-VE')}</b>
      )}
    </Link>
  );
}
