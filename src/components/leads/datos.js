// src/components/leads/datos.js
// Lo que comparte el panel de leads (/leads): los estados, los filtros, los mensajes de WhatsApp, las consultas a la
// base y los datos inventados de ?demo. Las consultas van contra ver_leads() (supabase/leads.sql), que solo responde a
// admin y ventas; los filtros, el orden y las páginas los aplica PostgREST sobre ese resultado.
import { supabaseR4 } from '../r4/r4Api';

export const POR_PAGINA = 50;
export const MINUTO = 60000;

// el embudo, en orden; «descartado» va aparte. Los colores están en Leads.css (.ld-c--<estado>)
export const ESTADOS = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  propuesta: 'Propuesta',
  cliente: 'Cliente',
  descartado: 'Descartado',
};
export const CLAVES = Object.keys(ESTADOS);
export const SIGUIENTE = { nuevo: 'contactado', contactado: 'propuesta', propuesta: 'cliente' };

// lo que eligió en el formulario de /crea-tu-app
export const TIPOS = {
  app: { valor: 'Una app para mis clientes', t: 'App', sobre: ' sobre la app para tus clientes' },
  sistema: { valor: 'Un sistema para mi negocio', t: 'Sistema', sobre: ' sobre el sistema para tu negocio' },
  web: { valor: 'Una página web o tienda', t: 'Web', sobre: ' sobre tu página web' },
  nosabe: { valor: 'Todavía no sé qué necesito', t: 'No sabe', sobre: '' },
};
const tipoDe = (valor) => Object.values(TIPOS).find((x) => x.valor === valor);
export const tipoCorto = (valor) => tipoDe(valor)?.t ?? valor;

export const FECHAS = { todo: 'Cualquier fecha', hoy: 'Hoy', semana: 'Últimos 7 días', mes: 'Últimos 30 días' };
export const ORIGENES = {
  todos: 'Cualquier origen', directo: 'Directo (sin campaña)', instagram: 'Instagram', facebook: 'Facebook', google: 'Google', tiktok: 'TikTok',
};
export const ORDENES = { recientes: 'Más recientes primero', antiguos: 'Más antiguos primero' };
export const origenDe = (l) => (l.utm_source ? l.utm_source.charAt(0).toUpperCase() + l.utm_source.slice(1) : 'Directo');

// estado 'urgentes': los nuevos que llevan más de una hora sin contactar (la guía pide escribirles antes)
export const INICIALES = { estado: 'todos', tipo: '', fecha: 'todo', origen: 'todos', orden: 'recientes', busca: '' };

// los filtros viven en la dirección (?estado=nuevo&fecha=hoy…): sobreviven a una recarga y se pueden compartir
const EN_LA_URL = { estado: 'estado', tipo: 'tipo', fecha: 'fecha', origen: 'origen', orden: 'orden', busca: 'q' };
export function filtrosDeLaUrl() {
  const q = new URLSearchParams(window.location.search);
  const f = { ...INICIALES };
  Object.entries(EN_LA_URL).forEach(([k, p]) => { if (q.get(p)) f[k] = q.get(p); });
  if (f.estado !== 'urgentes' && f.estado !== 'todos' && !ESTADOS[f.estado]) f.estado = 'todos';
  if (f.tipo && !TIPOS[f.tipo]) f.tipo = '';
  if (!FECHAS[f.fecha]) f.fecha = 'todo';
  if (!ORIGENES[f.origen]) f.origen = 'todos';
  if (!ORDENES[f.orden]) f.orden = 'recientes';
  return f;
}
export function filtrosALaUrl(f) {
  const q = new URLSearchParams(window.location.search);
  Object.entries(EN_LA_URL).forEach(([k, p]) => { if (f[k] && f[k] !== INICIALES[k]) q.set(p, f[k]); else q.delete(p); });
  const texto = q.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${texto ? `?${texto}` : ''}`);
}

// ── WhatsApp ────────────────────────────────────────────────────────────────────────────────────────────────
// los mismos mensajes de la guía de ventas; {nombre} y {sobre} se llenan con los datos del lead
export const PLANTILLAS = [
  { id: 'primero', t: 'Primer mensaje', texto: 'Hola, {nombre} 👋 Te escribe Web Bonding. Vimos tu solicitud en nuestra página{sobre}. Para recomendarte lo que de verdad te sirve, cuéntame: ¿a qué se dedica tu negocio?' },
  { id: 'dia1', t: 'Seguimiento (al día siguiente)', texto: 'Hola, {nombre}, ¿cómo vas? 😊 Te escribo por lo de tu proyecto. Si quieres, en 10 minutos te muestro cómo se vería para tu negocio. ¿Te queda bien hoy o mañana?' },
  { id: 'dia3', t: 'Seguimiento (a los 3 días)', texto: '{nombre}, te dejo esto por si te sirve: son apps que hicimos y que ya están funcionando 👇 webbonding.net/crea-tu-app ¿Cuál se parece más a lo que tienes en mente?' },
  { id: 'ultimo', t: 'Último intento (a la semana)', texto: 'Hola, {nombre}. No quiero llenarte el chat: si ahorita no es el momento, no hay problema. Cuando quieras retomarlo, aquí estoy. 🙌' },
];

export const primerNombre = (n) => {
  const p = n.trim().split(/\s+/)[0] || '';
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
};

// número internacional para wa.me y tel: 0412 123 4567 → 584121234567
export const internacional = (tel) => {
  const n = tel.replace(/\D/g, '');
  if (n.startsWith('58')) return n;
  if (n.startsWith('0')) return `58${n.slice(1)}`;
  return n.length === 10 ? `58${n}` : n;
};

export const enlaceWhatsApp = (l, plantilla = PLANTILLAS[0]) => {
  const texto = plantilla.texto.replace('{nombre}', primerNombre(l.nombre)).replace('{sobre}', tipoDe(l.tipo)?.sobre ?? '');
  return `https://wa.me/${internacional(l.telefono)}?text=${encodeURIComponent(texto)}`;
};

// ── Fechas ──────────────────────────────────────────────────────────────────────────────────────────────────
export const fecha = (iso) => new Date(iso).toLocaleString('es-VE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// «hace 5 min», «hace 3 h», «ayer», «hace 4 días» y, de ahí en adelante, la fecha
export function hace(iso, ahora) {
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

// un lead nuevo sin contactar después de una hora ya va tarde
export const atrasado = (l, ahora) => l.estado === 'nuevo' && ahora - new Date(l.created_at) > 60 * MINUTO;

function desdeFecha(f) {
  if (f === 'todo') return null;
  const d = new Date();
  if (f === 'hoy') d.setHours(0, 0, 0, 0);
  else d.setDate(d.getDate() - (f === 'semana' ? 7 : 30));
  return d.toISOString();
}

// ── Consultas ───────────────────────────────────────────────────────────────────────────────────────────────
// solo en desarrollo: /leads?demo muestra 137 leads inventados, para revisar el diseño con volumen y sin iniciar sesión
export const DEMO = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo');
export const EJEMPLOS = DEMO ? Array.from({ length: 137 }, (_, i) => {
  const nombres = ['María Pérez', 'José Rodríguez', 'Ana Gómez', 'Luis Torres', 'Carmen Díaz', 'Pedro Silva', 'Rosa Mendoza', 'Jorge Castillo'];
  const negocios = ['una pizzería en Araure', 'un bodegón en Acarigua', 'una barbería', 'una ferretería', 'una farmacia', 'una tienda de ropa'];
  const fuente = [null, 'instagram', 'facebook', 'google'][i % 4];
  return {
    id: `e${i}`, created_at: new Date(Date.now() - (i * 4.7 + 0.3) * 3600000).toISOString(), tipo: Object.values(TIPOS)[i % 4].valor,
    nombre: `${nombres[i % nombres.length]} (ejemplo ${i + 1})`, telefono: `0412 000 ${String(1000 + i).slice(-4)}`,
    correo: `ejemplo${i + 1}@ejemplo.com`, adicional: i % 3 ? `Tengo ${negocios[i % negocios.length]}.` : null,
    acepta_novedades: i % 2 === 0, version_politica: '2026-10-26', pagina: '/crea-tu-app', utm_source: fuente,
    utm_medium: fuente && 'paid', utm_campaign: fuente && 'apps-octubre', utm_content: null,
    estado: i < 8 ? 'nuevo' : ['contactado', 'propuesta', 'nuevo', 'cliente', 'descartado'][i % 5],
    notas: i % 5 === 0 ? 'Le escribí; espera la propuesta.' : null,
  };
}) : [];

const CAMPOS_TEXTO = ['nombre', 'correo', 'adicional', 'notas', 'utm_source', 'utm_campaign'];
const haceUnaHora = () => new Date(Date.now() - 60 * MINUTO).toISOString();

// los filtros sobre la consulta; la búsqueda encuentra el teléfono con o sin espacios
function filtrar(q, f) {
  let c = q;
  if (f.estado === 'urgentes') c = c.eq('estado', 'nuevo').lt('created_at', haceUnaHora());
  else if (f.estado !== 'todos') c = c.eq('estado', f.estado);
  if (f.tipo) c = c.eq('tipo', TIPOS[f.tipo].valor);
  if (f.origen === 'directo') c = c.is('utm_source', null);
  else if (f.origen !== 'todos') c = c.ilike('utm_source', f.origen);
  const desde = desdeFecha(f.fecha);
  if (desde) c = c.gte('created_at', desde);
  const b = f.busca.replace(/[,()"*:\\]/g, ' ').trim().replace(/\s+/g, '*');
  if (b) {
    const condiciones = CAMPOS_TEXTO.map((campo) => `${campo}.ilike.*${b}*`);
    const digitos = f.busca.replace(/\D/g, '');
    if (digitos.length >= 4) condiciones.push(`telefono.ilike.*${digitos.split('').join('*')}*`);
    c = c.or(condiciones.join(','));
  }
  return c;
}

function filtrarEjemplos(f) {
  const desde = desdeFecha(f.fecha);
  const b = f.busca.trim().toLowerCase();
  const digitos = f.busca.replace(/\D/g, '');
  const ahora = Date.now();
  return EJEMPLOS.filter((l) => (f.estado === 'todos' || (f.estado === 'urgentes' ? atrasado(l, ahora) : l.estado === f.estado))
    && (!f.tipo || l.tipo === TIPOS[f.tipo].valor)
    && (f.origen === 'todos' || (f.origen === 'directo' ? !l.utm_source : l.utm_source === f.origen))
    && (!desde || l.created_at >= desde)
    && (!b || CAMPOS_TEXTO.some((c) => l[c]?.toLowerCase().includes(b)) || (digitos.length >= 4 && l.telefono.replace(/\D/g, '').includes(digitos))));
}

export async function consultar(f, pagina) {
  const desde = pagina * POR_PAGINA;
  if (DEMO) {
    const todos = filtrarEjemplos(f).sort((a, b) => (f.orden === 'antiguos' ? 1 : -1) * a.created_at.localeCompare(b.created_at));
    return { filas: todos.slice(desde, desde + POR_PAGINA).map((l) => ({ ...l })), total: todos.length }; // copias, como las que da la base
  }
  const { data, count, error } = await filtrar(supabaseR4.rpc('ver_leads', undefined, { count: 'exact' }), f)
    .order('created_at', { ascending: f.orden === 'antiguos' })
    .range(desde, desde + POR_PAGINA - 1);
  if (error) throw error;
  return { filas: data, total: count ?? data.length };
}

// cuántos hay en cada estado (y cuántos van tarde) con los demás filtros puestos: solo cuenta, no trae filas
export async function contar(f) {
  const claves = ['todos', ...CLAVES, 'urgentes'];
  if (DEMO) return Object.fromEntries(claves.map((e) => [e, filtrarEjemplos({ ...f, estado: e }).length]));
  const respuestas = await Promise.all(claves.map((e) => filtrar(supabaseR4.rpc('ver_leads', undefined, { count: 'exact', head: true }), { ...f, estado: e })));
  return Object.fromEntries(claves.map((e, k) => [e, respuestas[k].count ?? 0]));
}

export async function contarTodos() {
  if (DEMO) return EJEMPLOS.length;
  const { count, error } = await supabaseR4.rpc('ver_leads', undefined, { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function actualizar(lead) {
  if (DEMO) { Object.assign(EJEMPLOS.find((x) => x.id === lead.id), { estado: lead.estado, notas: lead.notas }); return null; }
  const { error } = await supabaseR4.rpc('actualizar_lead', { p_id: lead.id, p_estado: lead.estado, p_notas: lead.notas ?? '' });
  return error;
}
