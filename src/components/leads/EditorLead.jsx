// Crear un lead a mano (uno que escribió por WhatsApp, un referido…) o corregir los datos de uno que ya está. Usa el mismo
// panel lateral y los mismos campos del editor de /admin. Las notas de un lead que ya existe se escriben en su ficha.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import Control from '../admin/Campos';
import { Embudo } from './Estado';
import { FUENTES, TIPOS } from './datos';

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIPO = {
  k: 'tipo', t: 'Qué pide', tipo: 'etiqueta', max: 80, otra: 'Otro', ejemploOtra: 'Marketing y redes',
  opciones: Object.values(TIPOS).map((x) => ({ valor: x.valor, b: x.t, t: x.valor })),
};
const CAMPOS = {
  nombre: { k: 'nombre', t: 'Nombre', tipo: 'texto', max: 120, ejemplo: 'María Pérez' },
  correo: { k: 'correo', t: 'Correo', tipo: 'texto', max: 160, ejemplo: 'maria@correo.com' },
  adicional: { k: 'adicional', t: 'Lo que pidió', tipo: 'largo', max: 2000, filas: 3, ejemplo: 'Tiene una pizzería y quiere tomar pedidos por una app.' },
  notas: { k: 'notas', t: 'Notas del equipo', tipo: 'largo', max: 2000, filas: 3, ejemplo: 'Le escribí por WhatsApp; espera la propuesta el lunes.' },
  novedades: { k: 'acepta_novedades', t: 'Novedades', tipo: 'si_no', ayuda: 'Quiere recibir ofertas y novedades.' },
};

function revisar(d) {
  const e = {};
  const nombre = d.nombre.trim();
  if (nombre.length < 2) e.nombre = 'Escribe el nombre (al menos 2 letras).';
  const digitos = d.telefono.replace(/\D/g, '');
  if (digitos.length < 7 || digitos.length > 15 || d.telefono.trim().length > 30) e.telefono = 'Revisa el teléfono: de 7 a 15 números, como 0412 123 4567.';
  if (d.correo.trim() && !CORREO.test(d.correo.trim())) e.correo = 'Ese correo no se ve bien.';
  if (!d.tipo.trim()) e.tipo = 'Elige qué pide.';
  return e;
}

export default function EditorLead({ lead = null, onGuardar, onCerrar }) {
  const nuevo = !lead;
  const [d, setD] = useState(() => ({
    nombre: lead?.nombre ?? '', telefono: lead?.telefono ?? '', correo: lead?.correo ?? '', tipo: lead?.tipo ?? '',
    estado: lead?.estado ?? 'nuevo', utm_source: lead?.utm_source?.toLowerCase() ?? (nuevo ? 'whatsapp' : ''),
    adicional: lead?.adicional ?? '', notas: '', acepta_novedades: lead?.acepta_novedades ?? false,
  }));
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);
  const caja = useRef(null);

  const poner = (k, v) => { setD((x) => ({ ...x, [k]: v })); setTocado(true); if (errores[k]) setErrores((x) => ({ ...x, [k]: '' })); };

  const salir = () => { if (!tocado || window.confirm('¿Salir sin guardar los cambios?')) onCerrar(); };

  async function guardar(e) {
    e?.preventDefault();
    if (guardando) return;
    const malos = revisar(d);
    setErrores(malos);
    if (Object.keys(malos).length) {
      caja.current?.querySelector(`#ld-ed-${Object.keys(malos)[0]}`)?.focus();
      return;
    }
    const datos = {
      nombre: d.nombre.trim(), telefono: d.telefono.trim(), correo: d.correo.trim().toLowerCase() || null, tipo: d.tipo.trim(),
      estado: d.estado, utm_source: d.utm_source || null, adicional: d.adicional.trim() || null, acepta_novedades: Boolean(d.acepta_novedades),
    };
    if (nuevo) datos.notas = d.notas.trim() || null; // en uno que ya existe, las notas se escriben en su ficha
    setGuardando(true);
    setError('');
    try {
      await onGuardar(datos);
      setTocado(false);
    } catch (err) {
      setError(err.message === 'No autorizado' ? 'Tu usuario no puede cargar leads: hace falta el rol de ventas o de administrador.' : err.message);
      setGuardando(false);
    }
  }

  const guardarRef = useRef(guardar);
  guardarRef.current = guardar;
  const salirRef = useRef(salir);
  salirRef.current = salir;
  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); salirRef.current(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); guardarRef.current(); }
    };
    document.addEventListener('keydown', tecla);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', tecla); document.body.style.overflow = previo; };
  }, []);

  // de dónde llegó: las de siempre y, si el lead trae otra (una campaña), esa también
  const fuentes = { ...FUENTES, ...(d.utm_source && !FUENTES[d.utm_source] ? { [d.utm_source]: d.utm_source } : {}) };
  const campo = (c, control, opcional = false, ayuda = '') => (
    <div className={`pn-campo${errores[c.k] ? ' is-error' : ''}`}>
      <label className="pn-campo__nombre" htmlFor={`ld-ed-${c.k}`}>{c.t}{opcional && <span className="pn-opcional"> (opcional)</span>}</label>
      {ayuda && <p className="pn-campo__ayuda">{ayuda}</p>}
      {control}
      {errores[c.k] && <p className="pn-campo__error" role="alert">{errores[c.k]}</p>}
    </div>
  );

  return createPortal(
    <div className="pn-panel-fondo" onMouseDown={(e) => e.target === e.currentTarget && salir()}>
      <form ref={caja} className="pn-panel" role="dialog" aria-modal="true" aria-label={nuevo ? 'Nuevo lead' : `Editar a ${lead.nombre}`}
        onSubmit={guardar} noValidate>
        <header className="pn-panel__cab">
          <div>
            <span>{nuevo ? 'Leads' : 'Editar datos'}</span>
            <h2>{nuevo ? 'Nuevo lead' : lead.nombre}</h2>
          </div>
          <button type="button" className="pn-ico" aria-label="Cerrar" onClick={salir}><FiX aria-hidden="true" /></button>
        </header>

        <div className="pn-panel__cuerpo">
          {nuevo && <p className="pn-nota pn-nota--arriba">Para los que te escriben por WhatsApp, los referidos o los que conoces en persona: quedan junto a los del formulario.</p>}
          <div className="pn-campos">
            {campo(CAMPOS.nombre, <Control campo={CAMPOS.nombre} id="ld-ed-nombre" valor={d.nombre} poner={(v) => poner('nombre', v)} />)}
            <div className={`pn-campo pn-campo--medio${errores.telefono ? ' is-error' : ''}`}>
              <label className="pn-campo__nombre" htmlFor="ld-ed-telefono">Teléfono</label>
              <input id="ld-ed-telefono" className="ld-campo" type="tel" inputMode="tel" autoComplete="off" maxLength={30} placeholder="0412 123 4567"
                value={d.telefono} onChange={(e) => poner('telefono', e.target.value)} />
              {errores.telefono && <p className="pn-campo__error" role="alert">{errores.telefono}</p>}
            </div>
            <div className={`pn-campo pn-campo--medio${errores.correo ? ' is-error' : ''}`}>
              <label className="pn-campo__nombre" htmlFor="ld-ed-correo">Correo<span className="pn-opcional"> (opcional)</span></label>
              <input id="ld-ed-correo" className="ld-campo" type="email" inputMode="email" autoComplete="off" maxLength={160} placeholder="maria@correo.com"
                value={d.correo} onChange={(e) => poner('correo', e.target.value)} />
              {errores.correo && <p className="pn-campo__error" role="alert">{errores.correo}</p>}
            </div>
            {campo(TIPO, <Control campo={TIPO} id="ld-ed-tipo" valor={d.tipo} poner={(v) => poner('tipo', v)} />)}
            <div className="pn-campo">
              <span className="pn-campo__nombre">En qué va</span>
              <Embudo estado={d.estado} onCambiar={(v) => poner('estado', v)} />
            </div>
            <div className="pn-campo pn-campo--medio">
              <label className="pn-campo__nombre" htmlFor="ld-ed-utm_source">De dónde llegó</label>
              <select id="ld-ed-utm_source" className="ld-campo" value={d.utm_source} onChange={(e) => poner('utm_source', e.target.value)}>
                <option value="">Sin dato (directo)</option>
                {Object.entries(fuentes).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </div>
            {campo(CAMPOS.adicional, <Control campo={CAMPOS.adicional} id="ld-ed-adicional" valor={d.adicional} poner={(v) => poner('adicional', v)} />, true,
              nuevo ? '' : 'Lo que escribió en el formulario. Puedes completarlo.')}
            {nuevo && campo(CAMPOS.notas, <Control campo={CAMPOS.notas} id="ld-ed-notas" valor={d.notas} poner={(v) => poner('notas', v)} />, true)}
            <div className="pn-campo">
              <span className="pn-campo__nombre">{CAMPOS.novedades.t}</span>
              <Control campo={CAMPOS.novedades} id="ld-ed-acepta_novedades" valor={d.acepta_novedades} poner={(v) => poner('acepta_novedades', v)} />
            </div>
          </div>
        </div>

        <footer className="pn-panel__pie">
          {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
          <div className="pn-panel__botones">
            <span className="pn-panel__espacio" />
            <button type="button" className="ld-btn pn-panel__cancelar" onClick={salir}>Cancelar</button>
            <button type="submit" className="ld-btn ld-btn--primario" disabled={guardando}>
              <FiCheck aria-hidden="true" /> {guardando ? 'Guardando…' : nuevo ? 'Crear el lead' : 'Guardar'}
            </button>
          </div>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
