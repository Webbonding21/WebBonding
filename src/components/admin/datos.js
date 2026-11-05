// Consultas del panel /admin. Todo pasa por las funciones de supabase/portafolio.sql y supabase/admin.sql, que exigen el
// rol 'admin' (los leads, también 'ventas'): aquí el rol solo muestra u oculta. Las imágenes van a dos buckets públicos:
// «portafolio» (las portadas, recortadas a 540x960) y «contenido» (capturas de las apps, fotos de los servicios), siempre
// reducidas en el navegador y con nombre nuevo, así que nunca se reemplaza una que esté en uso.
// En desarrollo, /admin?demo trabaja en memoria con lo que trae el código.
import { supabaseR4 } from '../r4/r4Api';
import { DEMO, EJEMPLOS } from '../../data/portafolio';
import { CIFRAS, PALABRAS, SERVICIOS, PILARES, PASOS, PROYECTOS, PLANES, PREGUNTAS } from '../../data/sitio';
import APPS from '../../data/apps';
import { CATALOGO_BASE, HOURLY_RATE_USD } from '../../data/catalog';
import { EJEMPLOS as LEADS_DEMO } from '../leads/datos';

export { DEMO };

// los errores de la base, en palabras del panel
export function mensajeDeError(err) {
  const m = err?.message ?? String(err);
  if (m === 'No autorizado' || err?.code === '42501') return 'Tu usuario no puede cambiar esto: hace falta el rol de administrador.';
  if (err?.code === '23505') return 'Ese video ya está en el portafolio.';
  if (err?.code === 'PGRST202' || /Could not find the function/i.test(m)) {
    return 'La base todavía no tiene esta parte del panel: falta aplicar supabase/admin.sql en Supabase.';
  }
  if (/titulo_check/.test(m)) return 'El título va de 1 a 80 letras.';
  if (/duracion_check/.test(m)) return 'La duración va como 1:34 (minutos y segundos).';
  if (/portada_check/.test(m)) return 'Esa portada no se puede usar: súbela de nuevo.';
  if (/datos_check/.test(m)) return 'Es demasiado texto para un solo elemento.';
  if (/exceeded the maximum allowed size|Payload too large/i.test(m)) return 'La imagen pesa demasiado: usa una de menos de 3 MB.';
  if (/mime type/i.test(m)) return 'Ese tipo de archivo no se puede subir: usa JPG, PNG o WebP.';
  if (/fetch|network/i.test(m)) return 'No hay conexión con la base de datos.';
  return m;
}

const copia = (o) => JSON.parse(JSON.stringify(o));

// ── El contenido de la web (web_bonding.contenido) ──────────────────────────────────────────────────────────

// lo que trae el código, sección por sección: es la semilla de la base y lo que usa el modo demo
export const BASES = {
  cifras: CIFRAS,
  palabras: PALABRAS,
  servicios: SERVICIOS,
  pilares: PILARES,
  pasos: PASOS,
  proyectos: PROYECTOS,
  planes: PLANES,
  preguntas: PREGUNTAS,
  apps: APPS,
  catalogo: CATALOGO_BASE,
  ajustes: [{ tarifa_hora: HOURLY_RATE_USD }],
};

const MEMORIA = DEMO ? Object.fromEntries(Object.entries(BASES).map(([s, lista]) => [s, lista.map((d, i) => ({
  id: `${s}-${i + 1}`, seccion: s, datos: copia(d), orden: i + 1, visible: true,
  created_at: new Date(Date.now() - (lista.length - i) * 86400000).toISOString(),
}))])) : {};
let demoN = 0;

// todo lo de una sección, también lo oculto, en su orden
export async function listarContenido(seccion) {
  if (DEMO) return (MEMORIA[seccion] ?? []).slice().sort((a, b) => a.orden - b.orden).map(copia);
  const { data, error } = await supabaseR4.rpc('contenido_admin', { p_seccion: seccion });
  if (error) throw error;
  return data;
}

// crea (sin id; al final, o en `orden`) o cambia un elemento; devuelve su id
export async function guardarContenido(seccion, { id = null, datos, visible = true, orden = null }) {
  if (DEMO) {
    const lista = (MEMORIA[seccion] ??= []);
    if (id) {
      const f = lista.find((x) => x.id === id);
      if (!f) throw new Error('Ese elemento ya no existe');
      Object.assign(f, { datos: copia(datos), visible });
      return id;
    }
    demoN += 1;
    const nuevo = { id: `${seccion}-n${demoN}`, seccion, datos: copia(datos), visible, created_at: new Date().toISOString(),
      orden: orden ?? Math.max(0, ...lista.map((x) => x.orden)) + 1 };
    lista.push(nuevo);
    return nuevo.id;
  }
  const { data, error } = await supabaseR4.rpc('guardar_contenido', {
    p_id: id, p_seccion: seccion, p_datos: datos, p_visible: visible, p_orden: orden,
  });
  if (error) throw error;
  return data;
}

export async function mostrarContenido(seccion, ids, visible) {
  if (DEMO) { (MEMORIA[seccion] ?? []).forEach((f) => { if (ids.includes(f.id)) f.visible = visible; }); return; }
  const { error } = await supabaseR4.rpc('mostrar_contenido', { p_ids: ids, p_visible: visible });
  if (error) throw error;
}

// los ids en el orden en que salen
export async function ordenarContenido(seccion, ids) {
  if (DEMO) { ids.forEach((id, k) => { const f = MEMORIA[seccion]?.find((x) => x.id === id); if (f) f.orden = k + 1; }); return; }
  const { error } = await supabaseR4.rpc('ordenar_contenido', { p_ids: ids });
  if (error) throw error;
}

export async function borrarContenido(seccion, ids) {
  if (DEMO) { MEMORIA[seccion] = (MEMORIA[seccion] ?? []).filter((f) => !ids.includes(f.id)); return; }
  const { error } = await supabaseR4.rpc('borrar_contenido', { p_ids: ids });
  if (error) throw error;
}

// { seccion: { total, visibles } } para el menú y el resumen (también el portafolio)
export async function resumenContenido() {
  if (DEMO) {
    const r = Object.fromEntries(Object.entries(MEMORIA).map(([s, l]) => [s, { total: l.length, visibles: l.filter((f) => f.visible).length }]));
    r.portafolio = { total: EJEMPLOS.length, visibles: EJEMPLOS.filter((v) => v.visible).length };
    return r;
  }
  const { data, error } = await supabaseR4.rpc('resumen_contenido');
  if (error) throw error;
  return Object.fromEntries(data.map((f) => [f.seccion, { total: Number(f.total), visibles: Number(f.visibles) }]));
}

// ── Los videos del portafolio (web_bonding.portafolio), con la misma forma que el contenido ─────────────────

const DEL_VIDEO = ['codigo', 'titulo', 'etiqueta', 'tipo', 'descripcion', 'duracion', 'portada'];
const comoFila = (v) => ({ id: v.id, orden: v.orden, visible: v.visible, created_at: v.created_at,
  datos: Object.fromEntries(DEL_VIDEO.map((k) => [k, v[k] ?? ''])) });

export async function listar() {
  if (DEMO) return EJEMPLOS.slice().sort((a, b) => a.orden - b.orden).map((v) => ({ ...v }));
  const { data, error } = await supabaseR4.rpc('portafolio_admin');
  if (error) throw error;
  return data;
}

export const listarVideos = async () => (await listar()).map(comoFila);

// agrega (sin id) o cambia un video; devuelve su id
export async function guardarVideo({ id = null, datos: v, visible = true }) {
  if (DEMO) {
    const repetido = EJEMPLOS.find((x) => x.codigo === v.codigo && x.id !== id);
    if (repetido) throw Object.assign(new Error('repetido'), { code: '23505' });
    const datos = { ...v, tipo: v.tipo || null, descripcion: v.descripcion || null, duracion: v.duracion || null, portada: v.portada || null, visible };
    if (id) { Object.assign(EJEMPLOS.find((x) => x.id === id), datos); return id; }
    const nuevo = `e${EJEMPLOS.length + 1}-${v.codigo}`;
    EJEMPLOS.push({ ...datos, id: nuevo, orden: Math.max(0, ...EJEMPLOS.map((x) => x.orden)) + 1 });
    return nuevo;
  }
  const { data, error } = await supabaseR4.rpc('guardar_video', {
    p_id: id, p_enlace: v.codigo, p_titulo: v.titulo, p_etiqueta: v.etiqueta, p_tipo: v.tipo || null,
    p_descripcion: v.descripcion || null, p_duracion: v.duracion || null, p_portada: v.portada || null, p_visible: visible,
  });
  if (error) throw error;
  return data;
}

export async function mostrarVideos(ids, visible) {
  if (DEMO) { EJEMPLOS.forEach((x) => { if (ids.includes(x.id)) x.visible = visible; }); return; }
  const respuestas = await Promise.all(ids.map((id) => supabaseR4.rpc('mostrar_video', { p_id: id, p_visible: visible })));
  const conError = respuestas.find((r) => r.error);
  if (conError) throw conError.error;
}

export async function ordenarVideos(ids) {
  if (DEMO) { ids.forEach((id, k) => { const v = EJEMPLOS.find((x) => x.id === id); if (v) v.orden = k + 1; }); return; }
  const { error } = await supabaseR4.rpc('ordenar_portafolio', { p_ids: ids });
  if (error) throw error;
}

// los saca del portafolio (los videos siguen en Instagram)
export async function borrarVideos(ids) {
  if (DEMO) { ids.forEach((id) => { const k = EJEMPLOS.findIndex((x) => x.id === id); if (k >= 0) EJEMPLOS.splice(k, 1); }); return; }
  const respuestas = await Promise.all(ids.map((id) => supabaseR4.rpc('quitar_video', { p_id: id })));
  const conError = respuestas.find((r) => r.error);
  if (conError) throw conError.error;
}

// ── Imágenes ────────────────────────────────────────────────────────────────────────────────────────────────

const PORTADAS = 'portafolio';
const IMAGENES = 'contenido';

const lienzoA = (lienzo) => {
  const hacer = (tipo, calidad) => new Promise((ok) => lienzo.toBlob(ok, tipo, calidad));
  return hacer('image/webp', 0.84).then((webp) => (webp?.type === 'image/webp' ? webp : hacer('image/jpeg', 0.86)));
};

const abrirImagen = (archivo) => new Promise((ok, mal) => {
  const url = URL.createObjectURL(archivo);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); ok(img); };
  img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('Esa imagen no se pudo abrir aquí: usa una JPG, PNG o WebP.')); };
  img.src = url;
});

// recorta al centro una imagen o el cuadro de un video a 9:16 y la deja en 540x960 (las portadas del portafolio)
export async function recortar(fuente, ancho, alto) {
  const lienzo = document.createElement('canvas');
  lienzo.width = 540;
  lienzo.height = 960;
  const escala = Math.max(540 / ancho, 960 / alto);
  const w = ancho * escala;
  const h = alto * escala;
  lienzo.getContext('2d').drawImage(fuente, (540 - w) / 2, (960 - h) / 2, w, h);
  return lienzoA(lienzo);
}

// una imagen cualquiera, sin recortar, con su lado mayor en `lado` px como mucho (capturas, fotos)
export async function reducirImagen(archivo, lado = 1600) {
  const img = await abrirImagen(archivo);
  const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(img.naturalWidth * escala);
  lienzo.height = Math.round(img.naturalHeight * escala);
  lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return lienzoA(lienzo);
}

export { abrirImagen };

const nombreNuevo = (base, blob) => `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
const limpio = (t) => (t || 'imagen').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'imagen';

async function subir(bucket, ruta, blob) {
  if (DEMO) return URL.createObjectURL(blob);
  const { error } = await supabaseR4.storage.from(bucket).upload(ruta, blob, { contentType: blob.type, cacheControl: '31536000' });
  if (error) throw error;
  return supabaseR4.storage.from(bucket).getPublicUrl(ruta).data.publicUrl;
}

// sube la portada de un video y devuelve su enlace público
export const subirPortada = (blob, codigo) => subir(PORTADAS, nombreNuevo(limpio(codigo), blob), blob);

// sube una imagen del contenido (carpeta: la sección, y la app en las capturas) y devuelve su enlace público
export const subirImagen = (blob, carpeta, nombre) => subir(IMAGENES, `${carpeta.split('/').map(limpio).join('/')}/${nombreNuevo(limpio(nombre), blob)}`, blob);

// borra una imagen subida por el panel; las de /img/… vienen con la web y no se tocan
export async function borrarImagen(enlace) {
  if (DEMO || typeof enlace !== 'string') return;
  for (const bucket of [PORTADAS, IMAGENES]) {
    const ruta = enlace.split(`/object/public/${bucket}/`)[1];
    if (ruta) {
      const { error } = await supabaseR4.storage.from(bucket).remove([decodeURIComponent(ruta)]);
      if (error) throw error;
      return;
    }
  }
}
export const borrarPortada = borrarImagen;
export const esDelPanel = (enlace) => typeof enlace === 'string' && /\/object\/public\/(portafolio|contenido)\//.test(enlace);

// ── El equipo ───────────────────────────────────────────────────────────────────────────────────────────────

const EQUIPO_DEMO = DEMO ? [
  { id: 'demo', correo: 'demo@ejemplo.com', rol: 'admin', creado: '2026-10-01T12:00:00Z', ultimo_acceso: new Date().toISOString() },
  { id: 'u2', correo: 'ventas@ejemplo.com', rol: 'ventas', creado: '2026-10-20T12:00:00Z', ultimo_acceso: '2026-11-03T15:00:00Z' },
  { id: 'u3', correo: 'r4@ejemplo.com', rol: 'lectura', creado: '2026-10-25T12:00:00Z', ultimo_acceso: null },
] : [];

export async function listarEquipo() {
  if (DEMO) return EQUIPO_DEMO.map((u) => ({ ...u }));
  const { data, error } = await supabaseR4.rpc('equipo_admin');
  if (error) throw error;
  return data;
}

export async function cambiarRol(id, rol) {
  if (DEMO) { EQUIPO_DEMO.find((u) => u.id === id).rol = rol; return; }
  const { error } = await supabaseR4.rpc('cambiar_rol', { p_id: id, p_rol: rol });
  if (error) throw error;
}

// ── Para el resumen ─────────────────────────────────────────────────────────────────────────────────────────

// leads sin contactar todavía; null si no se pudo saber
export async function leadsNuevos() {
  if (DEMO) return LEADS_DEMO.filter((l) => l.estado === 'nuevo').length;
  const { count, error } = await supabaseR4.rpc('ver_leads', undefined, { count: 'exact', head: true }).eq('estado', 'nuevo');
  return error ? null : count;
}
