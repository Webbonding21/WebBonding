// La firma electrónica de contratos (/firmar y /admin/contratos). Todo pasa por la función de Supabase «firmas»
// (supabase/functions/firmas): la página nunca toca las tablas ni los PDF directo. En desarrollo, VITE_FIRMAS_URL apunta a
// la función corriendo en local (ver supabase/functions/firmas/LEEME.md).
import { supabaseR4 } from '../components/r4/r4Api';

export const FIRMAS_URL = import.meta.env.VITE_FIRMAS_URL || `${import.meta.env.VITE_R4_SUPABASE_URL}/functions/v1/firmas`;
const ANON = import.meta.env.VITE_R4_SUPABASE_ANON_KEY;
const DEMO = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');

async function respuesta(r) {
  if (r.ok) return r;
  let m = '';
  try { m = (await r.json()).error; } catch { /* sin cuerpo */ }
  const e = new Error(m || (r.status >= 500 ? 'Algo falló en el servidor. Intenta de nuevo en un momento.' : `Error ${r.status}`));
  e.estado = r.status;
  throw e;
}

async function llamar(cuerpo, { admin = false, formulario = null, crudo = false } = {}) {
  const headers = { apikey: ANON };
  if (admin) {
    if (DEMO) headers.authorization = 'Bearer demo-admin';
    else {
      const { data } = await supabaseR4.auth.getSession();
      headers.authorization = `Bearer ${data.session?.access_token ?? ''}`;
    }
  }
  let body;
  if (formulario) { formulario.set('datos', JSON.stringify(cuerpo)); body = formulario; } else {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(cuerpo);
  }
  let r;
  try { r = await fetch(FIRMAS_URL, { method: 'POST', headers, body }); } catch {
    throw new Error('No hay conexión. Revisa tu internet y vuelve a intentar.');
  }
  await respuesta(r);
  return crudo ? r : r.json();
}

// ── El firmante ──
export const verSobre = (token) => llamar({ accion: 'ver', token });
export const pedirCodigo = (token, cedula, canal) => llamar({ accion: 'codigo', token, cedula, canal });
export const firmar = (datos) => llamar({ accion: 'firmar', ...datos });
export const rechazar = (token, motivo) => llamar({ accion: 'rechazar', token, motivo });
export const verificar = (sha256) => llamar({ accion: 'verificar', sha256 });
export const enlaceDocumento = (token, doc) => `${FIRMAS_URL}?accion=documento&token=${token}&doc=${doc}`;

// ── El panel ──
export const listarSobres = () => llamar({ accion: 'listar' }, { admin: true });
export const detalleSobre = (id) => llamar({ accion: 'detalle', id }, { admin: true });
export const borrarSobre = (id) => llamar({ accion: 'borrar', id }, { admin: true });
export const enviarSobre = (id) => llamar({ accion: 'enviar', id }, { admin: true });
export const recordarFirmante = (id, firmante_id) => llamar({ accion: 'recordar', id, firmante_id }, { admin: true });
export const anularSobre = (id, motivo) => llamar({ accion: 'anular', id, motivo }, { admin: true });
export const cerrarSobre = (id) => llamar({ accion: 'cerrar', id }, { admin: true });

export function guardarSobre(datos, archivos = []) {
  const f = new FormData();
  archivos.forEach((a) => f.append('archivo', a.archivo, a.archivo.name));
  return llamar({ accion: 'guardar', ...datos, nombres: archivos.map((a) => a.nombre) }, { admin: true, formulario: f });
}

// baja un archivo del sobre (original, final o sello) con la sesión del panel
export async function bajarArchivo(id, cual) {
  const r = await llamar({ accion: 'archivo', id, cual }, { admin: true, crudo: true });
  const nombre = decodeURIComponent((r.headers.get('content-disposition') ?? '').split("''")[1] ?? 'documento.pdf');
  const url = URL.createObjectURL(await r.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function sha256Archivo(archivo) {
  const h = await crypto.subtle.digest('SHA-256', await archivo.arrayBuffer());
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const fechaHora = (iso) => (iso ? new Date(iso).toLocaleString('es-VE', {
  timeZone: 'America/Caracas', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
}) : '');
