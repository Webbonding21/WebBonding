/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSave, FiAlertTriangle } from 'react-icons/fi';
import { supabaseR4, ESTADOS, TIPOS } from './r4Api';

const VACIO = {
  nombre: '', tipo: 'juridica', rif: '', representante: '', cedula_representante: '',
  telefono: '', correo: '', direccion: '', actividad: '',
  estado: 'recaudos_pendientes', fecha_envio_r4: '', numero_cuenta: '', notas: '',
};

export default function R4Form({ cliente, onClose, onSaved }) {
  const [f, setF] = useState({ ...VACIO, ...cliente });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    const alTeclear = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onClose]);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true); setError('');
    // Los campos vacíos van como null: una fecha en '' rompe el tipo date.
    const datos = Object.fromEntries(
      Object.entries(f)
        .filter(([k]) => k in VACIO)
        .map(([k, v]) => [k, v === '' ? null : v])
    );
    const { data, error } = f.id
      ? await supabaseR4.from('clientes').update(datos).eq('id', f.id).select('id').single()
      : await supabaseR4.from('clientes').insert(datos).select('id').single();
    if (error) { setError(error.message); setGuardando(false); return; }
    onSaved(data.id, !f.id);
  }

  // Montado en el body: dentro del árbol, los márgenes de los contenedores
  // corren la capa fija y dejan ver el fondo por encima del modal.
  return createPortal(
    <div className="r4-fondo" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="r4-modal" onSubmit={guardar}>
        <div className="r4-modal-cabecera">
          <h2>{f.id ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button type="button" className="r4-btn r4-btn-plano r4-btn-icono" onClick={onClose} aria-label="Cerrar">
            <FiX size={16} />
          </button>
        </div>

        <div className="r4-modal-cuerpo">
          <Campo ancho label="Nombre o razón social" required value={f.nombre} onChange={set('nombre')} />
          <div>
            <label className="r4-etiqueta">Tipo de persona</label>
            <select className="r4-campo" value={f.tipo} onChange={set('tipo')}>
              {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Campo label="RIF" required placeholder="J-12345678-9" value={f.rif} onChange={set('rif')} />
          <Campo label="Representante legal" value={f.representante} onChange={set('representante')} />
          <Campo label="Cédula del representante" value={f.cedula_representante} onChange={set('cedula_representante')} />
          <Campo label="Teléfono" value={f.telefono} onChange={set('telefono')} />
          <Campo label="Correo" type="email" value={f.correo} onChange={set('correo')} />
          <Campo ancho label="Dirección" value={f.direccion} onChange={set('direccion')} />
          <Campo label="Actividad económica" value={f.actividad} onChange={set('actividad')} />
          <div>
            <label className="r4-etiqueta">Estado</label>
            <select className="r4-campo" value={f.estado} onChange={set('estado')}>
              {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <Campo label="Fecha de envío a R4" type="date" value={f.fecha_envio_r4 ?? ''} onChange={set('fecha_envio_r4')} />
          <Campo label="N° de cuenta asignado" value={f.numero_cuenta} onChange={set('numero_cuenta')} />
          <div className="r4-ancho">
            <label className="r4-etiqueta">Notas</label>
            <textarea className="r4-campo" value={f.notas ?? ''} onChange={set('notas')} />
          </div>
          {error && (
            <p className="r4-error r4-ancho"><FiAlertTriangle size={15} /> {error}</p>
          )}
        </div>

        <div className="r4-modal-pie">
          <button type="button" className="r4-btn r4-btn-plano" onClick={onClose}>Cancelar</button>
          <button className="r4-btn r4-btn-primario" disabled={guardando}>
            <FiSave size={16} /> Guardar
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function Campo({ label, ancho, ...props }) {
  return (
    <div className={ancho ? 'r4-ancho' : undefined}>
      <label className="r4-etiqueta">{label}</label>
      <input className="r4-campo" {...props} value={props.value ?? ''} />
    </div>
  );
}
