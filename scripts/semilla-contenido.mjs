// scripts/semilla-contenido.mjs
// Escribe supabase/contenido-semilla.sql con lo que la web trae en el código (src/data/sitio.js, apps.js y catalog.js),
// para llenar web_bonding.contenido la primera vez. Cada sección entra solo si está vacía en la base, así que aplicarlo
// de nuevo no pisa lo que ya se cambió en /admin.
//    node scripts/semilla-contenido.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CIFRAS, PALABRAS, SERVICIOS, PILARES, PASOS, PROYECTOS, PLANES, PREGUNTAS } from '../src/data/sitio.js';
import APPS from '../src/data/apps.js';
import { CATALOGO_BASE, HOURLY_RATE_USD } from '../src/data/catalog.js';

const SECCIONES = {
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

const json = (o) => {
  const t = JSON.stringify(o);
  if (t.includes('$wb$')) throw new Error('el texto trae $wb$');
  return `$wb$${t}$wb$::jsonb`;
};

const partes = [
  '-- supabase/contenido-semilla.sql',
  '-- Lo generó scripts/semilla-contenido.mjs con lo que la web traía en el código. Va después de admin.sql. Cada sección',
  '-- entra solo si está vacía, así que correrlo de nuevo no pisa lo que ya se cambió en /admin.',
  '',
];
for (const [seccion, lista] of Object.entries(SECCIONES)) {
  const filas = lista.map((d, i) => `  (${json(d)}, ${i + 1})`).join(',\n');
  partes.push(
    `-- ${seccion}: ${lista.length}`,
    'insert into web_bonding.contenido (seccion, datos, orden)',
    `select '${seccion}', v.datos, v.orden from (values`,
    filas,
    ') as v(datos, orden)',
    `where not exists (select 1 from web_bonding.contenido c where c.seccion = '${seccion}');`,
    '',
  );
}

const destino = fileURLToPath(new URL('../supabase/contenido-semilla.sql', import.meta.url));
writeFileSync(destino, partes.join('\n'));
console.log(Object.entries(SECCIONES).map(([s, l]) => `${s} ${l.length}`).join(' · '), '→', destino);
