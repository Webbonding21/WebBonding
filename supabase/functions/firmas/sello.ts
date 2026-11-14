// Sello de tiempo RFC 3161: un tercero (DigiCert; si no responde, FreeTSA) firma «este resumen SHA-256 existía a esta
// hora». Se pide sin cuentas ni claves: solo viaja el resumen, nunca el documento. El sello (.tsr) se comprueba con
//   openssl ts -verify -digest <sha256> -in archivo.tsr -CAfile <cadena de la TSA>
// o con openssl ts -reply -in archivo.tsr -text para leer la hora.

const TSAS = [
  { nombre: 'DigiCert', url: 'http://timestamp.digicert.com' },
  { nombre: 'FreeTSA', url: 'https://freetsa.org/tsr' },
];

const hex = (s: string) => Uint8Array.from(s.match(/../g)!.map((b) => parseInt(b, 16)));

// TimeStampReq en DER: versión 1, SHA-256 del documento, un nonce y que mande su certificado
export function pedidoDeSello(sha256hex: string, nonce: Uint8Array) {
  const n = Uint8Array.from(nonce.slice(0, 8));
  n[0] &= 0x7f; // entero positivo
  if (n[0] === 0) n[0] = 1;
  return Uint8Array.from([
    0x30, 0x43,
    0x02, 0x01, 0x01,
    0x30, 0x31,
    0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00,
    0x04, 0x20, ...hex(sha256hex),
    0x02, 0x08, ...n,
    0x01, 0x01, 0xff,
  ]);
}

// lee el largo de un elemento DER desde la posición i (la del byte de largo); devuelve [largo, dónde empieza el valor]
function largo(b: Uint8Array, i: number): [number, number] {
  const p = b[i];
  if (p < 0x80) return [p, i + 1];
  const n = p & 0x7f;
  let l = 0;
  for (let k = 0; k < n; k++) l = l * 256 + b[i + 1 + k];
  return [l, i + 1 + n];
}

// TimeStampResp: SEQUENCE { status PKIStatusInfo, timeStampToken }. Estado 0 o 1 = concedido.
export function leerRespuesta(b: Uint8Array) {
  if (b[0] !== 0x30) throw new Error('La respuesta del sello no es DER');
  const [, ini] = largo(b, 1);
  if (b[ini] !== 0x30) throw new Error('La respuesta del sello no trae estado');
  const [, iniEstado] = largo(b, ini + 1);
  if (b[iniEstado] !== 0x02) throw new Error('La respuesta del sello no trae estado');
  const estado = b[iniEstado + 2];
  if (estado !== 0 && estado !== 1) throw new Error(`La autoridad de sellado negó el sello (estado ${estado})`);
  // la hora del sello: el GeneralizedTime del TSTInfo (los certificados usan UTCTime hasta 2049)
  let hora: string | null = null;
  for (let i = 0; i < b.length - 17; i++) {
    if (b[i] !== 0x18) continue;
    const l = b[i + 1];
    if (l < 15 || l > 24) continue;
    const s = new TextDecoder().decode(b.slice(i + 2, i + 2 + l));
    const m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\.\d+)?Z$/);
    if (m) { hora = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] ?? ''}Z`; break; }
  }
  return { estado, hora };
}

export async function sellar(sha256hex: string) {
  const errores: string[] = [];
  for (const tsa of TSAS) {
    try {
      const nonce = crypto.getRandomValues(new Uint8Array(8));
      const r = await fetch(tsa.url, {
        method: 'POST',
        headers: { 'content-type': 'application/timestamp-query' },
        body: pedidoDeSello(sha256hex, nonce),
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const tsr = new Uint8Array(await r.arrayBuffer());
      const { hora } = leerRespuesta(tsr);
      return { tsa: tsa.nombre, url: tsa.url, hora, tsr };
    } catch (e) {
      errores.push(`${tsa.nombre}: ${(e as Error).message}`);
    }
  }
  throw new Error(`No se pudo sellar: ${errores.join('; ')}`);
}
