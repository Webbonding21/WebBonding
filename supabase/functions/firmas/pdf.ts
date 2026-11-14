// El PDF firmado: los documentos del sobre uno detrás de otro, sin tocar su contenido, con una línea arriba en cada página
// («Firmado electrónicamente · código…») y al final la Constancia de firma electrónica: el sobre, el resumen SHA-256 de
// cada documento tal cual se subió, cada firmante con su método, su hora, su IP y su firma dibujada, la bitácora y el
// marco legal.
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'npm:pdf-lib@1.17.1';
import fontkit from 'npm:@pdf-lib/fontkit@1.1.1';
import { POPPINS, POPPINS_SEMI } from './fuentes.ts';
import { horaVE, enlaceVerificar } from './entorno.ts';

export async function contarPaginas(bytes: Uint8Array) {
  const d = await PDFDocument.load(bytes, { updateMetadata: false });
  return d.getPageCount();
}

const AZUL = rgb(0x2e / 255, 0x37 / 255, 1);
const TINTA = rgb(0.055, 0.055, 0.067);
const GRIS = rgb(0.42, 0.42, 0.45);
const LINEA = rgb(0.85, 0.85, 0.86);
const PAPEL = rgb(0.953, 0.937, 0.902);

export type DatosConstancia = {
  sobre: { codigo: string; titulo: string; enviado_en: string; completado_en: string };
  documentos: { nombre: string; paginas: number; sha256: string; bytes: Uint8Array }[];
  firmantes: {
    nombre: string; cedula: string; correo: string; caracter: string | null; metodo: string; firmado_en: string;
    ip: string | null; agente: string | null; trazo: string | null; evento: number | null; evento_hash: string | null;
    sello: string | null;
  }[];
  eventos: { id: number; creado_en: string; texto: string; quien: string; ip: string | null }[];
  ultimoHash: string;
};

export const TEXTO_LEGAL = [
  'Este documento se firmó con firma electrónica conforme al Decreto con Rango, Valor y Fuerza de Ley sobre Mensajes de Datos y Firmas Electrónicas (Gaceta Oficial N.º 37.148 del 28 de febrero de 2001). Los mensajes de datos tienen la misma eficacia probatoria que los documentos escritos (art. 4) y satisfacen el requisito de constar por escrito cuando la información es accesible para su consulta posterior (art. 8).',
  'Cada firma está vinculada a su firmante (enlace personal enviado a su correo, cédula escrita por él y código de un solo uso que solo él recibió), estuvo bajo su control exclusivo y permite detectar cualquier cambio posterior del documento por medio de su resumen SHA-256 y del sello de tiempo RFC 3161 de un tercero (art. 16). La firma no usa certificado de un Proveedor de Servicios de Certificación acreditado ante SUSCERTE: vale como elemento de convicción según las reglas de la sana crítica (art. 17), y las partes la reconocieron como su firma en la cláusula de firma electrónica del contrato.',
  `El resumen SHA-256 de este PDF y su sello de tiempo (.tsr) se enviaron por correo a cada firmante al cerrarse el sobre. Cualquier persona puede comprobar el archivo en ${enlaceVerificar()}. La copia impresa de este documento tiene el valor de una copia.`,
];

export async function armarFinal(d: DatosConstancia) {
  const final = await PDFDocument.create();
  // la letra va incrustada (solo las letras que se usan): sin ella, algunos lectores no muestran la constancia
  final.registerFontkit(fontkit);
  const bytesDe = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const normal = await final.embedFont(bytesDe(POPPINS), { subset: true });
  const negrita = await final.embedFont(bytesDe(POPPINS_SEMI), { subset: true });
  const mono = normal;

  // 1. los documentos, con su línea de firma arriba
  const marca = limpiar(`Firmado electrónicamente · ${d.sobre.codigo} · Constancia de firma al final · Comprobar en ${enlaceVerificar().replace(/^https?:\/\//, '')}`, normal);
  for (const doc of d.documentos) {
    const fuente = await PDFDocument.load(doc.bytes, { updateMetadata: false });
    const paginas = await final.copyPages(fuente, fuente.getPageIndices());
    for (const p of paginas) {
      final.addPage(p);
      const { width, height } = p.getSize();
      p.drawText(marca, { x: 18, y: height - 11, size: 6.5, font: normal, color: GRIS, maxWidth: width - 36 });
    }
  }
  const antes = final.getPageCount();

  // 2. la constancia
  const c = new Lienzo(final, normal, negrita, mono);
  c.titulo('Constancia de firma electrónica');
  c.parrafo('Web Bonding, C.A. · RIF J-50804362-6 · Firma electrónica de webbonding.net/firmar', { tam: 9, color: GRIS });
  c.espacio(8);

  c.seccion('El sobre');
  c.par('Código', d.sobre.codigo);
  c.par('Título', d.sobre.titulo);
  c.par('Enviado a firmar', horaVE(d.sobre.enviado_en));
  c.par('Firmado por todos', horaVE(d.sobre.completado_en));
  c.par('Páginas', `${antes} de ${d.documentos.length === 1 ? 'el documento' : `${d.documentos.length} documentos`} y esta constancia al final`);

  c.seccion('Documentos (resumen SHA-256 de cada uno tal cual se subió, antes de firmar)');
  d.documentos.forEach((doc, i) => {
    c.necesita(30);
    c.parrafo(`${/^\d/.test(doc.nombre) ? '' : `${i + 1}. `}${doc.nombre} · ${doc.paginas} página${doc.paginas === 1 ? '' : 's'}`, { fuente: negrita, tam: 9.5 });
    c.parrafo(doc.sha256, { fuente: mono, tam: 8, color: GRIS });
    c.espacio(3);
  });

  c.seccion('Firmantes');
  for (const f of d.firmantes) await c.firmante(f);

  c.seccion('Bitácora del sobre (hora de Venezuela, UTC−4)');
  c.tabla(['Fecha y hora', 'Evento', 'Quién', 'IP'], [118, 196, 124, 74], d.eventos.map((e) => [horaVE(e.creado_en), e.texto, e.quien, e.ip ?? '']));
  c.espacio(4);
  c.parrafo('Cada evento lleva el resumen SHA-256 del anterior, así que cambiar o borrar uno rompe la cadena. Último resumen de la bitácora:', { tam: 8, color: GRIS });
  c.parrafo(d.ultimoHash, { fuente: mono, tam: 8, color: GRIS });

  c.seccion('Validez');
  for (const t of TEXTO_LEGAL) { c.parrafo(t, { tam: 8.5 }); c.espacio(4); }

  // pie de cada página de la constancia
  const total = final.getPageCount() - antes;
  final.getPages().slice(antes).forEach((p, i) => {
    const t = limpiar(`Constancia de firma electrónica · ${d.sobre.codigo} · página ${i + 1} de ${total}`, normal);
    p.drawText(t, { x: 50, y: 28, size: 7.5, font: normal, color: GRIS });
  });

  const fecha = new Date(d.sobre.completado_en);
  final.setTitle(`${d.sobre.titulo} · firmado`);
  final.setSubject(`${d.sobre.codigo} · firmado electrónicamente`);
  final.setAuthor('Web Bonding, C.A.');
  final.setCreator('webbonding.net/firmar');
  final.setProducer('webbonding.net/firmar');
  final.setCreationDate(fecha);
  final.setModificationDate(fecha);
  const bytes = await final.save();
  return { bytes, paginas: final.getPageCount() };
}

// lo que la letra no tiene se cambia o se quita
const CAMBIOS: Record<string, string> = { '−': '-', '‑': '-', '→': '->', '≈': '~', ' ': ' ', ' ': ' ' };
function limpiar(s: string, f: PDFFont) {
  let out = '';
  for (const ch of s ?? '') {
    const c = CAMBIOS[ch] ?? ch;
    try { f.encodeText(c); out += c; } catch { /* fuera de WinAnsi */ }
  }
  return out;
}

class Lienzo {
  doc: PDFDocument; n: PDFFont; b: PDFFont; m: PDFFont; p!: PDFPage; y = 0;
  W = 612; H = 792; X = 50; ANCHO = 512;
  constructor(doc: PDFDocument, n: PDFFont, b: PDFFont, m: PDFFont) { this.doc = doc; this.n = n; this.b = b; this.m = m; this.nueva(); }

  nueva() {
    this.p = this.doc.addPage([this.W, this.H]);
    this.p.drawRectangle({ x: 0, y: this.H - 6, width: this.W, height: 6, color: AZUL });
    this.y = this.H - 54;
  }
  necesita(alto: number) { if (this.y - alto < 50) this.nueva(); }
  espacio(n: number) { this.y -= n; }

  lineas(texto: string, f: PDFFont, tam: number, ancho: number) {
    const out: string[] = [];
    for (const parrafo of limpiar(texto, f).split('\n')) {
      let linea = '';
      for (const palabra of parrafo.split(/\s+/)) {
        const prueba = linea ? `${linea} ${palabra}` : palabra;
        if (f.widthOfTextAtSize(prueba, tam) <= ancho) { linea = prueba; continue; }
        if (linea) out.push(linea);
        // una palabra más ancha que la línea (un resumen, un navegador) se parte a la fuerza
        let resto = palabra;
        while (f.widthOfTextAtSize(resto, tam) > ancho) {
          let k = resto.length;
          while (k > 1 && f.widthOfTextAtSize(resto.slice(0, k), tam) > ancho) k--;
          out.push(resto.slice(0, k)); resto = resto.slice(k);
        }
        linea = resto;
      }
      out.push(linea);
    }
    return out;
  }

  parrafo(texto: string, o: { fuente?: PDFFont; tam?: number; color?: ReturnType<typeof rgb>; x?: number; ancho?: number } = {}) {
    const f = o.fuente ?? this.n; const tam = o.tam ?? 9.5; const x = o.x ?? this.X; const ancho = o.ancho ?? this.ANCHO;
    for (const l of this.lineas(texto, f, tam, ancho)) {
      this.necesita(tam * 1.4);
      this.p.drawText(l, { x, y: this.y - tam, size: tam, font: f, color: o.color ?? TINTA });
      this.y -= tam * 1.38;
    }
  }

  titulo(t: string) {
    this.p.drawText(limpiar(t, this.b), { x: this.X, y: this.y - 20, size: 20, font: this.b, color: TINTA });
    this.y -= 30;
  }

  seccion(t: string) {
    this.necesita(44);
    this.y -= 12;
    this.p.drawText(limpiar(t, this.b), { x: this.X, y: this.y - 11, size: 11, font: this.b, color: AZUL });
    this.y -= 17;
    this.p.drawLine({ start: { x: this.X, y: this.y }, end: { x: this.X + this.ANCHO, y: this.y }, thickness: 0.6, color: LINEA });
    this.y -= 7;
  }

  par(k: string, v: string) {
    const ls = this.lineas(v, this.n, 9.5, this.ANCHO - 120);
    this.necesita(ls.length * 13 + 2);
    this.p.drawText(limpiar(k, this.b), { x: this.X, y: this.y - 9.5, size: 9, font: this.b, color: GRIS });
    for (const l of ls) { this.p.drawText(l, { x: this.X + 120, y: this.y - 9.5, size: 9.5, font: this.n, color: TINTA }); this.y -= 13; }
    this.y -= 1;
  }

  async firmante(f: DatosConstancia['firmantes'][number]) {
    const ANCHO_TXT = this.ANCHO - 170;
    const filas: [string, PDFFont, number][] = [
      [f.nombre, this.b, 10.5],
      [`C.I. ${f.cedula}${f.caracter ? ` · ${f.caracter}` : ''}`, this.n, 9],
      [`Correo: ${f.correo}`, this.n, 9],
      [`Método: ${f.metodo}`, this.n, 9],
      [`Firmó: ${horaVE(f.firmado_en)}${f.ip ? ` · IP ${f.ip}` : ''}`, this.n, 9],
      [`Navegador: ${(f.agente ?? '').slice(0, 160)}`, this.n, 7.5],
      [`Evento N.º ${f.evento ?? ''} de la bitácora · resumen ${f.evento_hash ?? ''}`, this.m, 7],
    ];
    if (f.sello) filas.push([`Sello de tiempo de la firma: ${f.sello}`, this.n, 7.5]);
    const bloques = filas.map(([t, fu, tam]) => ({ ls: this.lineas(t, fu, tam, ANCHO_TXT), fu, tam }));
    const alto = Math.max(84, bloques.reduce((a, b) => a + b.ls.length * b.tam * 1.38, 0) + 16);
    this.necesita(alto + 8);
    const top = this.y;
    this.p.drawRectangle({ x: this.X, y: top - alto, width: this.ANCHO, height: alto, borderColor: LINEA, borderWidth: 0.8, color: rgb(1, 1, 1) });
    let y = top - 8;
    for (const bl of bloques) {
      for (const l of bl.ls) { this.p.drawText(l, { x: this.X + 10, y: y - bl.tam, size: bl.tam, font: bl.fu, color: bl.fu === this.b ? TINTA : rgb(0.2, 0.2, 0.22) }); y -= bl.tam * 1.38; }
    }
    // la firma dibujada, a la derecha
    const cx = this.X + this.ANCHO - 160; const cw = 150; const ch = alto - 16;
    this.p.drawRectangle({ x: cx, y: top - 8 - ch, width: cw, height: ch, color: PAPEL });
    if (f.trazo?.startsWith('data:image/png;base64,')) {
      try {
        const png = await this.doc.embedPng(Uint8Array.from(atob(f.trazo.split(',')[1]), (c) => c.charCodeAt(0)));
        const k = Math.min((cw - 12) / png.width, (ch - 22) / png.height);
        const w = png.width * k; const h = png.height * k;
        this.p.drawImage(png, { x: cx + (cw - w) / 2, y: top - 8 - ch + 14 + (ch - 22 - h) / 2, width: w, height: h });
      } catch { /* trazo dañado: queda el recuadro */ }
    }
    this.p.drawText('Firma dibujada por el firmante', { x: cx + 8, y: top - 8 - ch + 5, size: 6.5, font: this.n, color: GRIS });
    this.y = top - alto - 8;
  }

  tabla(cab: string[], anchos: number[], filas: string[][]) {
    const tam = 7.8; const alto = (n: number) => n * tam * 1.35 + 6;
    const dibujarCab = () => {
      this.necesita(20);
      this.p.drawRectangle({ x: this.X, y: this.y - 15, width: this.ANCHO, height: 15, color: PAPEL });
      let x = this.X + 4;
      cab.forEach((t, i) => { this.p.drawText(limpiar(t, this.b), { x, y: this.y - 11, size: 7.8, font: this.b, color: TINTA }); x += anchos[i]; });
      this.y -= 17;
    };
    dibujarCab();
    for (const fila of filas) {
      const celdas = fila.map((t, i) => this.lineas(t, this.n, tam, anchos[i] - 8));
      const h = alto(Math.max(...celdas.map((c) => c.length)));
      if (this.y - h < 50) { this.nueva(); dibujarCab(); }
      let x = this.X + 4;
      celdas.forEach((ls, i) => {
        ls.forEach((l, k) => this.p.drawText(l, { x, y: this.y - tam - k * tam * 1.35 - 1, size: tam, font: this.n, color: TINTA }));
        x += anchos[i];
      });
      this.y -= h;
      this.p.drawLine({ start: { x: this.X, y: this.y + 2 }, end: { x: this.X + this.ANCHO, y: this.y + 2 }, thickness: 0.4, color: LINEA });
    }
  }
}
