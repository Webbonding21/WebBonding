// src/lib/privacidad.js
// Todo lo del sitio que toca datos personales: la versión de la política, la elección de cookies y el guardado
// de los leads del formulario de /crea-tu-app.

// Fecha de la política de /privacidad. Si la política cambia, se cambia aquí: cada lead guarda la versión que
// aceptó y el aviso de cookies vuelve a salir para quien eligió con una versión anterior.
export const VERSION_POLITICA = '2026-10-26';

// ── Cookies ─────────────────────────────────────────────────────────────────────────────────────────────────
// Hoy el sitio no usa cookies de medición ni de publicidad. Si se agrega el píxel de Meta o Google Analytics,
// se carga solo cuando cookiesAceptadas() da true (o al llegar el evento 'wb:cookies' con 'aceptadas').
const CLAVE_COOKIES = 'wb_cookies';

// 'aceptadas' | 'rechazadas' | null (todavía no eligió, o eligió con otra versión de la política)
export function eleccionCookies() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE_COOKIES));
    return g?.version === VERSION_POLITICA ? g.eleccion : null;
  } catch {
    return null;
  }
}

export const cookiesAceptadas = () => eleccionCookies() === 'aceptadas';

export function guardarEleccionCookies(eleccion) {
  try {
    localStorage.setItem(CLAVE_COOKIES, JSON.stringify({ eleccion, version: VERSION_POLITICA, fecha: new Date().toISOString() }));
  } catch { /* sin almacenamiento (modo privado): se vuelve a preguntar en la próxima visita */ }
  window.dispatchEvent(new CustomEvent('wb:cookies', { detail: eleccion }));
}

// desde /privacidad: vuelve a mostrar el aviso para cambiar la elección
export const abrirAvisoCookies = () => window.dispatchEvent(new Event('wb:cookies-abrir'));

// ── Leads ───────────────────────────────────────────────────────────────────────────────────────────────────
// Van al proyecto Supabase de R4 (el mismo de /r4apertura), al esquema web_bonding. Con la clave pública solo se
// puede llamar crear_lead(), que guarda y no devuelve nada: nadie puede leer los leads desde el sitio.
// La tabla y la función están en supabase/leads.sql.
const URL_R4 = import.meta.env.VITE_R4_SUPABASE_URL;
const CLAVE_R4 = import.meta.env.VITE_R4_SUPABASE_ANON_KEY;
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

export async function guardarLead({ tipo, nombre, telefono, correo, adicional, acepta, novedades }) {
  if (!URL_R4 || !CLAVE_R4) throw new Error('falta la configuración de Supabase');
  const q = new URLSearchParams(window.location.search);
  const r = await fetch(`${URL_R4}/rest/v1/rpc/crear_lead`, {
    method: 'POST',
    headers: { apikey: CLAVE_R4, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_tipo: tipo,
      p_nombre: nombre.trim(),
      p_telefono: telefono.trim(),
      p_correo: correo.trim(),
      p_adicional: adicional.trim() || null,
      p_acepta_privacidad: acepta,
      p_acepta_novedades: novedades,
      p_version_politica: VERSION_POLITICA,
      p_pagina: window.location.pathname,
      ...Object.fromEntries(UTM.map((u) => [`p_${u}`, q.get(u)])),
    }),
  });
  if (!r.ok) throw new Error(`crear_lead respondió ${r.status}`);
}
