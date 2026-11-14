// Variables de entorno en Supabase (Deno) y en las pruebas locales (Node).
// deno-lint-ignore no-explicit-any
const g = globalThis as any;
export const env = (k: string): string | undefined => (g.Deno ? g.Deno.env.get(k) : g.process?.env?.[k]) || undefined;

export const SITIO = () => (env('FIRMAS_SITIO') ?? 'https://webbonding.net').replace(/\/$/, '');
export const enlaceFirma = (token: string) => `${SITIO()}/firmar/${token}`;
export const enlaceVerificar = () => `${SITIO()}/firmar/verificar`;

export async function sha256(bytes: Uint8Array | string) {
  const datos = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes;
  const h = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const base64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

// fechas en la hora de Venezuela (UTC−4), como van en la constancia y en los correos
export function horaVE(iso: string | Date | null | undefined, conSegundos = true) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    second: conSegundos ? '2-digit' : undefined, hour12: false,
  }).formatToParts(d);
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return `${v('day')}/${v('month')}/${v('year')} ${v('hour')}:${v('minute')}${conSegundos ? `:${v('second')}` : ''} VET`;
}

// a***z@gmail.com · V-17.8**.**7 · +58 *** *** 9731
export const ocultarCorreo = (c: string) => c.replace(/^(.)(.*)(.@)/, (_m, a, b, z) => `${a}${'*'.repeat(Math.min(b.length, 6))}${z}`);
export const ocultarCedula = (c: string) => {
  const d = c.replace(/\D/g, '');
  return `${c.charAt(0).toUpperCase()}-${d.slice(0, 2)}${'*'.repeat(Math.max(d.length - 3, 0))}${d.slice(-1)}`;
};
export const ocultarTelefono = (t: string) => `${'*'.repeat(Math.max(t.replace(/\D/g, '').length - 4, 0))}${t.replace(/\D/g, '').slice(-4)}`;
export const soloDigitos = (s: string) => (s ?? '').replace(/\D/g, '');
