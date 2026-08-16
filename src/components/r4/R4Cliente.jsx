/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiArrowLeft, FiEdit2, FiUpload, FiFileText, FiTrash2, FiEye, FiAlertTriangle, FiCheck, FiX,
} from 'react-icons/fi';
import { supabaseR4, BUCKET, ESTADOS, TIPOS } from './r4Api';
import R4Form from './R4Form';

export default function R4Cliente({ id, soloLectura, onBack }) {
  const [cliente, setCliente] = useState(null);
  const [docs, setDocs] = useState([]);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const [{ data: c }, { data: d }] = await Promise.all([
      supabaseR4.from('clientes').select('*').eq('id', id).single(),
      supabaseR4.from('documentos').select('*').eq('cliente_id', id).order('created_at'),
    ]);
    setCliente(c); setDocs(d ?? []);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (!cliente) return <p className="r4-cargando">Cargando…</p>;

  const est = ESTADOS[cliente.estado] ?? {};
  const datos = [
    ['RIF', cliente.rif], ['Tipo', TIPOS[cliente.tipo]],
    ['Representante legal', cliente.representante], ['Cédula del representante', cliente.cedula_representante],
    ['Teléfono', cliente.telefono], ['Correo', cliente.correo],
    ['Dirección', cliente.direccion], ['Actividad', cliente.actividad],
    ['Fecha de envío a R4', cliente.fecha_envio_r4],
    ['N° de cuenta', cliente.numero_cuenta],
  ].filter(([, v]) => v);

  return (
    <>
      <div className="r4-titulo">
        <button className="r4-btn r4-btn-plano r4-btn-icono" onClick={onBack} aria-label="Volver">
          <FiArrowLeft size={16} />
        </button>
        <h1>{cliente.nombre}</h1>
        <span className={`r4-chip r4-chip-${est.tono ?? 'neutro'}`}>{est.label ?? cliente.estado}</span>
        {!soloLectura && (
          <button className="r4-btn r4-btn-plano r4-btn-icono" onClick={() => setEditando(true)} aria-label="Editar">
            <FiEdit2 size={16} />
          </button>
        )}
      </div>

      {error && <p className="r4-error"><FiAlertTriangle size={15} /> {error}</p>}

      <dl className="r4-tarjeta r4-datos">
        {datos.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        {cliente.notas && <p className="r4-notas">{cliente.notas}</p>}
      </dl>

      <Documentos cliente={cliente} docs={docs} soloLectura={soloLectura}
                  onCambio={cargar} onError={setError} />

      {editando && (
        <R4Form cliente={cliente} onClose={() => setEditando(false)}
                onSaved={() => { setEditando(false); cargar(); }} />
      )}
    </>
  );
}

function Documentos({ cliente, docs, soloLectura, onCambio, onError }) {
  const input = useRef(null);
  const [pendiente, setPendiente] = useState(null);   // archivo elegido, esperando nombre
  const [nombre, setNombre] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [renombrando, setRenombrando] = useState(null);

  function elegir(file) {
    if (!file) return;
    setPendiente(file);
    setNombre(file.name.replace(/\.[^.]+$/, ''));     // sugerencia: el archivo sin extensión
  }

  async function subir(e) {
    e.preventDefault();
    if (!pendiente || !nombre.trim()) return;
    setOcupado(true); onError('');
    const ext = pendiente.name.split('.').pop();
    const path = `${cliente.id}/${Date.now()}.${ext}`;
    const { error: errUp } = await supabaseR4.storage.from(BUCKET).upload(path, pendiente);
    if (errUp) { onError(errUp.message); setOcupado(false); return; }
    const { error: errDb } = await supabaseR4.from('documentos').insert({
      cliente_id: cliente.id, nombre: nombre.trim(),
      storage_path: path, mime: pendiente.type, tamano: pendiente.size,
    });
    if (errDb) onError(errDb.message);
    setPendiente(null); setNombre(''); setOcupado(false); onCambio();
  }

  async function abrir(doc) {
    const { data, error } = await supabaseR4.storage.from(BUCKET).createSignedUrl(doc.storage_path, 60);
    if (error) return onError(error.message);
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  async function borrar(doc) {
    if (!window.confirm(`¿Eliminar "${doc.nombre}"?`)) return;
    await supabaseR4.storage.from(BUCKET).remove([doc.storage_path]);
    const { error } = await supabaseR4.from('documentos').delete().eq('id', doc.id);
    if (error) onError(error.message);
    onCambio();
  }

  async function renombrar(e, doc) {
    e.preventDefault();
    const nuevo = renombrando.nombre.trim();
    if (nuevo) {
      const { error } = await supabaseR4.from('documentos').update({ nombre: nuevo }).eq('id', doc.id);
      if (error) onError(error.message);
    }
    setRenombrando(null); onCambio();
  }

  return (
    <div className="r4-tarjeta r4-docs">
      <div className="r4-docs-cabecera">
        Documentos
        <span>{docs.length} {docs.length === 1 ? 'archivo' : 'archivos'}</span>
      </div>

      {docs.map(d => (
        <div className="r4-doc" key={d.id}>
          <span className="r4-icono-doc"><FiFileText size={15} /></span>

          {renombrando?.id === d.id ? (
            <form onSubmit={e => renombrar(e, d)}>
              <input autoFocus className="r4-campo" value={renombrando.nombre}
                     onChange={e => setRenombrando({ ...renombrando, nombre: e.target.value })} />
              <button className="r4-btn r4-btn-primario r4-btn-icono" aria-label="Guardar nombre">
                <FiCheck size={15} />
              </button>
              <button type="button" className="r4-btn r4-btn-plano r4-btn-icono"
                      onClick={() => setRenombrando(null)} aria-label="Cancelar">
                <FiX size={15} />
              </button>
            </form>
          ) : (
            <>
              <span className="r4-doc-nombre">{d.nombre}</span>
              {!soloLectura && (
                <button className="r4-btn r4-btn-plano r4-btn-icono" aria-label="Cambiar nombre"
                        onClick={() => setRenombrando({ id: d.id, nombre: d.nombre })}>
                  <FiEdit2 size={15} />
                </button>
              )}
              <button className="r4-btn r4-btn-plano r4-btn-icono" onClick={() => abrir(d)} aria-label="Ver">
                <FiEye size={15} />
              </button>
              {!soloLectura && (
                <button className="r4-btn r4-btn-plano r4-btn-icono r4-btn-peligro"
                        onClick={() => borrar(d)} aria-label="Eliminar">
                  <FiTrash2 size={15} />
                </button>
              )}
            </>
          )}
        </div>
      ))}

      {soloLectura
        ? (docs.length === 0 && <p className="r4-vacio">Este cliente todavía no tiene documentos.</p>)
        : pendiente ? (
          <form className="r4-nombrar" onSubmit={subir}>
            <p>Archivo: {pendiente.name}</p>
            <label className="r4-etiqueta">¿Qué documento es?</label>
            <input autoFocus className="r4-campo" value={nombre} onChange={e => setNombre(e.target.value)}
                   placeholder="Ej. RIF, cédula, referencia bancaria…" required />
            <div className="r4-acciones">
              <button type="button" className="r4-btn r4-btn-plano" onClick={() => setPendiente(null)}>Cancelar</button>
              <button className="r4-btn r4-btn-primario" disabled={ocupado}>
                <FiUpload size={16} /> {ocupado ? 'Subiendo…' : 'Agregar'}
              </button>
            </div>
          </form>
        ) : (
          <div className={`r4-soltar${arrastrando ? ' activo' : ''}`}
               onClick={() => input.current?.click()}
               onDragOver={e => { e.preventDefault(); setArrastrando(true); }}
               onDragLeave={() => setArrastrando(false)}
               onDrop={e => { e.preventDefault(); setArrastrando(false); elegir(e.dataTransfer.files?.[0]); }}>
            <span className="r4-icono-doc apagado"><FiUpload size={15} /></span>
            <span>
              <strong>Agregar documento</strong>
              <span>Toca aquí o arrastra el archivo (PDF o foto)</span>
            </span>
          </div>
        )}

      <input ref={input} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp"
             onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; elegir(f); }} />
    </div>
  );
}
