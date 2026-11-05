// La ficha para crear o editar un elemento de cualquier sección del panel: todos sus campos a la vista (secciones.js),
// si se ve en la web, y Guardar, Duplicar y Borrar. Al guardar valida, sube las imágenes nuevas y, si salió bien, borra
// del bucket las que ya no usa. Esc cierra (pregunta si hay cambios sin guardar); Ctrl o ⌘ + S guarda.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiCheck, FiCopy, FiExternalLink, FiEye, FiEyeOff, FiTrash2, FiX } from 'react-icons/fi';
import Control from './Campos';
import { aCodigo, clave, pendiente } from './valores';
import { borrarImagen, esDelPanel, mensajeDeError, subirImagen, subirPortada } from './datos';
import { nuevoNombre } from './secciones';
import { codigoDe } from '../../data/portafolio';

const copia = (o) => JSON.parse(JSON.stringify(o));
const vacio = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0);
const DURACION = /^\d{1,2}:[0-5]\d$/;

// las listas de objetos llevan una clave _k para React mientras se editan; no se guarda
function conClaves(d) {
  const n = { ...d };
  Object.keys(n).forEach((k) => {
    if (Array.isArray(n[k])) n[k] = n[k].map((x) => (x && typeof x === 'object' && !pendiente(x) ? { _k: clave(), ...x } : x));
  });
  return n;
}
function sinClaves(v) {
  if (Array.isArray(v)) return v.map(sinClaves);
  if (v && typeof v === 'object' && !pendiente(v)) {
    return Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('_')).map(([k, x]) => [k, sinClaves(x)]));
  }
  return typeof v === 'string' ? v.trim() : v;
}

// lo que pide cada campo; devuelve { campo: 'mensaje' }
function validar(seccion, d, otros) {
  const e = {};
  seccion.campos.forEach((c) => {
    const v = d[c.k];
    if (c.req && vacio(v)) { e[c.k] = c.tipo === 'capturas' ? 'Agrega al menos una pantalla.' : c.tipo === 'lista' ? 'Agrega al menos uno.' : `Falta: ${c.t.toLowerCase()}.`; return; }
    if (vacio(v)) return;
    if (c.max && typeof v === 'string' && v.trim().length > c.max) e[c.k] = `Máximo ${c.max} letras.`;
    if (c.tipo === 'numero' && (!Number.isFinite(v) || (c.min !== undefined && v < c.min) || (c.max !== undefined && v > c.max))) {
      e[c.k] = `Va un número${c.min !== undefined ? ` de ${c.min}` : ''}${c.max !== undefined ? ` a ${c.max.toLocaleString('es-VE')}` : ''}.`;
    }
    if (c.tipo === 'color' && !/^#[0-9a-f]{6}$/i.test(v)) e[c.k] = 'El color va como #2E37FF.';
    if (c.tipo === 'codigo') {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) e[c.k] = 'Solo minúsculas, números y guiones.';
      else if (c.unico && otros.some((o) => o.datos[c.k] === v)) e[c.k] = 'Ya hay otro con ese código.';
    }
    if (c.tipo === 'instagram') {
      const codigo = codigoDe(v);
      if (!codigo) e[c.k] = 'Pega el enlace del video tal cual lo copia Instagram.';
      else if (otros.some((o) => o.datos.codigo === codigo)) e[c.k] = 'Ese video ya está en el portafolio.';
    }
    if (c.tipo === 'enlaces' && v.some((x) => !x.texto?.trim() || !/^https:\/\/\S+\.\S+/.test(x.url ?? ''))) {
      e[c.k] = 'Cada enlace lleva su texto y una dirección que empieza con https://';
    }
    if (c.tipo === 'portada' && d.duracion?.trim() && !DURACION.test(d.duracion.trim())) e[c.k] = 'La duración va como 1:34 (minutos y segundos), o vacía.';
  });
  return e;
}

// las imágenes (enlaces) que usa un elemento
function imagenesDe(seccion, d) {
  return seccion.campos.flatMap((c) => {
    const v = d?.[c.k];
    if (c.tipo === 'imagen' || c.tipo === 'portada') return typeof v === 'string' && v ? [v] : [];
    if (c.tipo === 'capturas') return (v ?? []).map((x) => x.src).filter((s) => typeof s === 'string');
    return [];
  });
}

// sube lo que quedó pendiente y devuelve los datos con los enlaces; `subidas` junta lo subido por si hay que deshacerlo
async function subirPendientes(seccion, d, subidas) {
  const listo = { ...d };
  for (const c of seccion.campos) {
    const v = d[c.k];
    if ((c.tipo === 'imagen' || c.tipo === 'portada') && pendiente(v)) {
      const url = c.tipo === 'portada' ? await subirPortada(v.blob, codigoDe(d.codigo) ?? 'video') : await subirImagen(v.blob, seccion.id, v.nombre);
      subidas.push(url);
      listo[c.k] = url;
    } else if (c.tipo === 'capturas' && Array.isArray(v)) {
      listo[c.k] = [];
      for (const x of v) {
        if (pendiente(x.src)) {
          const url = await subirImagen(x.src.blob, `${seccion.id}/${d.slug || 'app'}`, x.t || x.src.nombre);
          subidas.push(url);
          listo[c.k].push({ ...x, src: url });
        } else listo[c.k].push(x);
      }
    }
  }
  return listo;
}

// los datos tal cual se guardan: sin claves de React, sin espacios de más y con el código de Instagram limpio
function preparar(seccion, d) {
  const n = sinClaves(d);
  seccion.campos.forEach((c) => {
    if (c.tipo === 'instagram') n[c.k] = codigoDe(n[c.k]);
    if (c.tipo === 'lista') n[c.k] = (n[c.k] ?? []).map((x) => x.trim()).filter(Boolean);
    if (c.tipo === 'si_no') n[c.k] = Boolean(n[c.k]);
    if (c.tipo === 'texto' || c.tipo === 'largo') n[c.k] = n[c.k] ?? '';
  });
  return n;
}

export default function Editor({ seccion, fila, otros, contexto, onGuardar, onDuplicar, onBorrar, onCerrar }) {
  const nuevo = !fila?.id;
  const [d, setD] = useState(() => conClaves(copia(fila?.datos ?? {})));
  const [visible, setVisible] = useState(fila?.visible ?? true);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [tocado, setTocado] = useState(false);
  const codigoTocado = useRef(!nuevo);
  const caja = useRef(null);

  const ponerCampo = (k, v) => {
    setD((x) => {
      const n = { ...x, [k]: v };
      // el código sale solo del nombre mientras no se escriba a mano (solo en uno nuevo)
      seccion.campos.forEach((c) => {
        if (c.tipo === 'codigo' && c.desde === k && !codigoTocado.current) n[c.k] = aCodigo(v);
      });
      return n;
    });
    if (seccion.campos.some((c) => c.k === k && c.tipo === 'codigo')) codigoTocado.current = true;
    setTocado(true);
    setError('');
    setErrores((e) => (e[k] ? { ...e, [k]: '' } : e));
  };

  const salir = () => {
    if (tocado && !guardando && !window.confirm('Tienes cambios sin guardar. ¿Salir igual?')) return;
    onCerrar();
  };

  async function guardar(e) {
    e?.preventDefault();
    if (guardando) return;
    const errs = Object.fromEntries(Object.entries(validar(seccion, d, otros)).filter(([, m]) => m));
    if (Object.keys(errs).length) {
      setErrores(errs);
      setError('Revisa lo que está en rojo.');
      const primero = seccion.campos.find((c) => errs[c.k]);
      caja.current?.querySelector(`#ad-campo-${primero.k}`)?.focus();
      return;
    }
    setGuardando(true);
    setError('');
    const subidas = [];
    try {
      const listos = preparar(seccion, await subirPendientes(seccion, d, subidas));
      await onGuardar({ id: fila?.id ?? null, datos: listos, visible });
      // las imágenes que se cambiaron o se quitaron ya no las usa nadie (cada una se sube con nombre propio)
      const siguen = new Set(imagenesDe(seccion, listos));
      imagenesDe(seccion, fila?.datos).filter((u) => esDelPanel(u) && !siguen.has(u)).forEach((u) => borrarImagen(u).catch(() => {}));
      setTocado(false);
      onCerrar();
    } catch (err) {
      subidas.forEach((u) => borrarImagen(u).catch(() => {}));
      setError(mensajeDeError(err));
    }
    setGuardando(false);
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

  const titulo = nuevo ? nuevoNombre(seccion) : (seccion.fila(fila.datos, contexto).titulo || seccion.uno);

  return createPortal(
    <div className="ad-panel-fondo" onMouseDown={(e) => e.target === e.currentTarget && salir()}>
      <form ref={caja} className="ad-panel" role="dialog" aria-modal="true" aria-label={titulo} onSubmit={guardar} noValidate>
        <header className="ad-panel__cab">
          <div>
            <span>{nuevo ? seccion.nombre : `Editar ${seccion.uno}`}</span>
            <h2>{titulo}</h2>
          </div>
          <button type="button" className="ad-ico" aria-label="Cerrar" onClick={salir}><FiX aria-hidden="true" /></button>
        </header>

        <div className="ad-panel__cuerpo">
          <button type="button" role="switch" aria-checked={visible} className={`ad-visible${visible ? ' is-on' : ''}`}
            onClick={() => { setVisible(!visible); setTocado(true); }}>
            {visible ? <FiEye aria-hidden="true" /> : <FiEyeOff aria-hidden="true" />}
            <span><b>{visible ? 'Se ve en la web' : 'Oculto'}</b>{visible ? 'Sale en la página apenas guardes.' : 'Queda guardado, pero no sale en la página.'}</span>
            <i aria-hidden="true" />
          </button>

          <div className="ad-campos">
            {seccion.campos.map((c) => {
              const id = `ad-campo-${c.k}`;
              const sinEtiqueta = c.tipo === 'si_no';
              return (
                <div key={c.k} className={`ad-campo${c.ancho === 'medio' ? ' ad-campo--medio' : ''}${errores[c.k] ? ' is-error' : ''}`}>
                  {!sinEtiqueta && (
                    <label className="ad-campo__nombre" htmlFor={id}>
                      {c.t}{!c.req && <span className="ad-opcional"> (opcional)</span>}
                    </label>
                  )}
                  {sinEtiqueta && <span className="ad-campo__nombre">{c.t}</span>}
                  {c.ayuda && !sinEtiqueta && <p className="ad-campo__ayuda">{c.ayuda}</p>}
                  <Control campo={c} id={id} valor={d[c.k]} d={d} poner={(v) => ponerCampo(c.k, v)} ponerCampo={ponerCampo}
                    setError={setError} otros={otros} />
                  {errores[c.k] && <p className="ad-campo__error" role="alert">{errores[c.k]}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <footer className="ad-panel__pie">
          {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
          <div className="ad-panel__botones">
            {!nuevo && (
              <>
                <button type="button" className="ad-ico ad-ico--quitar" title="Borrar" aria-label={`Borrar ${titulo}`} onClick={() => onBorrar(fila)}>
                  <FiTrash2 aria-hidden="true" />
                </button>
                <button type="button" className="ad-ico" title="Duplicar" aria-label={`Duplicar ${titulo}`}
                  onClick={() => { if (!tocado || window.confirm('Se duplica lo que está guardado, sin tus cambios. ¿Seguir?')) onDuplicar(fila); }}>
                  <FiCopy aria-hidden="true" />
                </button>
              </>
            )}
            {seccion.donde && (
              <a className="ad-ico" href={seccion.donde} target="_blank" rel="noopener noreferrer" title="Ver en la web" aria-label="Ver en la web">
                <FiExternalLink aria-hidden="true" />
              </a>
            )}
            <span className="ad-panel__espacio" />
            <button type="button" className="ld-btn ad-panel__cancelar" onClick={salir}>Cancelar</button>
            <button type="submit" className="ld-btn ld-btn--primario" disabled={guardando}>
              <FiCheck aria-hidden="true" /> {guardando ? 'Guardando…' : nuevo ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
