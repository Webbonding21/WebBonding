/* eslint-disable react/prop-types */
// Panel de leads (/leads), pensado para muchos leads: una lista compacta con filtros, búsqueda y páginas, que le pide
// a la base solo lo que se ve; el detalle de cada lead se abre al lado (a pantalla completa en el teléfono).
// Entra el equipo con su usuario (components/AccesoEquipo). Los datos solo los entrega ver_leads(), que exige rol admin
// o ventas (supabase/leads.sql); los filtros, el orden y las páginas los aplica PostgREST sobre ese resultado.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { FiLogOut, FiAlertTriangle, FiPhone, FiMail, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
import { supabaseR4 } from '../components/r4/r4Api';
import AccesoEquipo from '../components/AccesoEquipo';
import CambiarClave from '../components/CambiarClave';
import '../assets/Leads.css';

const POR_PAGINA = 50;
const MINUTO = 60000;

const ESTADOS = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  propuesta: 'Propuesta',
  cliente: 'Cliente',
  descartado: 'Descartado',
};

// lo que eligió en el formulario, en corto
const TIPOS = {
  'Una app para mis clientes': 'App',
  'Un sistema para mi negocio': 'Sistema',
  'Una página web o tienda': 'Web',
  'Todavía no sé qué necesito': 'No sabe',
};

const FECHAS = { todo: 'Todas las fechas', hoy: 'Hoy', semana: 'Últimos 7 días', mes: 'Últimos 30 días' };

// para el saludo de WhatsApp, según lo que eligió en el formulario
const SOBRE = {
  'Una app para mis clientes': 'sobre la app para tus clientes',
  'Un sistema para mi negocio': 'sobre el sistema para tu negocio',
  'Una página web o tienda': 'sobre tu página web',
};

const primerNombre = (n) => {
  const p = n.trim().split(/\s+/)[0] || '';
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
};

// número internacional para wa.me y tel: 0412 123 4567 → 584121234567
const internacional = (tel) => {
  const n = tel.replace(/\D/g, '');
  if (n.startsWith('58')) return n;
  if (n.startsWith('0')) return `58${n.slice(1)}`;
  return n.length === 10 ? `58${n}` : n;
};

const saludo = (l) => `Hola ${primerNombre(l.nombre)}, te escribe Web Bonding 👋 Recibimos tu solicitud en nuestra página${
  SOBRE[l.tipo] ? ` ${SOBRE[l.tipo]}` : ''}. ¿Te parece si conversamos un momento para entender tu negocio?`;

const enlaceWhatsApp = (l) => `https://wa.me/${internacional(l.telefono)}?text=${encodeURIComponent(saludo(l))}`;

const fecha = (iso) => new Date(iso).toLocaleString('es-VE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// «hace 5 min», «hace 3 h», «ayer», «hace 4 días» y, de ahí en adelante, la fecha
function hace(iso, ahora) {
  const min = Math.floor((ahora - new Date(iso)) / MINUTO);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ayer';
  if (d < 7) return `hace ${d} días`;
  return new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
}

// un lead nuevo sin contactar después de una hora ya va tarde: la guía pide escribirle en menos de una hora
const atrasado = (l, ahora) => l.estado === 'nuevo' && ahora - new Date(l.created_at) > 60 * MINUTO;

function desdeFecha(f) {
  if (f === 'todo') return null;
  const d = new Date();
  if (f === 'hoy') d.setHours(0, 0, 0, 0);
  else d.setDate(d.getDate() - (f === 'semana' ? 7 : 30));
  return d.toISOString();
}

// ── Consultas ───────────────────────────────────────────────────────────────────────────────────────────────
// solo en desarrollo: /leads?demo muestra 137 leads inventados para revisar el diseño con volumen y sin iniciar sesión
const DEMO = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo');
const EJEMPLOS = DEMO ? Array.from({ length: 137 }, (_, i) => {
  const nombres = ['María Pérez', 'José Rodríguez', 'Ana Gómez', 'Luis Torres', 'Carmen Díaz', 'Pedro Silva', 'Rosa Mendoza', 'Jorge Castillo'];
  const negocios = ['una pizzería en Araure', 'un bodegón en Acarigua', 'una barbería', 'una ferretería', 'una farmacia', 'una tienda de ropa'];
  const fuente = [null, 'instagram', 'facebook', 'google'][i % 4];
  return {
    id: `e${i}`, created_at: new Date(Date.now() - (i * 4.7 + 0.3) * 3600000).toISOString(), tipo: Object.keys(TIPOS)[i % 4],
    nombre: `${nombres[i % nombres.length]} (ejemplo ${i + 1})`, telefono: `0412 000 ${String(1000 + i).slice(-4)}`,
    correo: `ejemplo${i + 1}@ejemplo.com`, adicional: i % 3 ? `Tengo ${negocios[i % negocios.length]}.` : null,
    acepta_novedades: i % 2 === 0, version_politica: '2026-10-26', pagina: '/crea-tu-app', utm_source: fuente,
    utm_medium: fuente && 'paid', utm_campaign: fuente && 'apps-octubre', utm_content: null,
    estado: i < 8 ? 'nuevo' : ['contactado', 'propuesta', 'nuevo', 'cliente', 'descartado'][i % 5], notas: i % 5 === 0 ? 'Le escribí; espera la propuesta.' : null,
  };
}) : [];

const CAMPOS_TEXTO = ['nombre', 'correo', 'adicional', 'notas', 'utm_source', 'utm_campaign'];

// los filtros sobre la consulta: estado, tipo, fecha y la búsqueda (el teléfono se encuentra con o sin espacios)
function filtrar(q, { estado, tipo, fecha: f, busca }) {
  let c = q;
  if (estado !== 'todos') c = c.eq('estado', estado);
  if (tipo) c = c.eq('tipo', tipo);
  const desde = desdeFecha(f);
  if (desde) c = c.gte('created_at', desde);
  const b = busca.replace(/[,()"*:\\]/g, ' ').trim().replace(/\s+/g, '*');
  if (b) {
    const condiciones = CAMPOS_TEXTO.map((campo) => `${campo}.ilike.*${b}*`);
    const digitos = busca.replace(/\D/g, '');
    if (digitos.length >= 4) condiciones.push(`telefono.ilike.*${digitos.split('').join('*')}*`);
    c = c.or(condiciones.join(','));
  }
  return c;
}

function filtrarEjemplos({ estado, tipo, fecha: f, busca }) {
  const desde = desdeFecha(f);
  const b = busca.trim().toLowerCase();
  const digitos = busca.replace(/\D/g, '');
  return EJEMPLOS.filter((l) => (estado === 'todos' || l.estado === estado) && (!tipo || l.tipo === tipo)
    && (!desde || l.created_at >= desde)
    && (!b || CAMPOS_TEXTO.some((c) => l[c]?.toLowerCase().includes(b)) || (digitos.length >= 4 && l.telefono.replace(/\D/g, '').includes(digitos))));
}

async function consultar(filtros, pagina) {
  const desde = pagina * POR_PAGINA;
  if (DEMO) {
    const todos = filtrarEjemplos(filtros).sort((a, b) => (filtros.orden === 'antiguos' ? 1 : -1) * a.created_at.localeCompare(b.created_at));
    return { filas: todos.slice(desde, desde + POR_PAGINA), total: todos.length };
  }
  const { data, count, error } = await filtrar(supabaseR4.rpc('ver_leads', undefined, { count: 'exact' }), filtros)
    .order('created_at', { ascending: filtros.orden === 'antiguos' })
    .range(desde, desde + POR_PAGINA - 1);
  if (error) throw error;
  return { filas: data, total: count ?? data.length };
}

// cuántos hay en cada estado con los demás filtros puestos (solo cuenta: no trae filas)
async function contar(filtros) {
  const claves = ['todos', ...Object.keys(ESTADOS)];
  if (DEMO) return Object.fromEntries(claves.map((e) => [e, filtrarEjemplos({ ...filtros, estado: e }).length]));
  const respuestas = await Promise.all(claves.map((e) => filtrar(supabaseR4.rpc('ver_leads', undefined, { count: 'exact', head: true }), { ...filtros, estado: e })));
  return Object.fromEntries(claves.map((e, k) => [e, respuestas[k].count ?? 0]));
}

async function contarTodos() {
  if (DEMO) return EJEMPLOS.length;
  const { count, error } = await supabaseR4.rpc('ver_leads', undefined, { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

const mensajeDeError = (err) => (err.message === 'No autorizado'
  ? 'Tu usuario no tiene permiso para ver los leads: hace falta el rol de ventas o de administrador. Pídeselo a Williams.'
  : `No se pudieron cargar los leads: ${err.message}`);

// la hora de «ahora», que se mueve cada minuto para que «hace 5 min» se mantenga al día
function useAhora() {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), MINUTO);
    return () => clearInterval(id);
  }, []);
  return ahora;
}

export default function Leads() {
  const [sesion, setSesion] = useState(DEMO ? { user: { email: 'demo@ejemplo.com' } } : undefined); // undefined: aún no se sabe
  const [sinConexion, setSinConexion] = useState(false);

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

  return (
    <div className="ld">
      <Helmet>
        <title>Leads · Web Bonding</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {sesion === undefined
        ? <p className="ld-cargando">Cargando…</p>
        : sesion ? <Panel sesion={sesion} /> : (
          <AccesoEquipo titulo="Leads"
            texto="Entra con tu usuario del equipo de Web Bonding. Solo ventas y los administradores ven los datos."
            aviso={sinConexion ? 'No se pudo conectar con la base de datos de leads. Si sigue así, la web todavía apunta al proyecto viejo de Supabase.' : ''} />
        )}
    </div>
  );
}

function Panel({ sesion }) {
  const ahora = useAhora();
  const [filtros, setFiltros] = useState({ estado: 'todos', tipo: '', fecha: 'todo', busca: '', orden: 'recientes' });
  const [escrito, setEscrito] = useState(''); // lo que se escribe en el buscador; se busca al dejar de escribir
  const [filas, setFilas] = useState(null);
  const [total, setTotal] = useState(0);
  const [cuenta, setCuenta] = useState({});
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState(null); // id del lead que se ve al lado
  const [marcados, setMarcados] = useState(() => new Set());
  const [nuevos, setNuevos] = useState(0); // leads que llegaron después de la última carga
  const conocidos = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setFiltros((f) => (f.busca === escrito ? f : { ...f, busca: escrito })), 350);
    return () => clearTimeout(t);
  }, [escrito]);

  const cargar = useCallback(async (pag = 0) => {
    setCargando(true); setError('');
    try {
      const [res, c] = await Promise.all([consultar(filtros, pag), pag === 0 ? contar(filtros) : null]);
      setFilas((prev) => (pag === 0 ? res.filas : [...(prev ?? []), ...res.filas]));
      setTotal(res.total);
      setPagina(pag);
      if (c) setCuenta(c);
    } catch (err) {
      setError(mensajeDeError(err));
      setFilas((prev) => prev ?? []);
    }
    setCargando(false);
  }, [filtros]);

  useEffect(() => { setMarcados(new Set()); cargar(0); }, [cargar]);

  // cada minuto se revisa si llegaron leads nuevos, sin recargar la lista que se está trabajando
  useEffect(() => {
    let vivo = true;
    const revisar = async () => {
      const n = await contarTodos().catch(() => null);
      if (!vivo || n === null) return;
      if (conocidos.current === null) conocidos.current = n;
      else setNuevos(Math.max(0, n - conocidos.current));
    };
    revisar();
    const id = setInterval(revisar, MINUTO);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  const verNuevos = async () => {
    conocidos.current = await contarTodos().catch(() => conocidos.current);
    setNuevos(0);
    setFiltros((f) => ({ ...f, estado: 'todos', orden: 'recientes' }));
    cargar(0);
  };

  // cambia el estado o las notas: se ve al instante y se deshace si la base no lo acepta
  const guardar = async (lead, cambios) => {
    const nuevo = { ...lead, ...cambios };
    const poner = (l) => setFilas((fs) => fs.map((x) => (x.id === l.id ? l : x)));
    poner(nuevo);
    const moverCuenta = (de, a) => setCuenta((c) => ({ ...c, [de]: Math.max(0, (c[de] ?? 1) - 1), [a]: (c[a] ?? 0) + 1 }));
    if (cambios.estado && cambios.estado !== lead.estado) moverCuenta(lead.estado, cambios.estado);
    if (DEMO) { Object.assign(EJEMPLOS.find((x) => x.id === lead.id), cambios); return; }
    const { error: err } = await supabaseR4.rpc('actualizar_lead', { p_id: lead.id, p_estado: nuevo.estado, p_notas: nuevo.notas ?? '' });
    if (err) {
      poner(lead);
      if (cambios.estado && cambios.estado !== lead.estado) moverCuenta(cambios.estado, lead.estado);
      setError(`No se guardó el cambio de ${lead.nombre}: ${err.message}`);
    }
  };

  const marcar = (id) => setMarcados((m) => {
    const s = new Set(m);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const todosMarcados = Boolean(filas?.length) && filas.every((l) => marcados.has(l.id));
  const marcarTodos = () => setMarcados(todosMarcados ? new Set() : new Set(filas.map((l) => l.id)));
  const marcarComo = async (estado) => {
    const elegidos = filas.filter((l) => marcados.has(l.id) && l.estado !== estado);
    setMarcados(new Set());
    await Promise.all(elegidos.map((l) => guardar(l, { estado })));
  };

  const poner = (cambio) => setFiltros((f) => ({ ...f, ...cambio }));
  const leadAbierto = filas?.find((l) => l.id === abierto);

  return (
    <>
      <header className="ld-cabecera">
        <div className="ld-cabecera__in">
          <a href="/" className="ld-marca"><img src="/logoenblanco.png" alt="" /> <span><b>Leads</b> Web Bonding</span></a>
          <div className="ld-cabecera__acciones">
            <span className="ld-usuario">{sesion.user?.email}</span>
            <button type="button" className="ld-btn ld-btn--plano" onClick={() => cargar(0)} aria-label="Actualizar" disabled={cargando}>
              <FiRefreshCw aria-hidden="true" />
            </button>
            {!DEMO && <CambiarClave />}
            <button type="button" className="ld-btn ld-btn--plano" onClick={() => (DEMO ? null : supabaseR4.auth.signOut())}>
              <FiLogOut aria-hidden="true" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="ld-contenido">
        {nuevos > 0 && (
          <button type="button" className="ld-aviso-nuevos" onClick={verNuevos}>
            {nuevos === 1 ? 'Llegó 1 lead nuevo' : `Llegaron ${nuevos} leads nuevos`} · Ver
          </button>
        )}

        <div className="ld-filtros" role="group" aria-label="Filtrar por estado">
          {['todos', ...Object.keys(ESTADOS)].map((e) => (
            <button type="button" key={e} aria-pressed={filtros.estado === e} className={`ld-filtro ld-filtro--${e}`} onClick={() => poner({ estado: e })}>
              {e === 'todos' ? 'Todos' : ESTADOS[e]} <span>{(cuenta[e] ?? 0).toLocaleString('es-VE')}</span>
            </button>
          ))}
        </div>

        <div className="ld-barra">
          <label className="ld-buscar">
            <FiSearch aria-hidden="true" />
            <input type="search" placeholder="Buscar por nombre, teléfono, correo, notas o campaña" value={escrito} onChange={(e) => setEscrito(e.target.value)} />
          </label>
          <select className="ld-select" value={filtros.tipo} onChange={(e) => poner({ tipo: e.target.value })} aria-label="Qué quiere">
            <option value="">Todo lo que piden</option>
            {Object.entries(TIPOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
          <select className="ld-select" value={filtros.fecha} onChange={(e) => poner({ fecha: e.target.value })} aria-label="Fecha">
            {Object.entries(FECHAS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
          <select className="ld-select" value={filtros.orden} onChange={(e) => poner({ orden: e.target.value })} aria-label="Orden">
            <option value="recientes">Más recientes primero</option>
            <option value="antiguos">Más antiguos primero</option>
          </select>
        </div>

        {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}

        {marcados.size > 0 && (
          <div className="ld-masivo" role="region" aria-label="Acciones con los seleccionados">
            <b>{marcados.size} {marcados.size === 1 ? 'seleccionado' : 'seleccionados'}</b>
            <span>Marcar como:</span>
            {Object.entries(ESTADOS).map(([v, t]) => (
              <button type="button" key={v} className="ld-masivo__btn" onClick={() => marcarComo(v)}>{t}</button>
            ))}
            <button type="button" className="ld-masivo__quitar" onClick={() => setMarcados(new Set())}>Quitar selección</button>
          </div>
        )}

        {filas === null ? <p className="ld-vacio">Cargando…</p> : !filas.length ? (
          <p className="ld-vacio">{cuenta.todos ? 'Ningún lead coincide con los filtros.' : 'Todavía no ha llegado ningún lead.'}</p>
        ) : (
          <ul className="ld-lista" aria-busy={cargando}>
            <li className="ld-fila ld-fila--cabeza" aria-hidden="true">
              <input type="checkbox" checked={todosMarcados} onChange={marcarTodos} tabIndex={-1} />
              <span>Lead</span><span>Teléfono</span><span>Llegó</span><span>Origen</span><span>Estado</span><span />
            </li>
            {filas.map((l) => (
              <Fila key={l.id} lead={l} ahora={ahora} marcado={marcados.has(l.id)} onMarcar={marcar} onAbrir={setAbierto} onGuardar={guardar} />
            ))}
          </ul>
        )}

        {filas && filas.length < total && (
          <button type="button" className="ld-mas" onClick={() => cargar(pagina + 1)} disabled={cargando}>
            {cargando ? 'Cargando…' : `Cargar más · ${filas.length.toLocaleString('es-VE')} de ${total.toLocaleString('es-VE')}`}
          </button>
        )}
        {filas && filas.length > 0 && filas.length >= total && total > POR_PAGINA && (
          <p className="ld-fin">Son todos: {total.toLocaleString('es-VE')} leads.</p>
        )}
      </main>

      {leadAbierto && <Ficha lead={leadAbierto} ahora={ahora} onCerrar={() => setAbierto(null)} onGuardar={guardar} />}
    </>
  );
}

function Fila({ lead: l, ahora, marcado, onMarcar, onAbrir, onGuardar }) {
  const tarde = atrasado(l, ahora);
  const detener = (e) => e.stopPropagation();
  return (
    <li className={`ld-fila ld-fila--${l.estado}${marcado ? ' is-marcada' : ''}`} onClick={() => onAbrir(l.id)}>
      <input type="checkbox" checked={marcado} onClick={detener} onChange={() => onMarcar(l.id)} aria-label={`Seleccionar a ${l.nombre}`} />
      <button type="button" className="ld-fila__quien" onClick={(e) => { detener(e); onAbrir(l.id); }}>
        <b>{l.nombre}</b>
        <span>{TIPOS[l.tipo] ?? l.tipo}{l.adicional ? ` · ${l.adicional}` : ''}</span>
      </button>
      <span className="ld-fila__tel">{l.telefono}</span>
      <span className={`ld-fila__cuando${tarde ? ' is-tarde' : ''}`} title={tarde ? `Sin contactar desde el ${fecha(l.created_at)}` : fecha(l.created_at)}>
        {hace(l.created_at, ahora)}
      </span>
      <span className="ld-fila__origen">{l.utm_source || 'Directo'}</span>
      <select className={`ld-estado ld-estado--${l.estado}`} value={l.estado} onClick={detener} onChange={(e) => onGuardar(l, { estado: e.target.value })} aria-label={`Estado de ${l.nombre}`}>
        {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
      <a className="ld-fila__wa" href={enlaceWhatsApp(l)} target="_blank" rel="noopener noreferrer" aria-label={`Escribirle a ${l.nombre} por WhatsApp`}
        onClick={(e) => { detener(e); if (l.estado === 'nuevo') onGuardar(l, { estado: 'contactado' }); }}>
        <SiWhatsapp aria-hidden="true" />
      </a>
    </li>
  );
}

function Ficha({ lead, ahora, onCerrar, onGuardar }) {
  const [notas, setNotas] = useState(lead.notas ?? '');
  useEffect(() => { setNotas(lead.notas ?? ''); }, [lead.id, lead.notas]);
  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [onCerrar]);

  const num = internacional(lead.telefono);
  // escribirle o llamarle a un lead nuevo lo pasa a «Contactado»
  const contactar = () => { if (lead.estado === 'nuevo') onGuardar(lead, { estado: 'contactado' }); };
  const campana = [lead.utm_source, lead.utm_medium, lead.utm_campaign, lead.utm_content].filter(Boolean).join(' · ');
  const guardarNotas = () => { if (notas.trim() !== (lead.notas ?? '')) onGuardar(lead, { notas: notas.trim() || null }); };

  return createPortal(
    <div className="ld-ficha-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <aside className={`ld-ficha ld-ficha--${lead.estado}`} role="dialog" aria-modal="true" aria-label={`Lead: ${lead.nombre}`}>
        <div className="ld-ficha__cabecera">
          <div>
            <h2>{lead.nombre}</h2>
            <p>{lead.tipo} · {fecha(lead.created_at)} ({hace(lead.created_at, ahora)})</p>
          </div>
          <button type="button" className="ld-modal__cerrar" onClick={onCerrar} aria-label="Cerrar"><FiX /></button>
        </div>

        <label className="ld-ficha__estado">
          <span>Estado</span>
          <select className={`ld-estado ld-estado--${lead.estado}`} value={lead.estado} onChange={(e) => onGuardar(lead, { estado: e.target.value })}>
            {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </label>

        <div className="ld-ficha__contacto">
          <a className="ld-btn ld-btn--wa" href={enlaceWhatsApp(lead)} target="_blank" rel="noopener noreferrer" onClick={contactar}>
            <SiWhatsapp aria-hidden="true" /> WhatsApp
          </a>
          <a className="ld-btn" href={`tel:+${num}`} onClick={contactar}><FiPhone aria-hidden="true" /> Llamar</a>
          <a className="ld-btn" href={`mailto:${lead.correo}`}><FiMail aria-hidden="true" /> Correo</a>
        </div>

        <dl className="ld-datos">
          <div><dt>Teléfono</dt><dd>{lead.telefono}</dd></div>
          <div><dt>Correo</dt><dd>{lead.correo}</dd></div>
          <div><dt>Novedades</dt><dd>{lead.acepta_novedades ? 'Sí quiere recibir ofertas' : 'No'}</dd></div>
          <div><dt>Llegó por</dt><dd>{campana || 'Sin campaña (directo)'}</dd></div>
        </dl>

        {lead.adicional && <blockquote className="ld-adicional">{lead.adicional}</blockquote>}

        <label className="ld-notas">
          <span>Notas del equipo</span>
          <textarea rows="5" value={notas} placeholder="Qué hablaron, qué le interesa, cuándo volver a escribirle…"
            onChange={(e) => setNotas(e.target.value)} onBlur={guardarNotas} />
        </label>
      </aside>
    </div>,
    document.body,
  );
}
