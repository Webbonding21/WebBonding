/* eslint-disable react/prop-types */
// /firmar/<token>: donde cada firmante firma su sobre, una pregunta por pantalla — lee los documentos, escribe su cédula,
// dibuja su firma, pide su código de un solo uso y acepta. /firmar/verificar: cualquiera comprueba si un PDF es el que se
// firmó aquí (el archivo no sale del teléfono: solo viaja su resumen SHA-256). Todo pasa por src/lib/firmas.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import {
  FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiDownload, FiExternalLink, FiFileText, FiLock,
  FiMail, FiMessageCircle, FiRotateCcw, FiShield, FiUploadCloud, FiX,
} from 'react-icons/fi';
import {
  enlaceDocumento, fechaHora, firmar, pedirCodigo, rechazar, sha256Archivo, verSobre, verificar,
} from '../lib/firmas';
import '../assets/Firmar.css';

const PASOS = ['leer', 'cedula', 'firma', 'codigo', 'confirmar'];
const primerNombre = (n = '') => { const p = n.trim().split(/\s+/)[0].toLowerCase(); return p.charAt(0).toUpperCase() + p.slice(1); };

export default function Firmar() {
  const { token } = useParams();
  return (
    <div className="fm">
      <Helmet>
        <title>{token === 'verificar' || !token ? 'Comprobar un documento firmado · Web Bonding' : 'Firmar · Web Bonding'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="fm-cab">
        <a href="/" className="fm-cab__marca"><img src="/logoennegro.png" alt="" /> <span>Web Bonding</span></a>
        <span className="fm-cab__que"><FiLock aria-hidden="true" /> Firma electrónica</span>
      </header>
      <main className="fm-main">
        {token === 'verificar' || !token ? <Verificar /> : <Sobre token={token} />}
      </main>
      <footer className="fm-pie">
        Web Bonding, C.A. · RIF J-50804362-6 · Firma conforme al Decreto-Ley sobre Mensajes de Datos y Firmas Electrónicas ·{' '}
        <a href="/firmar/verificar">Comprobar un documento</a>
      </footer>
    </div>
  );
}

// ── El sobre de un firmante ──────────────────────────────────────────────────────────────────────────────────
function Sobre({ token }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [paso, setPaso] = useState('inicio');
  const [abiertos, setAbiertos] = useState({});
  const [leidos, setLeidos] = useState({});
  const [cedula, setCedula] = useState('');
  const [trazo, setTrazo] = useState('');
  const [canal, setCanal] = useState('correo');
  const [envio, setEnvio] = useState(null); // { destino, canal } del último código
  const [codigo, setCodigo] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [firmado, setFirmado] = useState(null);

  const cargar = useCallback(() => verSobre(token).then((d) => { setDatos(d); setCanal(d.canales[0] ?? 'correo'); }).catch((e) => setError(e.message)), [token]);
  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { window.scrollTo(0, 0); setAviso(''); }, [paso]);

  if (error) return <Mensaje icono={FiAlertTriangle} tono="mal" titulo="No se pudo abrir" texto={error} />;
  if (!datos) return <p className="fm-cargando">Cargando…</p>;

  const { sobre, yo, documentos, firmantes } = datos;
  const ir = (p) => setPaso(p);
  const n = PASOS.indexOf(paso);

  if (firmado || yo.estado === 'firmado') {
    return (
      <Mensaje icono={FiCheckCircle} tono="bien" titulo={firmado ? `Listo, ${primerNombre(yo.nombre)}: firmaste` : 'Ya firmaste este sobre'}
        texto={`Tu firma quedó registrada el ${fechaHora(firmado?.firmado_en ?? yo.firmado_en)} y te llegó el comprobante al correo.`}>
        {sobre.final ? (
          <a className="fm-btn" href={enlaceDocumento(token, 'final')} target="_blank" rel="noopener noreferrer">
            <FiDownload aria-hidden="true" /> Descargar el documento firmado
          </a>
        ) : <p>Cuando firmen todos, te llega por correo el PDF firmado con su constancia. Ese es el original: guárdalo.</p>}
        <Firmantes lista={firmantes} />
      </Mensaje>
    );
  }
  if (sobre.estado === 'anulado') return <Mensaje icono={FiX} tono="mal" titulo="Este sobre se anuló" texto="Web Bonding lo anuló: el enlace ya no sirve para firmar. Si te mandan uno nuevo, usa ese." />;
  if (yo.estado === 'rechazado') return <Mensaje icono={FiX} tono="mal" titulo="No aceptaste firmar" texto="Le avisamos a Web Bonding. Si fue un error, escríbeles y te mandan un enlace nuevo." />;
  if (!yo.toca) {
    return (
      <Mensaje icono={FiMail} titulo={`Todavía no te toca, ${primerNombre(yo.nombre)}`}
        texto={`Este sobre se firma en orden: primero tiene que firmar ${yo.antes}. Cuando lo haga, te llega un correo y vuelves a este mismo enlace.`}>
        <Firmantes lista={firmantes} />
      </Mensaje>
    );
  }

  const listo = { leer: documentos.every((d) => leidos[d.id]), cedula: cedula.replace(/\D/g, '').length >= 5, firma: Boolean(trazo), codigo: codigo.replace(/\D/g, '').length === 6, confirmar: acepto };

  const pedir = async () => {
    setOcupado(true); setAviso('');
    try {
      const r = await pedirCodigo(token, cedula, canal);
      setEnvio(r); setCodigo('');
    } catch (e) {
      setAviso(e.message);
      if (/cédula/i.test(e.message)) { setPaso('cedula'); setTimeout(() => setAviso(e.message)); }
    }
    setOcupado(false);
  };

  const enviarFirma = async () => {
    setOcupado(true); setAviso('');
    try {
      const r = await firmar({ token, cedula, codigo, trazo, acepto, leidos: documentos.map((d) => d.id) });
      setFirmado(r);
      cargar();
    } catch (e) {
      const m = e.message;
      if (/código|codigo/i.test(m)) { setPaso('codigo'); setCodigo(''); if (/venció|ya no sirve|Primero/i.test(m)) setEnvio(null); }
      else if (/cédula/i.test(m)) setPaso('cedula');
      else if (/documentos/i.test(m)) setPaso('leer');
      else if (/firma dibujada/i.test(m)) setPaso('firma');
      setTimeout(() => setAviso(m));
    }
    setOcupado(false);
  };

  if (paso === 'rechazar') return <Rechazar token={token} volver={() => ir('inicio')} alTerminar={cargar} />;

  if (paso === 'inicio') {
    return (
      <section className="fm-tarjeta">
        <p className="fm-eyebrow">{sobre.codigo}</p>
        <h1>Hola, {primerNombre(yo.nombre)}</h1>
        <p className="fm-lead">Web Bonding te envió <b>{sobre.titulo}</b> para firmar de forma electrónica.</p>
        {sobre.mensaje && <p className="fm-nota-msg">{sobre.mensaje}</p>}
        <ul className="fm-docs">
          {documentos.map((d) => <li key={d.id}><FiFileText aria-hidden="true" /> <span>{d.nombre}</span> <i>{d.paginas} pág.</i></li>)}
        </ul>
        <p className="fm-txt">Son cinco pasos y tarda unos tres minutos: lees los documentos, escribes tu cédula, haces tu firma,
          confirmas con un código que te llega a tu correo ({yo.correo}) y aceptas.</p>
        <button type="button" className="fm-btn fm-btn--grande" onClick={() => ir('leer')}>Empezar <FiArrowRight aria-hidden="true" /></button>
        <Firmantes lista={firmantes} />
        <button type="button" className="fm-enlace" onClick={() => ir('rechazar')}>No voy a firmar</button>
      </section>
    );
  }

  return (
    <section className="fm-tarjeta">
      <div className="fm-progreso" aria-label={`Paso ${n + 1} de ${PASOS.length}`}>
        {PASOS.map((p, i) => <span key={p} className={i <= n ? 'is-hecho' : ''} />)}
      </div>
      <p className="fm-eyebrow">Paso {n + 1} de {PASOS.length}</p>

      {paso === 'leer' && (
        <>
          <h1>Lee los documentos</h1>
          <p className="fm-txt">Ábrelos uno por uno. Cuando termines cada uno, márcalo como leído.</p>
          <ul className="fm-leer">
            {documentos.map((d) => (
              <li key={d.id} className={leidos[d.id] ? 'is-leido' : ''}>
                <div className="fm-leer__doc">
                  <FiFileText aria-hidden="true" />
                  <span><b>{d.nombre}</b><i>{d.paginas} páginas</i></span>
                </div>
                <div className="fm-leer__acc">
                  <a className="fm-btn fm-btn--suave" href={enlaceDocumento(token, d.id)} target="_blank" rel="noopener noreferrer"
                    onClick={() => setAbiertos((a) => ({ ...a, [d.id]: true }))}>
                    <FiExternalLink aria-hidden="true" /> Abrir
                  </a>
                  <label className={`fm-check${abiertos[d.id] ? '' : ' is-apagado'}`} title={abiertos[d.id] ? '' : 'Primero ábrelo'}>
                    <input type="checkbox" checked={Boolean(leidos[d.id])} disabled={!abiertos[d.id]}
                      onChange={(e) => setLeidos((l) => ({ ...l, [d.id]: e.target.checked }))} />
                    <span>Lo leí</span>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {paso === 'cedula' && (
        <>
          <h1>¿Cuál es tu cédula?</h1>
          <p className="fm-txt">La de {yo.nombre}. Es para comprobar que eres tú: tiene que coincidir con la del contrato (<span className="fm-nw">{yo.cedula}</span>).</p>
          <input className="fm-campo fm-campo--grande" inputMode="numeric" autoComplete="off" placeholder="12.345.678" value={cedula} autoFocus
            onChange={(e) => setCedula(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && listo.cedula && ir('firma')} />
        </>
      )}

      {paso === 'firma' && (
        <>
          <h1>Haz tu firma</h1>
          <p className="fm-txt">Con el dedo o con el ratón, como firmas en papel. Va en la constancia, al lado de tus datos.</p>
          <Lienzo valor={trazo} alCambiar={setTrazo} />
        </>
      )}

      {paso === 'codigo' && (
        <>
          <h1>Confirma con tu código</h1>
          {!envio ? (
            <>
              <p className="fm-txt">Te mandamos un código de 6 números. Vence en 10 minutos y sirve una sola vez.</p>
              {datos.canales.length > 1 && (
                <div className="fm-canales" role="radiogroup" aria-label="Dónde quieres el código">
                  {datos.canales.map((k) => (
                    <button key={k} type="button" role="radio" aria-checked={canal === k} className={`fm-canal${canal === k ? ' is-activo' : ''}`} onClick={() => setCanal(k)}>
                      {k === 'whatsapp' ? <FiMessageCircle aria-hidden="true" /> : <FiMail aria-hidden="true" />}
                      <span><b>{k === 'whatsapp' ? 'WhatsApp' : 'Correo'}</b><i>{k === 'whatsapp' ? `Termina en ${yo.telefono}` : yo.correo}</i></span>
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="fm-btn fm-btn--grande" onClick={pedir} disabled={ocupado}>
                {ocupado ? 'Enviando…' : `Enviarme el código${datos.canales.length > 1 ? '' : ` a ${yo.correo}`}`}
              </button>
            </>
          ) : (
            <>
              <p className="fm-txt">Te llegó a {envio.canal === 'whatsapp' ? 'tu WhatsApp' : 'tu correo'} {envio.destino}. Si no lo ves, revisa Spam o Promociones.</p>
              <input className="fm-campo fm-campo--codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" autoFocus
                value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && listo.codigo && ir('confirmar')} aria-label="Código de 6 números" />
              <button type="button" className="fm-enlace" onClick={pedir} disabled={ocupado}><FiRotateCcw aria-hidden="true" /> Mandarme otro código</button>
            </>
          )}
        </>
      )}

      {paso === 'confirmar' && (
        <>
          <h1>Firma</h1>
          <dl className="fm-resumen">
            <div><dt>Firmante</dt><dd>{yo.nombre}{yo.caracter ? `, ${yo.caracter}` : ''}</dd></div>
            <div><dt>Cédula</dt><dd>{cedula.toUpperCase()}</dd></div>
            <div><dt>Firma</dt><dd><img src={trazo} alt="Tu firma" className="fm-resumen__firma" /></dd></div>
            <div><dt>Documentos</dt><dd>{documentos.map((d) => d.nombre).join(' · ')}</dd></div>
          </dl>
          <label className="fm-acepto">
            <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
            <span>{datos.consentimiento}</span>
          </label>
        </>
      )}

      {aviso && <p className="fm-aviso" role="alert"><FiAlertTriangle aria-hidden="true" /> {aviso}</p>}

      <div className="fm-nav">
        <button type="button" className="fm-btn fm-btn--plano" onClick={() => ir(n === 0 ? 'inicio' : PASOS[n - 1])}>
          <FiArrowLeft aria-hidden="true" /> Atrás
        </button>
        {paso === 'confirmar' ? (
          <button type="button" className="fm-btn fm-btn--grande" disabled={!acepto || ocupado} onClick={enviarFirma}>
            {ocupado ? 'Firmando…' : <>Firmar ahora <FiCheck aria-hidden="true" /></>}
          </button>
        ) : (paso !== 'codigo' || envio) && (
          <button type="button" className="fm-btn" disabled={!listo[paso]} onClick={() => ir(PASOS[n + 1])}>
            Seguir <FiArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}

function Firmantes({ lista }) {
  return (
    <ol className="fm-firmantes" aria-label="Quiénes firman">
      {lista.map((f, i) => (
        <li key={i} className={`is-${f.estado}`}>
          <span className="fm-firmantes__punto" aria-hidden="true">{f.estado === 'firmado' ? <FiCheck /> : i + 1}</span>
          <span><b>{f.nombre}{f.yo ? ' (tú)' : ''}</b><i>{f.estado === 'firmado' ? `Firmó el ${fechaHora(f.firmado_en)}` : f.estado === 'rechazado' ? 'No aceptó firmar' : 'Falta su firma'}</i></span>
        </li>
      ))}
    </ol>
  );
}

function Mensaje({ icono: Icono, tono = '', titulo, texto, children }) {
  return (
    <section className={`fm-tarjeta fm-mensaje${tono ? ` is-${tono}` : ''}`}>
      <span className="fm-mensaje__ico" aria-hidden="true"><Icono /></span>
      <h1>{titulo}</h1>
      <p className="fm-txt">{texto}</p>
      {children}
    </section>
  );
}

function Rechazar({ token, volver, alTerminar }) {
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const enviar = async () => {
    setOcupado(true);
    try { await rechazar(token, motivo); alTerminar(); } catch (e) { setAviso(e.message); }
    setOcupado(false);
  };
  return (
    <section className="fm-tarjeta">
      <h1>¿No vas a firmar?</h1>
      <p className="fm-txt">Le avisamos a Web Bonding para que lo revise contigo. Cuéntales por qué, si quieres.</p>
      <textarea className="fm-campo" rows={4} maxLength={500} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Por ejemplo: hay un dato mal en la cláusula de pagos." />
      {aviso && <p className="fm-aviso" role="alert"><FiAlertTriangle aria-hidden="true" /> {aviso}</p>}
      <div className="fm-nav">
        <button type="button" className="fm-btn fm-btn--plano" onClick={volver}><FiArrowLeft aria-hidden="true" /> Volver</button>
        <button type="button" className="fm-btn fm-btn--mal" onClick={enviar} disabled={ocupado}>{ocupado ? 'Enviando…' : 'No voy a firmar'}</button>
      </div>
    </section>
  );
}

// ── El lienzo de la firma ────────────────────────────────────────────────────────────────────────────────────
function Lienzo({ valor, alCambiar }) {
  const ref = useRef(null);
  const trazando = useRef(false);
  const ultimo = useRef(null);
  const [vacio, setVacio] = useState(!valor);

  useEffect(() => {
    const c = ref.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = c.getBoundingClientRect();
    c.width = Math.round(width * dpr); c.height = Math.round(height * dpr);
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0E0E11'; ctx.lineWidth = 2.6;
    if (valor) {
      // la firma que ya hizo (al volver a este paso), centrada y sin estirar
      const im = new Image();
      im.onload = () => { const k = Math.min((width - 24) / im.width, (height - 24) / im.height, 1); ctx.drawImage(im, (width - im.width * k) / 2, (height - im.height * k) / 2, im.width * k, im.height * k); };
      im.src = valor;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const punto = (e) => { const r = ref.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const bajar = (e) => { e.preventDefault(); ref.current.setPointerCapture(e.pointerId); trazando.current = true; ultimo.current = punto(e); };
  const mover = (e) => {
    if (!trazando.current) return;
    const p = punto(e); const ctx = ref.current.getContext('2d');
    ctx.beginPath(); ctx.moveTo(ultimo.current.x, ultimo.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    ultimo.current = p; setVacio(false);
  };
  const subir = () => {
    if (!trazando.current) return;
    trazando.current = false;
    alCambiar(recortado(ref.current));
  };
  const borrar = () => {
    const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setVacio(true); alCambiar('');
  };
  return (
    <div className="fm-lienzo">
      <canvas ref={ref} onPointerDown={bajar} onPointerMove={mover} onPointerUp={subir} onPointerCancel={subir} onPointerLeave={subir}
        aria-label="Espacio para dibujar tu firma" />
      {vacio && <span className="fm-lienzo__guia" aria-hidden="true">Firma aquí</span>}
      <span className="fm-lienzo__linea" aria-hidden="true" />
      <button type="button" className="fm-btn fm-btn--plano fm-lienzo__borrar" onClick={borrar} disabled={vacio}><FiRotateCcw aria-hidden="true" /> Borrar</button>
    </div>
  );
}

// la firma sin el espacio vacío alrededor, en PNG transparente
function recortado(c) {
  const ctx = c.getContext('2d');
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let x0 = width; let y0 = height; let x1 = -1; let y1 = -1;
  for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
    if (data[(y * width + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0 || (x1 - x0) < 30) return '';
  const m = 12; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(width, x1 + m); y1 = Math.min(height, y1 + m);
  const k = Math.min(1, 900 / (x1 - x0));
  const out = document.createElement('canvas');
  out.width = Math.round((x1 - x0) * k); out.height = Math.round((y1 - y0) * k);
  out.getContext('2d').drawImage(c, x0, y0, x1 - x0, y1 - y0, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

// ── Comprobar un documento ───────────────────────────────────────────────────────────────────────────────────
function Verificar() {
  const [estado, setEstado] = useState(null); // null | 'calculando' | { r, hash, nombre }
  const [error, setError] = useState('');
  const [encima, setEncima] = useState(false);

  const revisar = async (archivo) => {
    if (!archivo) return;
    setError(''); setEstado('calculando');
    try {
      const hash = await sha256Archivo(archivo);
      setEstado({ r: await verificar(hash), hash, nombre: archivo.name });
    } catch (e) { setError(e.message); setEstado(null); }
  };

  const r = estado?.r;
  return (
    <section className="fm-tarjeta">
      <p className="fm-eyebrow"><FiShield aria-hidden="true" /> Comprobar</p>
      <h1>¿Este PDF es el que se firmó?</h1>
      <p className="fm-txt">Suelta aquí el PDF firmado (o uno de los originales). El archivo no sale de tu equipo: se calcula su resumen
        SHA-256 y solo eso se compara con lo que quedó registrado al firmar. Si cambió aunque sea una letra, no coincide.</p>
      <label className={`fm-soltar${encima ? ' is-encima' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setEncima(true); }} onDragLeave={() => setEncima(false)}
        onDrop={(e) => { e.preventDefault(); setEncima(false); revisar(e.dataTransfer.files?.[0]); }}>
        <FiUploadCloud aria-hidden="true" />
        <b>{estado === 'calculando' ? 'Revisando…' : 'Elegir el PDF'}</b>
        <i>o arrástralo aquí</i>
        <input type="file" accept="application/pdf,.pdf" onChange={(e) => revisar(e.target.files?.[0])} />
      </label>
      {error && <p className="fm-aviso" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
      {r && (r.encontrado ? (
        <div className="fm-veredicto is-bien">
          <p className="fm-veredicto__titulo"><FiCheckCircle aria-hidden="true" />
            {r.tipo === 'final' ? 'Es el documento firmado, sin cambios' : `Es el original de «${r.documento}», sin cambios`}</p>
          <dl className="fm-resumen">
            <div><dt>Sobre</dt><dd>{r.sobre.codigo} · {r.sobre.titulo}</dd></div>
            <div><dt>Estado</dt><dd>{r.sobre.estado === 'completado' ? `Firmado por todos el ${fechaHora(r.sobre.completado_en)}` : r.sobre.estado === 'anulado' ? 'Anulado' : 'Esperando firmas'}</dd></div>
            {r.sello && <div><dt>Sello de tiempo</dt><dd>{r.sello.tsa}, {fechaHora(r.sello.hora)}</dd></div>}
            <div><dt>Firmantes</dt><dd>{r.firmantes.map((f) => `${f.nombre}${f.estado === 'firmado' ? ` (firmó el ${fechaHora(f.firmado_en)})` : ' (sin firmar)'}`).join(' · ')}</dd></div>
          </dl>
          {r.tipo === 'original' && <p className="fm-txt">Este es el archivo de antes de firmar. El que vale es el PDF firmado, con la constancia al final.</p>}
          <p className="fm-hash">{estado.hash}</p>
        </div>
      ) : (
        <div className="fm-veredicto is-mal">
          <p className="fm-veredicto__titulo"><FiX aria-hidden="true" /> No coincide con ningún documento firmado aquí</p>
          <p className="fm-txt">O no se firmó en webbonding.net, o se cambió después de firmar (aunque sea al guardarlo o imprimirlo a PDF otra vez).
            Pídele a quien te lo mandó el PDF que llegó por correo al cerrarse la firma.</p>
          <p className="fm-hash">{estado.hash}</p>
        </div>
      ))}
    </section>
  );
}
