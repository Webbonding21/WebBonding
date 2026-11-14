// Dónde viven los PDF: el bucket privado «firmas» de Supabase Storage, con la clave del servidor. En pruebas locales
// (FIRMAS_LOCAL_DIR) van a una carpeta del disco.
import { env } from './entorno.ts';

const BUCKET = 'firmas';
const local = () => env('FIRMAS_LOCAL_DIR');

function cabeceras(extra: Record<string, string> = {}) {
  const clave = env('SUPABASE_SERVICE_ROLE_KEY')!;
  return { authorization: `Bearer ${clave}`, apikey: clave, ...extra };
}
const url = (ruta: string) => `${env('SUPABASE_URL')}/storage/v1/object/${BUCKET}/${ruta}`;

export async function guardar(ruta: string, bytes: Uint8Array, tipo = 'application/pdf') {
  if (local()) {
    const fs = await import('node:fs/promises');
    const p = `${local()}/almacen/${ruta}`;
    await fs.mkdir(p.slice(0, p.lastIndexOf('/')), { recursive: true });
    await fs.writeFile(p, bytes, { flag: 'wx' }); // nunca encima de otro
    return;
  }
  const r = await fetch(url(ruta), { method: 'POST', headers: cabeceras({ 'content-type': tipo, 'x-upsert': 'false' }), body: bytes });
  if (!r.ok) throw new Error(`No se pudo guardar el archivo (${r.status}): ${await r.text()}`);
}

export async function leer(ruta: string): Promise<Uint8Array> {
  if (local()) {
    const fs = await import('node:fs/promises');
    return new Uint8Array(await fs.readFile(`${local()}/almacen/${ruta}`));
  }
  const r = await fetch(url(ruta), { headers: cabeceras() });
  if (!r.ok) throw new Error(`No se pudo leer el archivo (${r.status})`);
  return new Uint8Array(await r.arrayBuffer());
}

export async function borrar(rutas: string[]) {
  if (!rutas.length) return;
  if (local()) {
    const fs = await import('node:fs/promises');
    await Promise.all(rutas.map((r) => fs.rm(`${local()}/almacen/${r}`, { force: true })));
    return;
  }
  const r = await fetch(`${env('SUPABASE_URL')}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE', headers: cabeceras({ 'content-type': 'application/json' }), body: JSON.stringify({ prefixes: rutas }),
  });
  if (!r.ok) throw new Error(`No se pudo borrar (${r.status})`);
}
