// Función de Supabase «firmas»: todo lo de webbonding.net/firmar pasa por aquí, con la conexión del servidor a la base
// (supabase/firmas.sql) y el bucket privado «firmas».
//
// Para el firmante (con su enlace /firmar/<token>, sin usuario):
//   ver · documento (GET, el PDF) · codigo (pide el código de un solo uso) · firmar · rechazar
// Para cualquiera: verificar (¿este resumen SHA-256 es de un documento firmado aquí?)
// Para el panel (usuario del equipo con rol 'admin'): listar · detalle · guardar (multipart) · borrar · enviar · recordar ·
//   anular · archivo · cerrar
import postgres from 'npm:postgres@3.4.5';
import { armarFinal, contarPaginas } from './pdf.ts';
import { sellar } from './sello.ts';
import * as avisos from './avisos.ts';
import * as almacen from './almacen.ts';
import {
  env, sha256, base64, horaVE, enlaceFirma, ocultarCorreo, ocultarCedula, ocultarTelefono, soloDigitos,
} from './entorno.ts';

// deno-lint-ignore no-explicit-any
type Fila = Record<string, any>;

let _sql: ReturnType<typeof postgres> | null = null;
const db = () => (_sql ??= postgres(env('SUPABASE_DB_URL')!, { prepare: false, max: 3, idle_timeout: 20 }));

export const CONSENTIMIENTO_VERSION = '2026-11-14';
export const CONSENTIMIENTO = 'Leí los documentos de este sobre y acepto firmarlos con firma electrónica. Reconozco que esta firma me identifica, que la hago yo con un código que solo yo recibí y que tiene el mismo valor que mi firma autógrafa, según el Decreto-Ley sobre Mensajes de Datos y Firmas Electrónicas.';
const VIDA_CODIGO_MIN = 10;
const MAX_FALLOS = 5;
const MAX_CODIGOS_HORA = 3;

class Fallo extends Error {
  estado: number;
  constructor(estado: number, mensaje: string) { super(mensaje); this.estado = estado; }
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-expose-headers': 'content-disposition',
};
const json = (datos: unknown, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { ...CORS, 'content-type': 'application/json; charset=utf-8' } });
const archivoPdf = (bytes: Uint8Array, nombre: string, tipo = 'application/pdf', descargar = false) => new Response(bytes, {
  headers: {
    ...CORS, 'content-type': tipo, 'cache-control': 'private, no-store',
    'content-disposition': `${descargar ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(nombre)}`,
  },
});

type Ctx = { ip: string | null; agente: string | null };
function contexto(req: Request): Ctx {
  const h = req.headers;
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('cf-connecting-ip') || h.get('x-real-ip') || null;
  return { ip, agente: (h.get('user-agent') ?? '').slice(0, 400) || null };
}

// ── Entrada ──────────────────────────────────────────────────────────────────────────────────────────────────
export async function manejar(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const ctx = contexto(req);
  try {
    const url = new URL(req.url);
    if (req.method === 'GET') {
      const accion = url.searchParams.get('accion');
      if (accion === 'documento') return await documento(url.searchParams.get('token') ?? '', url.searchParams.get('doc') ?? '', ctx);
      return json({ ok: true, servicio: 'firmas' });
    }
    const multipart = (req.headers.get('content-type') ?? '').startsWith('multipart/form-data');
    let cuerpo: Fila; let formulario: FormData | null = null;
    if (multipart) { formulario = await req.formData(); cuerpo = JSON.parse(String(formulario.get('datos') ?? '{}')); } else { cuerpo = await req.json().catch(() => ({})); }
    const accion = String(cuerpo.accion ?? '');

    const publicas: Record<string, (c: Fila, x: Ctx) => Promise<unknown>> = { ver, codigo, firmar, rechazar, verificar };
    if (publicas[accion]) return json(await publicas[accion](cuerpo, ctx));

    const admin = await quienAdmin(req);
    const privadas: Record<string, (c: Fila, x: Ctx & { admin: Fila }, f: FormData | null) => Promise<unknown>> = {
      listar, detalle, guardar, borrar, enviar, recordar, anular, cerrar: cerrarAdmin,
    };
    if (accion === 'archivo') return await archivo(cuerpo, admin);
    if (privadas[accion]) return json(await privadas[accion](cuerpo, { ...ctx, admin }, formulario));
    throw new Fallo(400, 'Acción desconocida');
  } catch (e) {
    if (e instanceof Fallo) return json({ error: e.message }, e.estado);
    console.error(e);
    const m = (e as Error).message ?? '';
    if (/firma_sobres_codigo_key/.test(m)) return json({ error: 'Ya hay un sobre con ese código.' }, 409);
    if (/cedula_check/.test(m)) return json({ error: 'Revisa las cédulas: van como V-12.345.678.' }, 400);
    if (/correo_check/.test(m)) return json({ error: 'Revisa los correos de los firmantes.' }, 400);
    if (/telefono_check/.test(m)) return json({ error: 'Revisa los teléfonos: van como +58 412 1234567.' }, 400);
    if (/codigo_check/.test(m)) return json({ error: 'El código va en mayúsculas, números y guiones (WB-VGO-001).' }, 400);
    if (/42501/.test((e as Fila).code ?? '') || /no se cambia|no se borra|no se quitan/.test(m)) return json({ error: m }, 409);
    return json({ error: 'Algo falló en el servidor. Intenta de nuevo en un momento.' }, 500);
  }
}

// ── Quién es del equipo ──────────────────────────────────────────────────────────────────────────────────────
async function quienAdmin(req: Request): Promise<Fila> {
  const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) throw new Fallo(401, 'Entra con tu usuario del equipo.');
  if (env('FIRMAS_LOCAL_DIR') && jwt === 'demo-admin') return { id: null, correo: 'demo@ejemplo.com' };
  const r = await fetch(`${env('SUPABASE_URL')}/auth/v1/user`, {
    headers: { authorization: `Bearer ${jwt}`, apikey: env('SUPABASE_ANON_KEY') ?? env('SUPABASE_SERVICE_ROLE_KEY')! },
  });
  if (!r.ok) throw new Fallo(401, 'Tu sesión venció: entra de nuevo.');
  const u = await r.json();
  const [p] = await db()`select rol from public.perfiles where id = ${u.id}`;
  if (p?.rol !== 'admin') throw new Fallo(403, 'Los contratos solo los maneja un administrador.');
  return { id: u.id, correo: u.email };
}

// ── La bitácora ──────────────────────────────────────────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function registrar(sql: any, sobre: string, firmante: string | null, tipo: string, detalle: Fila, ctx: Partial<Ctx> = {}) {
  const [e] = await sql`
    insert into web_bonding.firma_eventos (sobre_id, firmante_id, tipo, detalle, ip, agente)
    values (${sobre}, ${firmante}, ${tipo}, ${sql.json(detalle)}, ${ctx.ip ?? null}, ${ctx.agente ?? null})
    returning id, hash, creado_en`;
  return e as { id: string; hash: string; creado_en: Date };
}

export function describir(e: Fila, nombres: Record<string, string>) {
  const d = e.detalle ?? {};
  const quien = e.firmante_id ? (nombres[e.firmante_id] ?? 'Firmante') : `Web Bonding${d.usuario ? ` (${d.usuario})` : ''}`;
  const textos: Record<string, string> = {
    enviado: `Se envió el sobre a firmar (${d.documentos?.length ?? 0} documentos, ${d.firmantes?.length ?? 0} firmantes)`,
    invitado: `Se envió el enlace de firma a ${d.correo ?? 'su correo'}`,
    recordatorio: `Se reenvió el enlace de firma a ${d.correo ?? 'su correo'}`,
    abierto: 'Abrió su enlace de firma',
    documento: `Abrió «${d.nombre ?? 'un documento'}»`,
    cedula_incorrecta: 'Escribió una cédula que no coincide',
    codigo_enviado: `Pidió un código de un solo uso (${d.canal === 'whatsapp' ? 'WhatsApp' : 'correo'} ${d.destino ?? ''})`.trim(),
    codigo_fallido: 'Escribió un código incorrecto',
    firmado: 'Firmó los documentos del sobre',
    sello_firma: `Sello de tiempo RFC 3161 de su firma (${d.tsa ?? ''}${d.hora ? `, ${horaVE(d.hora)}` : ''})`,
    rechazado: `No aceptó firmar${d.motivo ? `: ${d.motivo}` : ''}`,
    anulado: `Se anuló el sobre${d.motivo ? `: ${d.motivo}` : ''}`,
    cierre_fallido: 'No se pudo cerrar el documento: se reintenta',
    completado: 'Firmaron todos: se cerró el documento y se selló',
  };
  return { texto: textos[e.tipo] ?? e.tipo, quien };
}

// ── El firmante con su enlace ────────────────────────────────────────────────────────────────────────────────
async function porToken(token: string) {
  if (!/^[0-9a-f]{64}$/.test(token ?? '')) throw new Fallo(404, 'Este enlace no existe o ya no sirve.');
  const [f] = await db()`
    select f.*, s.codigo as s_codigo, s.titulo as s_titulo, s.mensaje as s_mensaje, s.estado as s_estado,
           s.en_orden as s_en_orden, s.completado_en as s_completado_en, s.final_ruta as s_final_ruta, s.id as s_id
    from web_bonding.firma_firmantes f join web_bonding.firma_sobres s on s.id = f.sobre_id
    where f.token = ${token}`;
  if (!f || f.s_estado === 'borrador') throw new Fallo(404, 'Este enlace no existe o ya no sirve.');
  return f;
}

async function firmantesDe(sobre: string) {
  return await db()`select * from web_bonding.firma_firmantes where sobre_id = ${sobre} order by orden, nombre`;
}
async function documentosDe(sobre: string) {
  return await db()`select * from web_bonding.firma_documentos where sobre_id = ${sobre} order by orden, subido_en`;
}

// le toca si el sobre está abierto, no firmó ni rechazó y (si van en orden) firmaron todos los de antes
function turno(f: Fila, todos: Fila[]) {
  if (f.s_estado !== 'enviado' || f.estado === 'firmado' || f.estado === 'rechazado') return { toca: false, antes: null };
  if (!f.s_en_orden) return { toca: true, antes: null };
  const antes = todos.find((x) => x.orden < f.orden && x.estado !== 'firmado');
  return { toca: !antes, antes: antes?.nombre ?? null };
}

async function ver(c: Fila, ctx: Ctx) {
  const f = await porToken(c.token);
  const [todos, docs] = await Promise.all([firmantesDe(f.sobre_id), documentosDe(f.sobre_id)]);
  const { toca, antes } = turno(f, todos);
  if (f.s_estado === 'enviado' && f.estado === 'pendiente') {
    await db().begin(async (tx) => {
      await tx`update web_bonding.firma_firmantes set estado = 'visto', visto_en = now() where id = ${f.id} and estado = 'pendiente'`;
      await registrar(tx, f.sobre_id, f.id, 'abierto', {}, ctx);
    });
  }
  return {
    sobre: { codigo: f.s_codigo, titulo: f.s_titulo, mensaje: f.s_mensaje, estado: f.s_estado, en_orden: f.s_en_orden, completado_en: f.s_completado_en, final: Boolean(f.s_final_ruta) },
    yo: {
      nombre: f.nombre, caracter: f.caracter, estado: f.estado === 'pendiente' && f.s_estado === 'enviado' ? 'visto' : f.estado,
      cedula: ocultarCedula(f.cedula), correo: ocultarCorreo(f.correo), telefono: f.telefono ? ocultarTelefono(f.telefono) : null,
      firmado_en: f.firmado_en, toca, antes,
    },
    firmantes: todos.map((x) => ({ nombre: x.nombre, caracter: x.caracter, estado: x.estado, firmado_en: x.firmado_en, yo: x.id === f.id })),
    documentos: docs.map((d) => ({ id: d.id, nombre: d.nombre, paginas: d.paginas, sha256: d.sha256 })),
    canales: avisos.canales().filter((k) => k !== 'whatsapp' || f.telefono),
    consentimiento: CONSENTIMIENTO,
  };
}

async function documento(token: string, doc: string, ctx: Ctx) {
  const f = await porToken(token);
  if (doc === 'final') {
    if (!f.s_final_ruta) throw new Fallo(404, 'El documento firmado todavía no está listo.');
    return archivoPdf(await almacen.leer(f.s_final_ruta), `${f.s_codigo} - ${f.s_titulo} (firmado).pdf`);
  }
  const [d] = await db()`select * from web_bonding.firma_documentos where id = ${/^[0-9a-f-]{36}$/.test(doc) ? doc : null} and sobre_id = ${f.sobre_id}`;
  if (!d) throw new Fallo(404, 'Ese documento no está en el sobre.');
  if (f.s_estado === 'enviado') {
    const [ya] = await db()`select 1 from web_bonding.firma_eventos where firmante_id = ${f.id} and tipo = 'documento' and detalle->>'documento' = ${d.id}`;
    if (!ya) await registrar(db(), f.sobre_id, f.id, 'documento', { documento: d.id, nombre: d.nombre }, ctx);
  }
  return archivoPdf(await almacen.leer(d.ruta), `${d.nombre}.pdf`);
}

async function revisarCedula(f: Fila, cedula: string, ctx: Ctx) {
  const [{ n }] = await db()`select count(*)::int as n from web_bonding.firma_eventos
    where firmante_id = ${f.id} and tipo = 'cedula_incorrecta' and creado_en > now() - interval '1 hour'`;
  if (n >= 5) throw new Fallo(429, 'Escribiste varias cédulas que no coinciden. Espera una hora o escríbele a Web Bonding.');
  if (soloDigitos(cedula) !== soloDigitos(f.cedula)) {
    await registrar(db(), f.sobre_id, f.id, 'cedula_incorrecta', {}, ctx);
    throw new Fallo(400, 'Esa cédula no coincide con la del firmante. Escríbela como está en tu cédula.');
  }
}

async function codigo(c: Fila, ctx: Ctx) {
  const f = await porToken(c.token);
  const todos = await firmantesDe(f.sobre_id);
  if (!turno(f, todos).toca) throw new Fallo(409, 'Ahora no te toca firmar este sobre.');
  await revisarCedula(f, c.cedula, ctx);
  const canal = c.canal === 'whatsapp' ? 'whatsapp' : 'correo';
  if (!avisos.canales().includes(canal) || (canal === 'whatsapp' && !f.telefono)) throw new Fallo(400, 'Ese medio no está disponible.');
  const recientes = (f.codigos_hora ?? []).filter((t: Date) => Date.now() - new Date(t).getTime() < 3600e3);
  if (recientes.length >= MAX_CODIGOS_HORA) throw new Fallo(429, 'Ya pediste 3 códigos en la última hora. Usa el último que te llegó o espera un rato.');

  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  const cod = String(n).padStart(6, '0');
  const destino = canal === 'correo' ? ocultarCorreo(f.correo) : ocultarTelefono(f.telefono);
  await db()`update web_bonding.firma_firmantes set
      codigo_hash = ${await sha256(`${f.id}:${cod}`)}, codigo_canal = ${canal},
      codigo_vence = now() + make_interval(mins => ${VIDA_CODIGO_MIN}), codigo_fallos = 0,
      codigos_hora = ${recientes}::timestamptz[] || now()
    where id = ${f.id}`;
  if (canal === 'correo') await avisos.enviarCorreo(avisos.correoCodigo({ codigo: f.s_codigo, titulo: f.s_titulo }, f, cod));
  else await avisos.enviarWhatsApp(f.telefono, cod);
  await registrar(db(), f.sobre_id, f.id, 'codigo_enviado', { canal, destino }, ctx);
  return { ok: true, canal, destino, vence_min: VIDA_CODIGO_MIN };
}

async function firmar(c: Fila, ctx: Ctx) {
  const f = await porToken(c.token);
  const todos = await firmantesDe(f.sobre_id);
  if (!turno(f, todos).toca) throw new Fallo(409, 'Ahora no te toca firmar este sobre.');
  if (c.acepto !== true) throw new Fallo(400, 'Falta que marques que aceptas firmar.');
  await revisarCedula(f, c.cedula, ctx);
  const docs = await documentosDe(f.sobre_id);
  const leidos = new Set(Array.isArray(c.leidos) ? c.leidos : []);
  if (docs.some((d) => !leidos.has(d.id))) throw new Fallo(400, 'Falta que abras y leas todos los documentos.');
  const trazo = String(c.trazo ?? '');
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]{200,}$/.test(trazo) || trazo.length > 300000) throw new Fallo(400, 'Falta tu firma dibujada.');

  // el código
  if (!f.codigo_hash || !f.codigo_vence) throw new Fallo(400, 'Primero pide tu código.');
  if (new Date(f.codigo_vence).getTime() < Date.now()) throw new Fallo(400, 'Ese código venció. Pide uno nuevo.');
  if (f.codigo_fallos >= MAX_FALLOS) throw new Fallo(400, 'Ese código ya no sirve. Pide uno nuevo.');
  const cod = soloDigitos(c.codigo);
  if (cod.length !== 6 || await sha256(`${f.id}:${cod}`) !== f.codigo_hash) {
    await db()`update web_bonding.firma_firmantes set codigo_fallos = codigo_fallos + 1 where id = ${f.id}`;
    await registrar(db(), f.sobre_id, f.id, 'codigo_fallido', {}, ctx);
    const quedan = MAX_FALLOS - f.codigo_fallos - 1;
    throw new Fallo(400, quedan > 0 ? `Ese código no es. Te quedan ${quedan} intento${quedan === 1 ? '' : 's'}.` : 'Ese código ya no sirve. Pide uno nuevo.');
  }

  const destino = f.codigo_canal === 'whatsapp' ? `su WhatsApp ${ocultarTelefono(f.telefono)}` : `su correo ${f.correo}`;
  const metodo = `Enlace personal enviado a ${f.correo}, cédula escrita por el firmante y código de un solo uso enviado a ${destino}`;
  const evento = await db().begin(async (tx) => {
    const e = await registrar(tx, f.sobre_id, f.id, 'firmado', {
      metodo, canal: f.codigo_canal,
      documentos: docs.map((d) => ({ nombre: d.nombre, sha256: d.sha256, paginas: d.paginas })),
      consentimiento: CONSENTIMIENTO, consentimiento_version: CONSENTIMIENTO_VERSION, trazo_sha256: await sha256(trazo),
    }, ctx);
    const r = await tx`update web_bonding.firma_firmantes set estado = 'firmado', firmado_en = ${e.creado_en}, firma_ip = ${ctx.ip},
        firma_agente = ${ctx.agente}, firma_metodo = ${metodo}, firma_trazo = ${trazo}, firma_evento = ${e.id},
        codigo_hash = null, codigo_vence = null
      where id = ${f.id} and estado <> 'firmado' returning id`;
    if (!r.length) throw new Fallo(409, 'Esta firma ya estaba hecha.');
    return e;
  });

  // el sello de tiempo de esta firma: un tercero da fe de la hora del evento (si no responde, la firma vale igual)
  try {
    const s = await sellar(evento.hash);
    await registrar(db(), f.sobre_id, f.id, 'sello_firma', { evento: Number(evento.id), resumen: evento.hash, tsa: s.tsa, hora: s.hora, tsr: base64(s.tsr) });
  } catch (e) { console.error('sello de la firma', e); }

  const ahora = await firmantesDe(f.sobre_id);
  const faltan = ahora.filter((x) => x.estado !== 'firmado').length;
  const sobre = { codigo: f.s_codigo, titulo: f.s_titulo, mensaje: f.s_mensaje };
  await avisos.enviarCorreo(avisos.correoAcuse(sobre, f, horaVE(evento.creado_en), faltan, enlaceFirma(f.token))).catch((e) => console.error('acuse', e));
  if (faltan === 0) {
    await cerrar(f.sobre_id).catch((e) => console.error('cierre', e));
  } else if (f.s_en_orden) {
    const siguiente = ahora.find((x) => x.estado !== 'firmado' && x.estado !== 'rechazado');
    if (siguiente && !siguiente.invitado_en) await invitar(f.sobre_id, siguiente, sobre, false, {}).catch((e) => console.error('invitar', e));
  }
  return { ok: true, firmado_en: evento.creado_en, faltan };
}

async function rechazar(c: Fila, ctx: Ctx) {
  const f = await porToken(c.token);
  if (f.s_estado !== 'enviado' || f.estado === 'firmado' || f.estado === 'rechazado') throw new Fallo(409, 'Este sobre ya no se puede rechazar.');
  const motivo = String(c.motivo ?? '').trim().slice(0, 500);
  await db().begin(async (tx) => {
    await tx`update web_bonding.firma_firmantes set estado = 'rechazado', rechazado_en = now(), motivo = ${motivo || null} where id = ${f.id}`;
    await registrar(tx, f.sobre_id, f.id, 'rechazado', { motivo }, ctx);
  });
  await avisos.enviarCorreo(avisos.correoAlEquipo(`${f.nombre} no aceptó firmar ${f.s_codigo}`,
    `${f.nombre} (${f.correo}) no aceptó firmar «${f.s_titulo}».\nMotivo: ${motivo || 'no lo dijo'}\n\nEl sobre sigue abierto: anúlalo en el panel y envía uno corregido.`)).catch(() => {});
  return { ok: true };
}

async function verificar(c: Fila) {
  const h = String(c.sha256 ?? '').toLowerCase().trim();
  if (!/^[0-9a-f]{64}$/.test(h)) throw new Fallo(400, 'Eso no es un resumen SHA-256.');
  const [porFinal] = await db()`select * from web_bonding.firma_sobres where final_sha256 = ${h}`;
  const [porDoc] = porFinal ? [null] : await db()`select d.nombre, s.* from web_bonding.firma_documentos d
    join web_bonding.firma_sobres s on s.id = d.sobre_id where d.sha256 = ${h} and s.estado <> 'borrador' order by s.creado_en desc limit 1`;
  const s = porFinal ?? porDoc;
  if (!s) return { encontrado: false };
  const firmantes = await firmantesDe(s.id);
  return {
    encontrado: true, tipo: porFinal ? 'final' : 'original', documento: porDoc?.nombre ?? null,
    sobre: { codigo: s.codigo, titulo: s.titulo, estado: s.estado, enviado_en: s.enviado_en, completado_en: s.completado_en },
    firmantes: firmantes.map((f) => ({ nombre: f.nombre, caracter: f.caracter, estado: f.estado, firmado_en: f.firmado_en })),
    sello: s.sello_tsa ? { tsa: s.sello_tsa, hora: s.sello_en } : null,
  };
}

// ── El cierre: PDF firmado, constancia, sello y correo a todos ───────────────────────────────────────────────
async function cerrar(sobreId: string) {
  // solo uno cierra: el que marca completado_en
  const [s] = await db()`update web_bonding.firma_sobres set completado_en = clock_timestamp()
    where id = ${sobreId} and estado = 'enviado' and completado_en is null
      and not exists (select 1 from web_bonding.firma_firmantes f where f.sobre_id = ${sobreId} and f.estado <> 'firmado')
    returning *`;
  if (!s) return null;
  try {
    const [docs, firmantes, eventos] = await Promise.all([
      documentosDe(sobreId), firmantesDe(sobreId),
      db()`select * from web_bonding.firma_eventos where sobre_id = ${sobreId} order by id`,
    ]);
    const nombres = Object.fromEntries(firmantes.map((f) => [f.id, f.nombre]));
    const sellos = Object.fromEntries(eventos.filter((e) => e.tipo === 'sello_firma').map((e) => [String(e.detalle.evento), `${e.detalle.tsa}, ${horaVE(e.detalle.hora)}`]));
    const conBytes = await Promise.all(docs.map(async (d) => ({ ...d, bytes: await almacen.leer(d.ruta) })));
    for (const d of conBytes) if (await sha256(d.bytes) !== d.sha256) throw new Error(`El archivo de «${d.nombre}» no coincide con su resumen`);
    const final = await armarFinal({
      sobre: { codigo: s.codigo, titulo: s.titulo, enviado_en: s.enviado_en, completado_en: s.completado_en },
      documentos: conBytes,
      firmantes: firmantes.map((f) => {
        const ev = eventos.find((e) => String(e.id) === String(f.firma_evento));
        return {
          nombre: f.nombre, cedula: f.cedula, correo: f.correo, caracter: f.caracter, metodo: f.firma_metodo, firmado_en: f.firmado_en,
          ip: f.firma_ip, agente: f.firma_agente, trazo: f.firma_trazo, evento: f.firma_evento ? Number(f.firma_evento) : null,
          evento_hash: ev?.hash ?? null, sello: sellos[String(f.firma_evento)] ?? null,
        };
      }),
      eventos: eventos.map((e) => ({ id: Number(e.id), creado_en: e.creado_en, ip: e.ip, ...describir(e, nombres) })),
      ultimoHash: eventos[eventos.length - 1]?.hash ?? '',
    });
    const h = await sha256(final.bytes);
    const sello = await sellar(h);
    const base = `${sobreId}/final/${h.slice(0, 16)}`;
    await almacen.guardar(`${base}.pdf`, final.bytes);
    await almacen.guardar(`${base}.tsr`, sello.tsr, 'application/timestamp-reply');
    await db().begin(async (tx) => {
      await tx`update web_bonding.firma_sobres set estado = 'completado', final_ruta = ${`${base}.pdf`}, final_sha256 = ${h},
          final_paginas = ${final.paginas}, sello_ruta = ${`${base}.tsr`}, sello_tsa = ${sello.tsa}, sello_en = ${sello.hora}
        where id = ${sobreId}`;
      await registrar(tx, sobreId, null, 'completado', { sha256: h, paginas: final.paginas, tsa: sello.tsa, hora: sello.hora, tsr: base64(sello.tsr) });
    });
    const nombreArchivo = `${s.codigo} - ${s.titulo} (firmado)`.replace(/[\\/:*?"<>|]/g, '-');
    const adjuntos = [
      { nombre: `${nombreArchivo}.pdf`, bytes: final.bytes },
      { nombre: `${nombreArchivo}.tsr`, bytes: sello.tsr, tipo: 'application/timestamp-reply' },
    ];
    const datos = { sha256: h, paginas: final.paginas, tsa: sello.tsa, hora: horaVE(sello.hora) };
    for (const f of firmantes) {
      await avisos.enviarCorreo(avisos.correoCompletado(s, f, datos, adjuntos)).catch((e) => console.error('correo final', f.correo, e));
    }
    return { sha256: h };
  } catch (e) {
    await db()`update web_bonding.firma_sobres set completado_en = null where id = ${sobreId} and estado = 'enviado'`;
    await registrar(db(), sobreId, null, 'cierre_fallido', { error: String((e as Error).message).slice(0, 300) }).catch(() => {});
    await avisos.enviarCorreo(avisos.correoAlEquipo(`No se pudo cerrar ${s.codigo}`,
      `Firmaron todos «${s.titulo}», pero el cierre falló: ${(e as Error).message}\nEntra al panel, abre el sobre y toca «Cerrar de nuevo».`)).catch(() => {});
    throw e;
  }
}

// ── El panel ─────────────────────────────────────────────────────────────────────────────────────────────────
type CtxAdmin = Ctx & { admin: Fila };

async function sobreAdmin(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id ?? '')) throw new Fallo(404, 'Ese sobre no existe.');
  const [s] = await db()`select * from web_bonding.firma_sobres where id = ${id}`;
  if (!s) throw new Fallo(404, 'Ese sobre no existe.');
  return s;
}

async function listar() {
  return await db()`
    select s.id, s.codigo, s.titulo, s.estado, s.creado_en, s.enviado_en, s.completado_en, s.en_orden,
      (select count(*)::int from web_bonding.firma_documentos d where d.sobre_id = s.id) as documentos,
      (select count(*)::int from web_bonding.firma_firmantes f where f.sobre_id = s.id) as firmantes,
      (select count(*)::int from web_bonding.firma_firmantes f where f.sobre_id = s.id and f.estado = 'firmado') as firmados,
      (select string_agg(f.nombre, ', ' order by f.orden) from web_bonding.firma_firmantes f where f.sobre_id = s.id) as nombres,
      exists (select 1 from web_bonding.firma_firmantes f where f.sobre_id = s.id and f.estado = 'rechazado') as rechazado
    from web_bonding.firma_sobres s order by s.creado_en desc`;
}

async function detalle(c: Fila) {
  const s = await sobreAdmin(c.id);
  const [docs, firmantes, eventos] = await Promise.all([
    documentosDe(s.id), firmantesDe(s.id), db()`select * from web_bonding.firma_eventos where sobre_id = ${s.id} order by id`,
  ]);
  const nombres = Object.fromEntries(firmantes.map((f) => [f.id, f.nombre]));
  const todos = firmantes.map((f) => ({ ...f, s_estado: s.estado, s_en_orden: s.en_orden }));
  return {
    sobre: s,
    documentos: docs.map(({ ruta: _r, ...d }) => d),
    firmantes: todos.map((f) => ({
      id: f.id, orden: f.orden, nombre: f.nombre, cedula: f.cedula, correo: f.correo, telefono: f.telefono, caracter: f.caracter,
      estado: f.estado, invitado_en: f.invitado_en, visto_en: f.visto_en, firmado_en: f.firmado_en, firma_ip: f.firma_ip,
      firma_metodo: f.firma_metodo, rechazado_en: f.rechazado_en, motivo: f.motivo, trazo: f.firma_trazo,
      enlace: s.estado === 'borrador' ? null : enlaceFirma(f.token), toca: turno(f, todos).toca,
    })),
    eventos: eventos.map((e) => ({ id: Number(e.id), creado_en: e.creado_en, tipo: e.tipo, ip: e.ip, hash: e.hash, ...describir(e, nombres) })),
    canales: avisos.canales(),
  };
}

const CODIGO = /^[A-Z0-9-]{4,40}$/;
function limpiarFirmantes(lista: unknown) {
  if (!Array.isArray(lista) || !lista.length) throw new Fallo(400, 'Agrega al menos un firmante.');
  if (lista.length > 12) throw new Fallo(400, 'Un sobre lleva hasta 12 firmantes.');
  const correos = new Set<string>();
  return lista.map((f: Fila, i: number) => {
    const nombre = String(f.nombre ?? '').trim().replace(/\s+/g, ' ');
    const correo = String(f.correo ?? '').trim().toLowerCase();
    const cedula = String(f.cedula ?? '').trim().toUpperCase().replace(/\s/g, '');
    const telefono = String(f.telefono ?? '').trim() || null;
    if (nombre.length < 3) throw new Fallo(400, `Falta el nombre del firmante ${i + 1}.`);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) throw new Fallo(400, `Revisa el correo de ${nombre}.`);
    if (!/^[VEJPG]-?[0-9.]{5,12}(-[0-9])?$/.test(cedula)) throw new Fallo(400, `Revisa la cédula de ${nombre}: va como V-12.345.678.`);
    if (correos.has(correo)) throw new Fallo(400, `El correo ${correo} está dos veces: cada firmante necesita el suyo.`);
    correos.add(correo);
    return { orden: i, nombre, correo, cedula, telefono, caracter: String(f.caracter ?? '').trim().slice(0, 160) || null };
  });
}

async function guardar(c: Fila, ctx: CtxAdmin, form: FormData | null) {
  const codigo = String(c.codigo ?? '').trim().toUpperCase();
  const titulo = String(c.titulo ?? '').trim();
  if (!CODIGO.test(codigo)) throw new Fallo(400, 'El código va en mayúsculas, números y guiones (WB-VGO-001).');
  if (titulo.length < 3) throw new Fallo(400, 'Falta el título del sobre.');
  const firmantes = limpiarFirmantes(c.firmantes);

  // los PDF nuevos: se revisan y se guardan antes de tocar la base
  const archivos = (form?.getAll('archivo') ?? []).filter((a) => typeof a !== 'string') as File[];
  const nombres: string[] = Array.isArray(c.nombres) ? c.nombres : [];
  const previo = c.id ? await sobreAdmin(c.id) : null;
  if (previo && previo.estado !== 'borrador') throw new Fallo(409, 'Este sobre ya se envió: no se cambia. Anúlalo y arma otro.');
  const id: string = previo?.id ?? crypto.randomUUID();
  const nuevos: Fila[] = [];
  for (const [i, a] of archivos.entries()) {
    const bytes = new Uint8Array(await a.arrayBuffer());
    if (bytes.length > 15 * 1024 * 1024) throw new Fallo(400, `«${a.name}» pesa más de 15 MB.`);
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') throw new Fallo(400, `«${a.name}» no es un PDF.`);
    let paginas = 0;
    try { paginas = await contarPaginas(bytes); } catch { throw new Fallo(400, `«${a.name}» está dañado o tiene clave: expórtalo de nuevo.`); }
    const ruta = `${id}/original/${crypto.randomUUID()}.pdf`;
    nuevos.push({ nombre: (nombres[i] || a.name.replace(/\.pdf$/i, '')).trim().slice(0, 160), ruta, bytes: bytes.length, paginas, sha256: await sha256(bytes), datos: bytes });
  }
  for (const n of nuevos) await almacen.guardar(n.ruta, n.datos);

  const quitar: string[] = Array.isArray(c.quitar) ? c.quitar.filter((x: string) => /^[0-9a-f-]{36}$/.test(x)) : [];
  let borrarRutas: string[] = [];
  try {
    await db().begin(async (tx) => {
      if (c.id) {
        await tx`update web_bonding.firma_sobres set codigo = ${codigo}, titulo = ${titulo}, mensaje = ${c.mensaje?.trim() || null},
          en_orden = ${c.en_orden !== false} where id = ${id} and estado = 'borrador'`;
        await tx`delete from web_bonding.firma_firmantes where sobre_id = ${id}`;
        if (quitar.length) borrarRutas = (await tx`delete from web_bonding.firma_documentos where sobre_id = ${id} and id = any(${quitar}) returning ruta`).map((r) => r.ruta);
      } else {
        await tx`insert into web_bonding.firma_sobres (id, codigo, titulo, mensaje, en_orden, creado_por)
          values (${id}, ${codigo}, ${titulo}, ${c.mensaje?.trim() || null}, ${c.en_orden !== false}, ${ctx.admin.id})`;
      }
      for (const f of firmantes) {
        await tx`insert into web_bonding.firma_firmantes (sobre_id, orden, nombre, cedula, correo, telefono, caracter)
          values (${id}, ${f.orden}, ${f.nombre}, ${f.cedula}, ${f.correo}, ${f.telefono}, ${f.caracter})`;
      }
      const [{ max }] = await tx`select coalesce(max(orden), -1)::int as max from web_bonding.firma_documentos where sobre_id = ${id}`;
      for (const [i, n] of nuevos.entries()) {
        await tx`insert into web_bonding.firma_documentos (sobre_id, orden, nombre, ruta, sha256, bytes, paginas)
          values (${id}, ${max + 1 + i}, ${n.nombre}, ${n.ruta}, ${n.sha256}, ${n.bytes}, ${n.paginas})`;
      }
    });
  } catch (e) {
    await almacen.borrar(nuevos.map((n) => n.ruta)).catch(() => {});
    throw e;
  }
  await almacen.borrar(borrarRutas).catch(() => {});
  return await detalle({ id });
}

async function borrar(c: Fila) {
  const s = await sobreAdmin(c.id);
  if (s.estado !== 'borrador') throw new Fallo(409, 'Un sobre enviado no se borra: queda su registro. Anúlalo.');
  const docs = await documentosDe(s.id);
  await db()`delete from web_bonding.firma_sobres where id = ${s.id} and estado = 'borrador'`;
  await almacen.borrar(docs.map((d) => d.ruta)).catch(() => {});
  return { ok: true };
}

async function invitar(sobreId: string, f: Fila, sobre: Fila, recordatorio: boolean, ctx: Partial<CtxAdmin>) {
  const docs = await documentosDe(sobreId);
  await avisos.enviarCorreo(avisos.correoInvitacion(sobre as never, f, enlaceFirma(f.token), docs.map((d) => d.nombre), recordatorio));
  await db().begin(async (tx) => {
    await tx`update web_bonding.firma_firmantes set invitado_en = coalesce(invitado_en, now()) where id = ${f.id} and estado <> 'firmado'`;
    await registrar(tx, sobreId, f.id, recordatorio ? 'recordatorio' : 'invitado', { correo: f.correo, ...(ctx.admin ? { usuario: ctx.admin.correo } : {}) }, ctx);
  });
}

async function enviar(c: Fila, ctx: CtxAdmin) {
  const s = await sobreAdmin(c.id);
  if (s.estado !== 'borrador') throw new Fallo(409, 'Este sobre ya se envió.');
  if (!avisos.hayCorreo()) throw new Fallo(400, 'Falta configurar el correo de las firmas: sin él no llegan los enlaces ni los códigos.');
  const [docs, firmantes] = await Promise.all([documentosDe(s.id), firmantesDe(s.id)]);
  if (!docs.length) throw new Fallo(400, 'El sobre no tiene documentos.');
  if (!firmantes.length) throw new Fallo(400, 'El sobre no tiene firmantes.');
  await db().begin(async (tx) => {
    const r = await tx`update web_bonding.firma_sobres set estado = 'enviado', enviado_en = now() where id = ${s.id} and estado = 'borrador' returning id`;
    if (!r.length) throw new Fallo(409, 'Este sobre ya se envió.');
    await registrar(tx, s.id, null, 'enviado', {
      usuario: ctx.admin.correo, en_orden: s.en_orden,
      documentos: docs.map((d) => ({ id: d.id, nombre: d.nombre, sha256: d.sha256, paginas: d.paginas, bytes: d.bytes })),
      firmantes: firmantes.map((f) => ({ id: f.id, orden: f.orden, nombre: f.nombre, cedula: f.cedula, correo: f.correo, telefono: f.telefono, caracter: f.caracter })),
    }, ctx);
  });
  const aInvitar = s.en_orden ? firmantes.slice(0, 1) : firmantes;
  const errores: string[] = [];
  for (const f of aInvitar) await invitar(s.id, f, s, false, ctx).catch((e) => errores.push(`${f.correo}: ${(e as Error).message}`));
  return { ...(await detalle({ id: s.id })), errores };
}

async function recordar(c: Fila, ctx: CtxAdmin) {
  const s = await sobreAdmin(c.id);
  if (s.estado !== 'enviado') throw new Fallo(409, 'Este sobre no está esperando firmas.');
  const todos = (await firmantesDe(s.id)).map((f) => ({ ...f, s_estado: s.estado, s_en_orden: s.en_orden }));
  const f = todos.find((x) => x.id === c.firmante_id);
  if (!f) throw new Fallo(404, 'Ese firmante no está en el sobre.');
  if (!turno(f, todos).toca) throw new Fallo(409, f.estado === 'firmado' ? 'Ya firmó.' : 'Todavía no le toca: primero firman los de antes.');
  await invitar(s.id, f, s, Boolean(f.invitado_en), ctx);
  return await detalle({ id: s.id });
}

async function anular(c: Fila, ctx: CtxAdmin) {
  const s = await sobreAdmin(c.id);
  if (s.estado !== 'enviado') throw new Fallo(409, 'Solo se anula un sobre que espera firmas.');
  const motivo = String(c.motivo ?? '').trim().slice(0, 500);
  await db().begin(async (tx) => {
    await tx`update web_bonding.firma_sobres set estado = 'anulado', anulado_en = now(), motivo_anulado = ${motivo || null} where id = ${s.id}`;
    await registrar(tx, s.id, null, 'anulado', { usuario: ctx.admin.correo, motivo }, ctx);
  });
  for (const f of await firmantesDe(s.id)) {
    if (f.invitado_en) await avisos.enviarCorreo(avisos.correoAnulado(s, f, motivo)).catch(() => {});
  }
  return await detalle({ id: s.id });
}

async function cerrarAdmin(c: Fila) {
  const s = await sobreAdmin(c.id);
  if (s.estado !== 'enviado') throw new Fallo(409, 'Este sobre no está esperando el cierre.');
  const r = await cerrar(s.id);
  if (!r) throw new Fallo(409, 'Todavía faltan firmas.');
  return await detalle({ id: s.id });
}

async function archivo(c: Fila, _admin: Fila) {
  const s = await sobreAdmin(c.id);
  const limpio = (t: string) => t.replace(/[\\/:*?"<>|]/g, '-');
  if (c.cual === 'final' || c.cual === 'sello') {
    const ruta = c.cual === 'final' ? s.final_ruta : s.sello_ruta;
    if (!ruta) throw new Fallo(404, 'El documento firmado todavía no está listo.');
    return archivoPdf(await almacen.leer(ruta), limpio(`${s.codigo} - ${s.titulo} (firmado).${c.cual === 'final' ? 'pdf' : 'tsr'}`),
      c.cual === 'final' ? 'application/pdf' : 'application/timestamp-reply', true);
  }
  const [d] = await db()`select * from web_bonding.firma_documentos where id = ${/^[0-9a-f-]{36}$/.test(c.cual) ? c.cual : null} and sobre_id = ${s.id}`;
  if (!d) throw new Fallo(404, 'Ese documento no está en el sobre.');
  return archivoPdf(await almacen.leer(d.ruta), limpio(`${d.nombre}.pdf`), 'application/pdf', true);
}
