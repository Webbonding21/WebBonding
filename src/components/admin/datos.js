// Consultas del panel /admin. Los videos del portafolio pasan por las funciones de supabase/portafolio.sql, que exigen el
// rol 'admin'; sus portadas van al bucket público «portafolio», recortadas a 540x960 en el navegador.
import { supabaseR4 } from '../r4/r4Api';
import { DEMO, EJEMPLOS } from '../../data/portafolio';

const BUCKET = 'portafolio';

// los errores de la base, en palabras del panel
export function mensajeDeError(err) {
  const m = err?.message ?? String(err);
  if (m === 'No autorizado') return 'Tu usuario no puede cambiar el portafolio: hace falta el rol de administrador.';
  if (err?.code === '23505') return 'Ese video ya está en el portafolio.';
  if (err?.code === 'PGRST202' || /Could not find the function/i.test(m)) {
    return 'La base todavía no tiene el portafolio: falta aplicar supabase/portafolio.sql en Supabase.';
  }
  if (/titulo_check/.test(m)) return 'El título va de 1 a 80 letras.';
  if (/duracion_check/.test(m)) return 'La duración va como 1:34 (minutos y segundos).';
  if (/portada_check/.test(m)) return 'Esa portada no se puede usar: súbela de nuevo.';
  if (/fetch|network/i.test(m)) return 'No hay conexión con la base de datos.';
  return m;
}

export async function listar() {
  if (DEMO) return EJEMPLOS.slice().sort((a, b) => a.orden - b.orden).map((v) => ({ ...v }));
  const { data, error } = await supabaseR4.rpc('portafolio_admin');
  if (error) throw error;
  return data;
}

// agrega (sin id) o cambia un video; devuelve su id
export async function guardar(v) {
  if (DEMO) {
    const repetido = EJEMPLOS.find((x) => x.codigo === v.codigo && x.id !== v.id);
    if (repetido) throw Object.assign(new Error('repetido'), { code: '23505' });
    const datos = { ...v, tipo: v.tipo || null, descripcion: v.descripcion || null, duracion: v.duracion || null };
    if (v.id) { Object.assign(EJEMPLOS.find((x) => x.id === v.id), datos); return v.id; }
    const id = `e${EJEMPLOS.length + 1}-${v.codigo}`;
    EJEMPLOS.push({ ...datos, id, orden: Math.max(0, ...EJEMPLOS.map((x) => x.orden)) + 1 });
    return id;
  }
  const { data, error } = await supabaseR4.rpc('guardar_video', {
    p_id: v.id ?? null, p_enlace: v.codigo, p_titulo: v.titulo, p_etiqueta: v.etiqueta, p_tipo: v.tipo || null,
    p_descripcion: v.descripcion || null, p_duracion: v.duracion || null, p_portada: v.portada || null, p_visible: v.visible,
  });
  if (error) throw error;
  return data;
}

export async function mostrar(id, visible) {
  if (DEMO) { EJEMPLOS.find((x) => x.id === id).visible = visible; return; }
  const { error } = await supabaseR4.rpc('mostrar_video', { p_id: id, p_visible: visible });
  if (error) throw error;
}

// los ids en el orden en que salen en la página
export async function ordenar(ids) {
  if (DEMO) { ids.forEach((id, k) => { EJEMPLOS.find((x) => x.id === id).orden = k + 1; }); return; }
  const { error } = await supabaseR4.rpc('ordenar_portafolio', { p_ids: ids });
  if (error) throw error;
}

// lo saca del portafolio (el video sigue en Instagram) y borra su portada del bucket
export async function quitar(v) {
  if (DEMO) { EJEMPLOS.splice(EJEMPLOS.findIndex((x) => x.id === v.id), 1); return; }
  const { error } = await supabaseR4.rpc('quitar_video', { p_id: v.id });
  if (error) throw error;
  await borrarPortada(v.portada).catch(() => {});
}

// ── Portadas ────────────────────────────────────────────────────────────────────────────────────────────────

// recorta al centro una imagen o el cuadro de un video a 9:16 y la deja en 540x960 (webp; jpg donde el navegador no
// sabe hacer webp)
export async function recortar(fuente, ancho, alto) {
  const lienzo = document.createElement('canvas');
  lienzo.width = 540;
  lienzo.height = 960;
  const escala = Math.max(540 / ancho, 960 / alto);
  const w = ancho * escala;
  const h = alto * escala;
  lienzo.getContext('2d').drawImage(fuente, (540 - w) / 2, (960 - h) / 2, w, h);
  const hacer = (tipo, calidad) => new Promise((ok) => lienzo.toBlob(ok, tipo, calidad));
  const webp = await hacer('image/webp', 0.82);
  return webp?.type === 'image/webp' ? webp : hacer('image/jpeg', 0.85);
}

// sube la portada con un nombre nuevo (así nunca se reemplaza una que esté en uso) y devuelve su enlace público
export async function subirPortada(blob, codigo) {
  if (DEMO) return URL.createObjectURL(blob);
  const nombre = `${codigo}-${Date.now().toString(36)}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
  const { error } = await supabaseR4.storage.from(BUCKET).upload(nombre, blob, { contentType: blob.type, cacheControl: '31536000' });
  if (error) throw error;
  return supabaseR4.storage.from(BUCKET).getPublicUrl(nombre).data.publicUrl;
}

// solo las del bucket: las de /img/portafolio vienen con la web
export async function borrarPortada(enlace) {
  const nombre = enlace?.split(`/object/public/${BUCKET}/`)[1];
  if (DEMO || !nombre) return;
  const { error } = await supabaseR4.storage.from(BUCKET).remove([nombre]);
  if (error) throw error;
}

// ── El resumen del panel ────────────────────────────────────────────────────────────────────────────────────

// leads sin contactar todavía (para la tarjeta de Leads); null si no se pudo saber
export async function leadsNuevos() {
  if (DEMO) return 8;
  const { count, error } = await supabaseR4.rpc('ver_leads', undefined, { count: 'exact', head: true }).eq('estado', 'nuevo');
  return error ? null : count;
}
