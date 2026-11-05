// src/data/portafolio.js
// Los videos de /portafolio. Cada uno es una publicación de Instagram (reel o post) que la página muestra embebida y que se
// reproduce desde Instagram: aquí no se sube ningún video. La lista vive en Supabase (web_bonding.portafolio, en el mismo
// proyecto de los leads; ver supabase/portafolio.sql) y Williams la llena en /admin/portafolio, pegando el enlace de cada
// uno. La página solo puede llamar ver_portafolio(), que devuelve los visibles en su orden.
const URL_R4 = import.meta.env.VITE_R4_SUPABASE_URL;
const CLAVE_R4 = import.meta.env.VITE_R4_SUPABASE_ANON_KEY;

// el código de la publicación, del enlace tal cual lo comparte Instagram (…/reel/<código>/?igsh=…, …/p/<código>/) o
// escrito solo; null si no lo es
export function codigoDe(enlace) {
  const t = (enlace ?? '').trim();
  const c = t.match(/\/(?:reels?|p|tv)\/([\w-]+)/)?.[1] ?? t;
  return /^[\w-]{5,64}$/.test(c) ? c : null;
}

// lo que muestra cada video. «App + video» es el Plus hecho (la app y el reel, del mismo equipo) y sale también en esa
// sección de la página.
export const PLUS = 'App + video';
export const ETIQUETAS = [
  { valor: PLUS, t: 'Una app nuestra y el reel que la cuenta. Sale también en el Plus.' },
  { valor: 'Reel', t: 'Un reel para una marca o un negocio.' },
  { valor: 'Anuncio', t: 'Un video hecho para pautar.' },
  { valor: 'Testimonio', t: 'Un cliente cuenta cómo le fue.' },
];

// solo en desarrollo: /portafolio?demo y /admin?demo usan estos, sin la base. Los cambios del panel duran hasta recargar.
export const DEMO = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo');
export const EJEMPLOS = DEMO ? [
  { id: 'e1', codigo: 'DfUxMfRvkuR', titulo: 'Revísalo', tipo: 'Reel · Haciendo una app por día, Día 1', etiqueta: PLUS, duracion: '1:34',
    descripcion: 'Para revisar un carro usado antes de comprarlo: la app te guía punto por punto y te dice si te están pidiendo de más. La hicimos en un día y la contamos en este reel.',
    portada: '/img/portafolio/una-app-por-dia-1.webp', orden: 1, visible: true },
  { id: 'e2', codigo: 'EjemploSinPortada', titulo: 'Ejemplo sin portada', tipo: 'Ejemplo del modo demo', etiqueta: 'Reel', duracion: null,
    descripcion: 'Un video sin portada: la tarjeta muestra su título.', portada: null, orden: 2, visible: true },
  { id: 'e3', codigo: 'EjemploOculto', titulo: 'Ejemplo oculto', tipo: null, etiqueta: 'Anuncio', duracion: '0:30', descripcion: null,
    portada: null, orden: 3, visible: false },
] : [];

export async function cargarVideos() {
  if (DEMO) return EJEMPLOS.filter((v) => v.visible).sort((a, b) => a.orden - b.orden).map((v) => ({ ...v }));
  if (!URL_R4 || !CLAVE_R4) throw new Error('falta la configuración de Supabase');
  const r = await fetch(`${URL_R4}/rest/v1/rpc/ver_portafolio`, {
    method: 'POST',
    headers: { apikey: CLAVE_R4, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!r.ok) throw new Error(`ver_portafolio respondió ${r.status}`);
  return r.json();
}
