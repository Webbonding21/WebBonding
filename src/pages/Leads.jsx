/* eslint-disable react/prop-types */
// Panel de leads (/leads): lo que llega del formulario de /crea-tu-app, con todo para escribirle a cada uno.
// Entra el equipo con su usuario del panel de R4. Los datos solo los entrega ver_leads(), que exige rol admin
// (supabase/leads.sql): sin eso no se ve nada aunque se abra la página. Fuera del sitemap y de los buscadores.
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiLogOut, FiAlertTriangle, FiPhone, FiMail, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
import { supabaseR4 } from '../components/r4/r4Api';
import AccesoEquipo from '../components/AccesoEquipo';
import CambiarClave from '../components/CambiarClave';
import '../assets/Leads.css';

const ESTADOS = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  propuesta: 'Propuesta',
  cliente: 'Cliente',
  descartado: 'Descartado',
};

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

const fecha = (iso) => new Date(iso).toLocaleString('es-VE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// solo en desarrollo: /leads?demo muestra datos inventados para revisar el diseño sin iniciar sesión
const DEMO = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo');
const EJEMPLOS = [
  { id: 'e1', created_at: '2026-10-26T14:05:00Z', tipo: 'Una app para mis clientes', nombre: 'María Pérez (ejemplo)', telefono: '0412 000 0001', correo: 'maria@ejemplo.com', adicional: 'Tengo una pizzería en Araure y quiero que los clientes pidan y paguen desde el teléfono.', acepta_novedades: true, version_politica: '2026-10-26', pagina: '/crea-tu-app', utm_source: 'instagram', utm_medium: 'paid', utm_campaign: 'apps-octubre', utm_content: 'gancho-a', estado: 'nuevo', notas: null },
  { id: 'e2', created_at: '2026-10-25T21:40:00Z', tipo: 'Un sistema para mi negocio', nombre: 'José Rodríguez (ejemplo)', telefono: '0424 000 0002', correo: 'jose@ejemplo.com', adicional: null, acepta_novedades: false, version_politica: '2026-10-26', pagina: '/crea-tu-app', utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, estado: 'contactado', notas: 'Le escribí el domingo; quiere ver precios del sistema de inventario.' },
  { id: 'e3', created_at: '2026-10-24T10:15:00Z', tipo: 'Todavía no sé qué necesito', nombre: 'Ana Gómez (ejemplo)', telefono: '+58 414 000 0003', correo: 'ana@ejemplo.com', adicional: 'Tengo una tienda de ropa.', acepta_novedades: true, version_politica: '2026-10-26', pagina: '/crea-tu-app', utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'apps-octubre', utm_content: 'explicativa-b', estado: 'propuesta', notas: null },
];

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
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');

  const cargar = async () => {
    setError('');
    if (DEMO) { setLeads(EJEMPLOS); return; }
    const { data, error: err } = await supabaseR4.rpc('ver_leads');
    if (err) {
      setError(err.message === 'No autorizado'
        ? 'Tu usuario no tiene permiso para ver los leads: hace falta el rol de ventas o de administrador. Pídeselo a Williams.'
        : `No se pudieron cargar los leads: ${err.message}`);
      setLeads([]);
    } else setLeads(data);
  };

  useEffect(() => { cargar(); }, []);

  // cambia el estado o las notas; se ve al instante y se deshace si la base no lo acepta
  const guardar = async (lead, cambios) => {
    const nuevo = { ...lead, ...cambios };
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? nuevo : l)));
    if (DEMO) return;
    const { error: err } = await supabaseR4.rpc('actualizar_lead', { p_id: lead.id, p_estado: nuevo.estado, p_notas: nuevo.notas ?? '' });
    if (err) {
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? lead : l)));
      setError(`No se guardó el cambio: ${err.message}`);
    }
  };

  const cuenta = useMemo(() => {
    const c = { todos: leads?.length ?? 0 };
    for (const l of leads ?? []) c[l.estado] = (c[l.estado] ?? 0) + 1;
    return c;
  }, [leads]);

  const visibles = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const qDigitos = q.replace(/\D/g, '');
    return (leads ?? []).filter((l) => (filtro === 'todos' || l.estado === filtro) && (!q
      || [l.nombre, l.correo, l.adicional, l.notas, l.tipo].some((v) => v?.toLowerCase().includes(q))
      || (qDigitos.length > 2 && l.telefono.replace(/\D/g, '').includes(qDigitos))));
  }, [leads, filtro, busca]);

  return (
    <>
      <header className="ld-cabecera">
        <div className="ld-cabecera__in">
          <a href="/" className="ld-marca"><img src="/logoenblanco.png" alt="" /> <span><b>Leads</b> Web Bonding</span></a>
          <div className="ld-cabecera__acciones">
            <span className="ld-usuario">{sesion.user?.email}</span>
            <button type="button" className="ld-btn ld-btn--plano" onClick={cargar} aria-label="Actualizar"><FiRefreshCw aria-hidden="true" /></button>
            {!DEMO && <CambiarClave />}
            <button type="button" className="ld-btn ld-btn--plano" onClick={() => (DEMO ? null : supabaseR4.auth.signOut())}>
              <FiLogOut aria-hidden="true" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="ld-contenido">
        <div className="ld-filtros" role="group" aria-label="Filtrar por estado">
          {['todos', ...Object.keys(ESTADOS)].map((e) => (
            <button type="button" key={e} aria-pressed={filtro === e} className={`ld-filtro ld-filtro--${e}`} onClick={() => setFiltro(e)}>
              {e === 'todos' ? 'Todos' : ESTADOS[e]} <span>{cuenta[e] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="ld-buscar">
          <FiSearch aria-hidden="true" />
          <input type="search" placeholder="Buscar por nombre, teléfono, correo o notas" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>

        {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
        {leads === null && <p className="ld-vacio">Cargando…</p>}
        {leads && !visibles.length && !error && (
          <p className="ld-vacio">{leads.length ? 'Ningún lead coincide con el filtro.' : 'Todavía no ha llegado ningún lead.'}</p>
        )}

        <div className="ld-lista">
          {visibles.map((l) => <Tarjeta key={l.id} lead={l} onGuardar={guardar} />)}
        </div>
      </main>
    </>
  );
}

function Tarjeta({ lead, onGuardar }) {
  const [notas, setNotas] = useState(lead.notas ?? '');
  useEffect(() => { setNotas(lead.notas ?? ''); }, [lead.notas]);

  const num = internacional(lead.telefono);
  // escribirle o llamarle a un lead nuevo lo pasa a «Contactado»
  const contactar = () => { if (lead.estado === 'nuevo') onGuardar(lead, { estado: 'contactado' }); };
  const campana = [lead.utm_source, lead.utm_medium, lead.utm_campaign, lead.utm_content].filter(Boolean).join(' · ');

  return (
    <article className={`ld-tarjeta ld-tarjeta--${lead.estado}`}>
      <div className="ld-tarjeta__top">
        <div>
          <h2 className="ld-tarjeta__nombre">{lead.nombre}</h2>
          <p className="ld-tarjeta__sub">{lead.tipo} · {fecha(lead.created_at)}</p>
        </div>
        <select className="ld-estado" value={lead.estado} aria-label="Estado"
          onChange={(e) => onGuardar(lead, { estado: e.target.value })}>
          {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      </div>

      <div className="ld-tarjeta__contacto">
        <a className="ld-btn ld-btn--wa" href={`https://wa.me/${num}?text=${encodeURIComponent(saludo(lead))}`}
          target="_blank" rel="noopener noreferrer" onClick={contactar}>
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
        <textarea rows="2" value={notas} placeholder="Qué hablaron, qué le interesa, cuándo volver a escribirle…"
          onChange={(e) => setNotas(e.target.value)}
          onBlur={() => { if (notas.trim() !== (lead.notas ?? '')) onGuardar(lead, { notas: notas.trim() || null }); }} />
      </label>
    </article>
  );
}
