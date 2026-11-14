/* eslint-disable react/prop-types */
// /admin/contratos: los sobres de firma electrónica (webbonding.net/firmar). Un sobre lleva uno o varios PDF y sus
// firmantes; mientras es borrador se cambia todo, y al enviarlo queda fijo: cada documento con su resumen SHA-256 y la
// bitácora encadenada. Desde aquí se reenvía el enlace (o se copia para mandarlo por WhatsApp), se anula, y al final se
// baja el PDF firmado con su constancia y su sello de tiempo. Todo pasa por la función «firmas» (src/lib/firmas.js).
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiAlertTriangle, FiArrowDown, FiArrowLeft, FiArrowUp, FiCheck, FiCopy, FiDownload, FiEdit2, FiFilePlus, FiFileText, FiPlus,
  FiRefreshCw, FiSend, FiSlash, FiTrash2, FiUserPlus, FiX,
} from 'react-icons/fi';
import {
  anularSobre, bajarArchivo, borrarSobre, cerrarSobre, detalleSobre, enviarSobre, fechaHora, guardarSobre, listarSobres,
  recordarFirmante,
} from '../../lib/firmas';
import '../../assets/Contratos.css';

const ESTADOS = {
  borrador: { t: 'Borrador', tono: 'gris' },
  enviado: { t: 'Esperando firmas', tono: 'ambar' },
  completado: { t: 'Firmado por todos', tono: 'verde' },
  anulado: { t: 'Anulado', tono: 'rojo' },
};
const FIRMANTE = {
  pendiente: { t: 'Sin abrir', tono: 'gris' }, visto: { t: 'Lo abrió', tono: 'ambar' },
  firmado: { t: 'Firmó', tono: 'verde' }, rechazado: { t: 'No aceptó', tono: 'rojo' },
};
// quien firma por Web Bonding (datos del documento constitutivo)
const WB = { nombre: 'WILLIAMS JESÚS BRICEÑO CÉSAR', cedula: 'V-31.491.968', correo: 'webbonding21@gmail.com', telefono: '', caracter: 'Director de Web Bonding, C.A.' };
const VACIO = { nombre: '', cedula: '', correo: '', telefono: '', caracter: '' };

export default function Contratos() {
  const [vista, setVista] = useState({ que: 'lista' }); // lista · ver {id} · editar {sobre|null}
  const [aviso, setAviso] = useState('');
  const volver = () => setVista({ que: 'lista' });
  return (
    <div className="ct">
      {aviso && <p className="pn-aviso" role="status"><FiCheck aria-hidden="true" /> {aviso}</p>}
      {vista.que === 'lista' && <Lista abrir={(id) => { setAviso(''); setVista({ que: 'ver', id }); }} nuevo={() => { setAviso(''); setVista({ que: 'editar', d: null }); }} />}
      {vista.que === 'ver' && <Detalle id={vista.id} volver={volver} editar={(d) => setVista({ que: 'editar', d })} avisar={setAviso} />}
      {vista.que === 'editar' && (
        <Editor d={vista.d} volver={() => (vista.d ? setVista({ que: 'ver', id: vista.d.sobre.id }) : volver())}
          listo={(d) => { setAviso('Guardado. Revísalo y, cuando esté bien, envíalo a firmar.'); setVista({ que: 'ver', id: d.sobre.id }); }} />
      )}
    </div>
  );
}

function Chip({ e, mapa = ESTADOS }) {
  const x = mapa[e] ?? { t: e, tono: 'gris' };
  return <span className={`ct-chip is-${x.tono}`}>{x.t}</span>;
}

// ── La lista ─────────────────────────────────────────────────────────────────────────────────────────────────
function Lista({ abrir, nuevo }) {
  const [sobres, setSobres] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [buscar, setBuscar] = useState('');
  const cargar = useCallback(async () => {
    setCargando(true);
    try { setSobres(await listarSobres()); setError(''); } catch (e) { setError(e.message); setSobres((s) => s ?? []); }
    setCargando(false);
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => (sobres ?? []).filter((s) => (filtro === 'todos' || s.estado === filtro)
    && (!buscar || `${s.codigo} ${s.titulo} ${s.nombres ?? ''}`.toLowerCase().includes(buscar.toLowerCase()))), [sobres, filtro, buscar]);

  return (
    <>
      <div className="pn-cab">
        <div>
          <h1>Contratos</h1>
          <p>Sobres para firmar en webbonding.net/firmar: cada firmante entra con su enlace, escribe su cédula, dibuja su firma y
            confirma con un código. Al final llega a todos el PDF firmado con su constancia y su sello de tiempo.</p>
        </div>
        <div className="pn-cab__acc">
          <button type="button" className="pn-ico" onClick={cargar} aria-label="Actualizar" title="Actualizar" disabled={cargando}>
            <FiRefreshCw aria-hidden="true" className={cargando ? 'ld-girando' : ''} />
          </button>
          <button type="button" className="ld-btn ld-btn--primario" onClick={nuevo}><FiPlus aria-hidden="true" /> Nuevo sobre</button>
        </div>
      </div>
      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
      <div className="ct-filtros">
        <input className="ld-campo" type="search" placeholder="Buscar por código, título o firmante" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <select className="ld-campo" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Estado">
          <option value="todos">Todos</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.t}</option>)}
        </select>
      </div>
      {sobres === null ? <p className="pn-nota">Cargando…</p> : !visibles.length ? (
        <div className="ct-vacio">
          <FiFileText aria-hidden="true" />
          <p>{sobres.length ? 'Ningún sobre con ese filtro.' : 'Todavía no hay sobres. Arma el primero con los PDF del contrato y quiénes firman.'}</p>
          {!sobres.length && <button type="button" className="ld-btn ld-btn--primario" onClick={nuevo}><FiPlus aria-hidden="true" /> Nuevo sobre</button>}
        </div>
      ) : (
        <ul className="ct-lista">
          {visibles.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => abrir(s.id)}>
                <span className="ct-lista__cod">{s.codigo}</span>
                <span className="ct-lista__tit"><b>{s.titulo}</b><i>{s.nombres || 'Sin firmantes'}</i></span>
                <span className="ct-lista__prog" title={`${s.firmados} de ${s.firmantes} firmaron`}>
                  <span className="ct-barra"><span style={{ width: `${s.firmantes ? (100 * s.firmados) / s.firmantes : 0}%` }} /></span>
                  {s.firmados}/{s.firmantes}
                </span>
                <span className="ct-lista__est"><Chip e={s.estado} />{s.rechazado && s.estado === 'enviado' && <span className="ct-chip is-rojo">Alguien no aceptó</span>}</span>
                <span className="ct-lista__fecha">{fechaHora(s.completado_en ?? s.enviado_en ?? s.creado_en)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ── Un sobre ─────────────────────────────────────────────────────────────────────────────────────────────────
function Detalle({ id, volver, editar, avisar }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState('');
  const [copiado, setCopiado] = useState('');

  const cargar = useCallback(async () => {
    try { setD(await detalleSobre(id)); setError(''); } catch (e) { setError(e.message); }
  }, [id]);
  useEffect(() => { cargar(); }, [cargar]);

  const hacer = async (que, fn, exito) => {
    setOcupado(que); setError(''); avisar('');
    try {
      const r = await fn();
      if (r?.sobre) setD(r);
      if (r?.errores?.length) setError(`Se envió, pero algunos correos no salieron: ${r.errores.join(' · ')}`);
      else if (exito) avisar(exito);
      return r;
    } catch (e) { setError(e.message); return null; } finally { setOcupado(''); }
  };

  if (!d) return error ? <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p> : <p className="pn-nota">Cargando…</p>;
  const { sobre: s, documentos, firmantes, eventos } = d;
  const faltan = firmantes.filter((f) => f.estado !== 'firmado').length;
  const copiar = async (f) => {
    try { await navigator.clipboard.writeText(f.enlace); setCopiado(f.id); setTimeout(() => setCopiado(''), 2000); } catch { window.prompt('Copia el enlace:', f.enlace); }
  };

  return (
    <>
      <button type="button" className="ld-btn ct-volver" onClick={volver}><FiArrowLeft aria-hidden="true" /> Todos los sobres</button>
      <div className="pn-cab">
        <div>
          <p className="ct-cod">{s.codigo} <Chip e={s.estado} /></p>
          <h1>{s.titulo}</h1>
          <p>{s.en_orden ? 'Firman en orden, uno detrás de otro.' : 'Firman todos a la vez.'} Creado el {fechaHora(s.creado_en)}
            {s.enviado_en && ` · enviado el ${fechaHora(s.enviado_en)}`}{s.completado_en && s.estado === 'completado' && ` · firmado por todos el ${fechaHora(s.completado_en)}`}.</p>
        </div>
        <div className="pn-cab__acc ct-acc">
          {s.estado === 'borrador' && (
            <>
              <button type="button" className="ld-btn" onClick={() => {
                if (window.confirm(`¿Borrar el borrador ${s.codigo}? Se borran también sus PDF.`)) hacer('borrar', () => borrarSobre(s.id)).then((r) => r && volver());
              }} disabled={Boolean(ocupado)}><FiTrash2 aria-hidden="true" /> Borrar</button>
              <button type="button" className="ld-btn" onClick={() => editar(d)}><FiEdit2 aria-hidden="true" /> Editar</button>
              <button type="button" className="ld-btn ld-btn--primario" disabled={Boolean(ocupado) || !documentos.length || !firmantes.length}
                onClick={() => window.confirm(`¿Enviar ${s.codigo} a firmar? ${s.en_orden ? `Le llega el enlace a ${firmantes[0]?.nombre}.` : 'Les llega el enlace a todos.'} Después ya no se cambia.`)
                  && hacer('enviar', () => enviarSobre(s.id), 'Enviado. El enlace salió por correo; también lo puedes copiar para mandarlo por WhatsApp.')}>
                <FiSend aria-hidden="true" /> {ocupado === 'enviar' ? 'Enviando…' : 'Enviar a firmar'}
              </button>
            </>
          )}
          {s.estado === 'enviado' && (
            <>
              {!faltan && (
                <button type="button" className="ld-btn ld-btn--primario" disabled={Boolean(ocupado)} onClick={() => hacer('cerrar', () => cerrarSobre(s.id), 'Listo: se cerró, se selló y les llegó a todos.')}>
                  <FiRefreshCw aria-hidden="true" /> {ocupado === 'cerrar' ? 'Cerrando…' : 'Cerrar de nuevo'}
                </button>
              )}
              <button type="button" className="ld-btn" disabled={Boolean(ocupado)} onClick={() => {
                const motivo = window.prompt(`¿Por qué se anula ${s.codigo}? Les llega a los firmantes que ya tenían el enlace.`);
                if (motivo !== null) hacer('anular', () => anularSobre(s.id, motivo), 'Anulado. Los enlaces ya no sirven.');
              }}><FiSlash aria-hidden="true" /> Anular</button>
            </>
          )}
          {s.estado === 'completado' && (
            <>
              <button type="button" className="ld-btn" onClick={() => bajarArchivo(s.id, 'sello').catch((e) => setError(e.message))}><FiDownload aria-hidden="true" /> Sello (.tsr)</button>
              <button type="button" className="ld-btn ld-btn--primario" onClick={() => bajarArchivo(s.id, 'final').catch((e) => setError(e.message))}><FiDownload aria-hidden="true" /> PDF firmado</button>
            </>
          )}
        </div>
      </div>
      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
      {s.estado === 'borrador' && !d.canales.includes('correo') && (
        <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> Falta configurar el correo de las firmas en Supabase: sin él no salen los enlaces ni los códigos.</p>
      )}
      {s.mensaje && <p className="ct-mensaje">{s.mensaje}</p>}

      {s.estado === 'completado' && (
        <section className="pn-bloque ct-final">
          <h2>El documento firmado</h2>
          <dl className="ct-dl">
            <div><dt>Resumen SHA-256</dt><dd className="ct-hash">{s.final_sha256}</dd></div>
            <div><dt>Páginas</dt><dd>{s.final_paginas} (con la constancia al final)</dd></div>
            <div><dt>Sello de tiempo</dt><dd>{s.sello_tsa}, {fechaHora(s.sello_en)}</dd></div>
          </dl>
        </section>
      )}

      <section className="pn-bloque">
        <h2>Firmantes</h2>
        <ol className="ct-firmantes">
          {firmantes.map((f) => (
            <li key={f.id}>
              <div className="ct-firmantes__quien">
                <b>{f.nombre}</b>
                <span>{f.cedula}{f.caracter ? ` · ${f.caracter}` : ''}</span>
                <span>{f.correo}{f.telefono ? ` · ${f.telefono}` : ''}</span>
                <span className="ct-firmantes__estado">
                  <Chip e={f.estado} mapa={FIRMANTE} />
                  {f.firmado_en ? `el ${fechaHora(f.firmado_en)}${f.firma_ip ? ` · IP ${f.firma_ip}` : ''}`
                    : f.rechazado_en ? `el ${fechaHora(f.rechazado_en)}${f.motivo ? `: «${f.motivo}»` : ''}`
                      : f.visto_en ? `abrió el ${fechaHora(f.visto_en)}` : f.invitado_en ? `enlace enviado el ${fechaHora(f.invitado_en)}` : s.estado === 'enviado' ? 'todavía no le toca' : ''}
                </span>
              </div>
              {f.trazo && <img className="ct-firmantes__trazo" src={f.trazo} alt={`Firma de ${f.nombre}`} />}
              {s.estado === 'enviado' && f.estado !== 'firmado' && f.estado !== 'rechazado' && (
                <div className="ct-firmantes__acc">
                  <button type="button" className="ld-btn" onClick={() => copiar(f)}>
                    {copiado === f.id ? <><FiCheck aria-hidden="true" /> Copiado</> : <><FiCopy aria-hidden="true" /> Copiar enlace</>}
                  </button>
                  {f.toca && (
                    <button type="button" className="ld-btn" disabled={Boolean(ocupado)}
                      onClick={() => hacer(`r${f.id}`, () => recordarFirmante(s.id, f.id), `Le llegó el enlace de nuevo a ${f.correo}.`)}>
                      <FiSend aria-hidden="true" /> {ocupado === `r${f.id}` ? 'Enviando…' : f.invitado_en ? 'Reenviar' : 'Enviar enlace'}
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="pn-bloque">
        <h2>Documentos</h2>
        <ul className="ct-docs">
          {documentos.map((doc) => (
            <li key={doc.id}>
              <FiFileText aria-hidden="true" />
              <span><b>{doc.nombre}</b><i>{doc.paginas} páginas · {(doc.bytes / 1024).toFixed(0)} KB</i><code className="ct-hash">{doc.sha256}</code></span>
              <button type="button" className="pn-ico" title="Descargar" aria-label={`Descargar ${doc.nombre}`} onClick={() => bajarArchivo(s.id, doc.id).catch((e) => setError(e.message))}>
                <FiDownload aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {eventos.length > 0 && (
        <section className="pn-bloque">
          <h2>Bitácora</h2>
          <p className="pn-nota">Cada evento lleva el resumen del anterior: no se cambia ni se borra. Va completa en la constancia del PDF firmado.</p>
          <div className="ct-bitacora">
            {eventos.slice().reverse().map((e) => (
              <div key={e.id} className={`ct-ev is-${e.tipo}`}>
                <span className="ct-ev__hora">{fechaHora(e.creado_en)}</span>
                <span className="ct-ev__texto"><b>{e.quien}</b> {e.texto}</span>
                <span className="ct-ev__ip">{e.ip ?? ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ── Armar o cambiar un borrador ──────────────────────────────────────────────────────────────────────────────
function Editor({ d, volver, listo }) {
  const s = d?.sobre;
  const [codigo, setCodigo] = useState(s?.codigo ?? `WB-${new Date().getFullYear()}-`);
  const [titulo, setTitulo] = useState(s?.titulo ?? '');
  const [mensaje, setMensaje] = useState(s?.mensaje ?? '');
  const [enOrden, setEnOrden] = useState(s?.en_orden ?? true);
  const [firmantes, setFirmantes] = useState(d?.firmantes?.map(({ nombre, cedula, correo, telefono, caracter }) => ({ nombre, cedula, correo, telefono: telefono ?? '', caracter: caracter ?? '' })) ?? [{ ...VACIO }]);
  const [existentes, setExistentes] = useState(d?.documentos ?? []);
  const [quitar, setQuitar] = useState([]);
  const [nuevos, setNuevos] = useState([]); // { archivo, nombre }
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiarF = (i, k, v) => setFirmantes((l) => l.map((f, j) => (j === i ? { ...f, [k]: v } : f)));
  const mover = (i, paso) => setFirmantes((l) => { const c = [...l]; const [x] = c.splice(i, 1); c.splice(i + paso, 0, x); return c; });
  const agregarPdf = (lista) => {
    const pdfs = [...lista].filter((a) => /\.pdf$/i.test(a.name) || a.type === 'application/pdf');
    if (pdfs.length < lista.length) setError('Solo se suben PDF.');
    setNuevos((n) => [...n, ...pdfs.map((a) => ({ archivo: a, nombre: a.name.replace(/\.pdf$/i, '') }))]);
  };
  const tieneWB = firmantes.some((f) => f.correo.trim().toLowerCase() === WB.correo);

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    if (!existentes.length && !nuevos.length) { setError('Sube al menos un PDF.'); return; }
    setGuardando(true);
    try {
      const r = await guardarSobre({ id: s?.id, codigo, titulo, mensaje, en_orden: enOrden, firmantes: firmantes.filter((f) => f.nombre || f.correo || f.cedula), quitar }, nuevos);
      listo(r);
    } catch (err) { setError(err.message); }
    setGuardando(false);
  };

  return (
    <form onSubmit={guardar} className="ct-editor">
      <button type="button" className="ld-btn ct-volver" onClick={volver}><FiArrowLeft aria-hidden="true" /> Volver</button>
      <div className="pn-cab"><div><h1>{s ? `Editar ${s.codigo}` : 'Nuevo sobre'}</h1>
        <p>Mientras sea borrador se cambia todo. Al enviarlo, los PDF y los firmantes quedan fijos.</p></div></div>

      <section className="pn-bloque">
        <h2>El sobre</h2>
        <div className="ct-grid">
          <label className="ct-campo"><span>Código</span>
            <input className="ld-campo" required value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} placeholder="WB-VGO-2026-001" maxLength={40} />
            <i>Mayúsculas, números y guiones. Sale en el correo, en cada página y en la constancia.</i></label>
          <label className="ct-campo"><span>Título</span>
            <input className="ld-campo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Contratos de ViaGO" maxLength={140} /></label>
          <label className="ct-campo ct-campo--ancho"><span>Mensaje para los firmantes <em>(opcional)</em></span>
            <textarea className="ld-campo" rows={3} value={mensaje} onChange={(e) => setMensaje(e.target.value)} maxLength={1500}
              placeholder="Son los tres documentos que conversamos. Cualquier duda me escriben." /></label>
          <label className="ct-switch ct-campo--ancho">
            <input type="checkbox" checked={enOrden} onChange={(e) => setEnOrden(e.target.checked)} />
            <span><b>Firman en orden</b><i>{enOrden ? 'A cada uno le llega el enlace cuando firma el de antes (el orden de la lista de abajo).' : 'A todos les llega el enlace a la vez.'}</i></span>
          </label>
        </div>
      </section>

      <section className="pn-bloque">
        <h2>Documentos</h2>
        <ul className="ct-docs">
          {existentes.map((doc) => (
            <li key={doc.id}><FiFileText aria-hidden="true" /><span><b>{doc.nombre}</b><i>{doc.paginas} páginas · ya subido</i></span>
              <button type="button" className="pn-ico pn-ico--quitar" aria-label={`Quitar ${doc.nombre}`} title="Quitar"
                onClick={() => { setExistentes((l) => l.filter((x) => x.id !== doc.id)); setQuitar((q) => [...q, doc.id]); }}><FiX aria-hidden="true" /></button></li>
          ))}
          {nuevos.map((n, i) => (
            <li key={`${n.archivo.name}-${i}`}><FiFilePlus aria-hidden="true" />
              <span><input className="ld-campo" value={n.nombre} aria-label="Nombre del documento" maxLength={160}
                onChange={(e) => setNuevos((l) => l.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} />
                <i>{(n.archivo.size / 1024).toFixed(0)} KB · se sube al guardar</i></span>
              <button type="button" className="pn-ico pn-ico--quitar" aria-label="Quitar" title="Quitar" onClick={() => setNuevos((l) => l.filter((_, j) => j !== i))}><FiX aria-hidden="true" /></button></li>
          ))}
        </ul>
        <label className="ct-subir">
          <FiFilePlus aria-hidden="true" /> <span>Agregar PDF</span>
          <input type="file" accept="application/pdf,.pdf" multiple onChange={(e) => { agregarPdf(e.target.files); e.target.value = ''; }} />
        </label>
        <p className="pn-nota">En el orden en que van en el PDF firmado. Hasta 15 MB cada uno, sin clave.</p>
      </section>

      <section className="pn-bloque">
        <h2>Firmantes</h2>
        <ol className="ct-ed-firmantes">
          {firmantes.map((f, i) => (
            <li key={i}>
              <div className="ct-ed-firmantes__n">
                <b>{i + 1}</b>
                <button type="button" className="pn-ico pn-ico--chico" disabled={i === 0} onClick={() => mover(i, -1)} aria-label="Subir"><FiArrowUp aria-hidden="true" /></button>
                <button type="button" className="pn-ico pn-ico--chico" disabled={i === firmantes.length - 1} onClick={() => mover(i, 1)} aria-label="Bajar"><FiArrowDown aria-hidden="true" /></button>
              </div>
              <div className="ct-grid">
                <label className="ct-campo ct-campo--ancho"><span>Nombre completo</span><input className="ld-campo" required value={f.nombre} onChange={(e) => cambiarF(i, 'nombre', e.target.value)} placeholder="Como sale en la cédula" /></label>
                <label className="ct-campo"><span>Cédula</span><input className="ld-campo" required value={f.cedula} onChange={(e) => cambiarF(i, 'cedula', e.target.value)} placeholder="V-12.345.678" /></label>
                <label className="ct-campo"><span>Correo</span><input className="ld-campo" type="email" required value={f.correo} onChange={(e) => cambiarF(i, 'correo', e.target.value)} placeholder="nombre@gmail.com" /></label>
                <label className="ct-campo"><span>Teléfono <em>(para el código por WhatsApp)</em></span><input className="ld-campo" value={f.telefono} onChange={(e) => cambiarF(i, 'telefono', e.target.value)} placeholder="+58 412 1234567" /></label>
                <label className="ct-campo"><span>Firma como</span><input className="ld-campo" value={f.caracter} onChange={(e) => cambiarF(i, 'caracter', e.target.value)} placeholder="EL CLIENTE" maxLength={160} /></label>
              </div>
              <button type="button" className="pn-ico pn-ico--quitar" aria-label="Quitar firmante" title="Quitar" disabled={firmantes.length === 1}
                onClick={() => setFirmantes((l) => l.filter((_, j) => j !== i))}><FiTrash2 aria-hidden="true" /></button>
            </li>
          ))}
        </ol>
        <div className="ct-ed-mas">
          <button type="button" className="ld-btn" onClick={() => setFirmantes((l) => [...l, { ...VACIO }])}><FiUserPlus aria-hidden="true" /> Otro firmante</button>
          {!tieneWB && <button type="button" className="ld-btn" onClick={() => setFirmantes((l) => [...l.filter((f) => f.nombre || f.correo), { ...WB }])}><FiUserPlus aria-hidden="true" /> Firma de Web Bonding (Williams)</button>}
        </div>
      </section>

      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
      <div className="ct-ed-pie">
        <button type="button" className="ld-btn" onClick={volver}>Cancelar</button>
        <button type="submit" className="ld-btn ld-btn--primario" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar borrador'}</button>
      </div>
    </form>
  );
}
