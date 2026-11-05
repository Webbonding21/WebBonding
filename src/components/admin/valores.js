// Lo que comparten los campos y el editor del panel /admin, sin componentes: las imágenes que esperan a subirse
// ({ blob, url, nombre }), las claves de las listas mientras se editan y los códigos que salen de un nombre.
export const pendiente = (v) => Boolean(v && typeof v === 'object' && v.blob);
export const srcDe = (v) => (pendiente(v) ? v.url : v || '');

let claves = 0;
export const clave = () => { claves += 1; return `k${claves}`; };

// «Mi App Nueva» → «mi-app-nueva»
export const aCodigo = (t) => (t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
