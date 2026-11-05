/* eslint-disable react/prop-types */
// La lista de una sección del panel /admin, con todo a la mano: buscar, ver solo lo visible u oculto, filtrar (el catálogo
// por categoría), ordenar con las flechas, mostrar u ocultar a un toque, editar (la fila abre su ficha), duplicar y borrar
// con «Deshacer», uno por uno o varios a la vez. Lo guardado sale en la web al momento.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiAlertTriangle, FiArrowDown, FiArrowUp, FiCheck, FiCopy, FiEdit2, FiExternalLink, FiEye, FiEyeOff, FiImage, FiPlus,
  FiRefreshCw, FiSearch, FiTrash2, FiX,
} from 'react-icons/fi';
import { SiInstagram } from 'react-icons/si';
import Editor from './Editor';
import { aCodigo } from './valores';
import {
  borrarContenido, borrarVideos, guardarContenido, guardarVideo, listarContenido, listarVideos, mensajeDeError, mostrarContenido,
  mostrarVideos, ordenarContenido, ordenarVideos,
} from './datos';
import { nuevoNombre } from './secciones';
import { HOURLY_RATE_USD } from '../../data/catalog';
import '../../assets/Portafolio.css';

const FUENTES = {
  contenido: (s) => ({
    listar: () => listarContenido(s.id),
    guardar: (f) => guardarContenido(s.id, f),
    mostrar: (ids, v) => mostrarContenido(s.id, ids, v),
    ordenar: (ids) => ordenarContenido(s.id, ids),
    borrar: (ids) => borrarContenido(s.id, ids),
  }),
  portafolio: () => ({ listar: listarVideos, guardar: guardarVideo, mostrar: mostrarVideos, ordenar: ordenarVideos, borrar: borrarVideos }),
};

const VISTAS = { todos: 'Todos', visibles: 'Visibles', ocultos: 'Ocultos' };
const sinTildes = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const numero = (n) => n.toLocaleString('es-VE');

export default function Coleccion({ seccion, alCambiar }) {
  const fuente = useMemo(() => FUENTES[seccion.fuente](seccion), [seccion]);
  const [filas, setFilas] = useState(null); // null: cargando
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [busca, setBusca] = useState('');
  const [vista, setVista] = useState('todos');
  const [filtro, setFiltro] = useState('');
  const [marcados, setMarcados] = useState(() => new Set());
  const [editando, setEditando] = useState(null); // null · { nuevo: true, datos } · una fila
  const [aviso, setAviso] = useState(null); // { texto, deshacer, id }
  const [tarifa, setTarifa] = useState(seccion.arriba === 'tarifa' ? HOURLY_RATE_USD : null);
  const buscador = useRef(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setFilas(await fuente.listar());
      setError('');
    } catch (err) {
      setError(mensajeDeError(err));
      setFilas((f) => f ?? []);
    }
    setCargando(false);
  }, [fuente]);

  useEffect(() => { setFilas(null); setMarcados(new Set()); setBusca(''); setVista('todos'); setFiltro(''); cargar(); }, [cargar]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), aviso.deshacer ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  // «/» lleva al buscador
  useEffect(() => {
    const tecla = (e) => {
      if (e.key !== '/' || editando || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '')) return;
      e.preventDefault();
      buscador.current?.focus();
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [editando]);

  const avisar = (texto, deshacer = null) => setAviso({ texto, deshacer, id: Date.now() });
  const contexto = { tarifa };
  const nombreDe = (f) => seccion.fila(f.datos, contexto).titulo || seccion.uno;

  // cada cambio se ve al momento; si la base no lo acepta, se vuelve a cargar lo que hay
  const probar = async (accion, texto, deshacer) => {
    setError('');
    try {
      await accion();
      if (texto) avisar(texto, deshacer);
      alCambiar?.();
    } catch (err) {
      setError(mensajeDeError(err));
      cargar();
    }
  };

  const lista = filas ?? [];
  const texto = sinTildes(busca.trim());
  const vistas = lista.filter((f) => {
    if (vista === 'visibles' && !f.visible) return false;
    if (vista === 'ocultos' && f.visible) return false;
    if (filtro && seccion.filtro && f.datos[seccion.filtro.k] !== filtro) return false;
    return !texto || sinTildes(JSON.stringify(f.datos)).includes(texto);
  });
  const filtrando = Boolean(texto || vista !== 'todos' || filtro);
  const cuantos = { todos: lista.length, visibles: lista.filter((f) => f.visible).length, ocultos: lista.filter((f) => !f.visible).length };

  const mover = (f, paso) => {
    const k = lista.indexOf(f);
    const nueva = lista.slice();
    [nueva[k], nueva[k + paso]] = [nueva[k + paso], nueva[k]];
    setFilas(nueva);
    probar(() => fuente.ordenar(nueva.map((x) => x.id)));
  };

  const mostrar = (elegidas, visible) => {
    const ids = elegidas.filter((f) => f.visible !== visible).map((f) => f.id);
    if (!ids.length) return;
    setFilas((l) => l.map((x) => (ids.includes(x.id) ? { ...x, visible } : x)));
    const que = ids.length === 1 ? `«${nombreDe(elegidas.find((f) => f.id === ids[0]))}»` : `${ids.length} elementos`;
    probar(() => fuente.mostrar(ids, visible), visible ? `${que} ya ${ids.length === 1 ? 'sale' : 'salen'} en la web.` : `${que} ${ids.length === 1 ? 'quedó oculto' : 'quedaron ocultos'}: no ${ids.length === 1 ? 'sale' : 'salen'} en la web.`,
      () => probar(async () => { await fuente.mostrar(ids, !visible); await cargar(); }));
  };

  // se borran y se pueden recuperar con «Deshacer» (vuelven a su lugar)
  const borrar = (elegidas) => {
    const que = elegidas.length === 1 ? `«${nombreDe(elegidas[0])}»` : `${elegidas.length} elementos`;
    const extra = seccion.fuente === 'portafolio' ? '\nLos videos siguen en Instagram.' : '';
    if (!window.confirm(`¿Borrar ${que}?\nSale de la web al momento.${extra}`)) return;
    const antes = lista.slice();
    const ids = elegidas.map((f) => f.id);
    setFilas((l) => l.filter((x) => !ids.includes(x.id)));
    setMarcados(new Set());
    setEditando(null);
    const deshacer = () => probar(async () => {
      const nuevos = {};
      for (const f of elegidas) nuevos[f.id] = await fuente.guardar({ datos: f.datos, visible: f.visible, orden: f.orden });
      await fuente.ordenar(antes.map((f) => nuevos[f.id] ?? f.id));
      await cargar();
    }, elegidas.length === 1 ? `${que} volvió.` : `Volvieron ${que}.`);
    probar(() => fuente.borrar(ids), `Borraste ${que}.`, deshacer);
  };

  // una copia justo debajo, oculta para revisarla antes de mostrarla
  const duplicar = (f) => probar(async () => {
    const datos = JSON.parse(JSON.stringify(f.datos));
    const principal = seccion.campos.find((c) => c.tipo === 'texto' && c.req);
    if (principal) datos[principal.k] = `${datos[principal.k]} (copia)`.slice(0, principal.max ?? 200);
    seccion.campos.filter((c) => c.tipo === 'codigo' || c.tipo === 'instagram').forEach((c) => {
      datos[c.k] = c.tipo === 'codigo' ? aCodigo(`${datos[c.k]}-copia`) : '';
    });
    if (seccion.fuente === 'portafolio') { setEditando({ nuevo: true, datos, visible: false }); return; } // el enlace no se repite: lo pega él
    const id = await fuente.guardar({ datos, visible: false });
    const orden = lista.map((x) => x.id);
    orden.splice(orden.indexOf(f.id) + 1, 0, id);
    await fuente.ordenar(orden);
    await cargar();
    setEditando(null);
  }, seccion.fuente === 'portafolio' ? '' : `Quedó una copia de «${nombreDe(f)}» debajo, oculta.`);

  const guardar = async (f) => {
    const id = await fuente.guardar(f);
    await cargar();
    avisar(f.id ? `Guardaste «${seccion.fila(f.datos, contexto).titulo}».` : `Listo: «${seccion.fila(f.datos, contexto).titulo}» ${f.visible ? 'ya sale en la web' : 'quedó guardado, oculto'}.`);
    alCambiar?.();
    return id;
  };

  const marcar = (id) => setMarcados((m) => {
    const s = new Set(m);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const todos = vistas.length > 0 && vistas.every((f) => marcados.has(f.id));
  const elegidas = lista.filter((f) => marcados.has(f.id));
  const iniciales = Object.fromEntries(seccion.campos.filter((c) => c.inicial !== undefined).map((c) => [c.k, c.inicial]));
  // la columna de la miniatura y la del dato de la derecha (el precio) solo van si alguna fila las usa
  const conMini = vistas.some((f) => Object.keys(seccion.fila(f.datos, contexto).mini ?? {}).length > 0);
  const conExtra = vistas.some((f) => Boolean(seccion.fila(f.datos, contexto).extra));

  return (
    <div className="pn-coleccion">
      <div className="pn-cab">
        <div>
          <h1>{seccion.nombre}</h1>
          <p>
            {seccion.descripcion}{' '}
            {seccion.donde && <a href={seccion.donde} target="_blank" rel="noopener noreferrer">Ver en la web <FiExternalLink aria-hidden="true" /></a>}
          </p>
        </div>
        <button type="button" className="ld-btn ld-btn--primario pn-nuevo" onClick={() => setEditando({ nuevo: true, datos: iniciales })}>
          <FiPlus aria-hidden="true" /> {nuevoNombre(seccion)}
        </button>
      </div>

      {seccion.arriba === 'tarifa' && <Tarifa tarifa={tarifa} setTarifa={setTarifa} avisar={avisar} alCambiar={alCambiar} />}

      <div className="pn-barra">
        <label className="ld-buscar">
          <FiSearch aria-hidden="true" />
          <input ref={buscador} type="search" placeholder={`Buscar en ${seccion.nombre.toLowerCase()}`} value={busca} onChange={(e) => setBusca(e.target.value)} />
          {busca
            ? <button type="button" className="ld-buscar__borrar" onClick={() => setBusca('')} aria-label="Borrar la búsqueda"><FiX aria-hidden="true" /></button>
            : <kbd className="ld-buscar__tecla" aria-hidden="true">/</kbd>}
        </label>
        <div className="pn-vistas" role="tablist" aria-label="Qué mostrar">
          {Object.entries(VISTAS).map(([k, t]) => (
            <button key={k} type="button" role="tab" aria-selected={vista === k} onClick={() => setVista(k)}>{t} <b>{numero(cuantos[k])}</b></button>
          ))}
        </div>
        {seccion.filtro && (
          <select className="ld-campo pn-filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label={seccion.filtro.t}>
            <option value="">{`Toda ${seccion.filtro.t.toLowerCase()}`}</option>
            {seccion.filtro.opciones.map(([v, t]) => (
              <option key={v} value={v}>{t} ({lista.filter((f) => f.datos[seccion.filtro.k] === v).length})</option>
            ))}
          </select>
        )}
        <button type="button" className="pn-ico" onClick={cargar} aria-label="Actualizar" title="Actualizar" disabled={cargando}>
          <FiRefreshCw aria-hidden="true" className={cargando ? 'ld-girando' : ''} />
        </button>
      </div>

      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}

      {filas === null ? <p className="pn-nota">Cargando…</p> : !lista.length ? (
        <div className="pn-vacio">
          <b>Todavía no hay nada aquí.</b>
          <p>Lo que agregues sale en la web apenas lo guardes.</p>
          <button type="button" className="ld-btn ld-btn--primario" onClick={() => setEditando({ nuevo: true, datos: iniciales })}>
            <FiPlus aria-hidden="true" /> {nuevoNombre(seccion)}
          </button>
        </div>
      ) : !vistas.length ? (
        <div className="pn-vacio">
          <b>Nada coincide.</b>
          <button type="button" className="ld-btn" onClick={() => { setBusca(''); setVista('todos'); setFiltro(''); }}>Ver todo</button>
        </div>
      ) : (
        <>
          {filtrando && <p className="pn-nota">Viendo {numero(vistas.length)} de {numero(lista.length)}. Para ordenar, quita la búsqueda y los filtros.</p>}
          <ul className={`pn-tabla${conMini ? '' : ' pn-tabla--sin-mini'}${conExtra ? ' pn-tabla--con-extra' : ''}`} aria-busy={cargando}>
            <li className="pn-tabla__cab" aria-hidden="true">
              <input type="checkbox" checked={todos} tabIndex={-1}
                onChange={() => setMarcados(todos ? new Set() : new Set(vistas.map((f) => f.id)))} />
              <span className="pn-tabla__n">#</span><span /><span>{seccion.uno.charAt(0).toUpperCase() + seccion.uno.slice(1)}</span><span />
              <span className="pn-tabla__vis">En la web</span><span>Orden</span><span />
            </li>
            {vistas.map((f) => {
              const v = seccion.fila(f.datos, contexto);
              const k = lista.indexOf(f);
              return (
                <li key={f.id} className={`pn-tabla__fila${f.visible ? '' : ' is-oculto'}${marcados.has(f.id) ? ' is-marcada' : ''}`}
                  onClick={() => setEditando(f)}>
                  <input type="checkbox" checked={marcados.has(f.id)} onClick={(e) => e.stopPropagation()} onChange={() => marcar(f.id)}
                    aria-label={`Seleccionar ${v.titulo}`} />
                  <span className="pn-tabla__n">{String(k + 1).padStart(2, '0')}</span>
                  <Mini mini={v.mini} />
                  <button type="button" className="pn-tabla__txt" onClick={(e) => { e.stopPropagation(); setEditando(f); }}>
                    <b>{v.titulo || <em>Sin título</em>}</b>
                    {v.sub && <span>{v.sub}</span>}
                    {(v.chips?.length > 0 || v.enlace) && (
                      <span className="pn-chips-fila">
                        {v.enlace && <i className="pn-chip-ig"><SiInstagram aria-hidden="true" /> {v.enlace.texto}</i>}
                        {v.chips?.map((c) => <i key={c}>{c}</i>)}
                      </span>
                    )}
                  </button>
                  <span className="pn-tabla__extra">{v.extra}</span>
                  <span className="pn-tabla__vis" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className={`pn-vis${f.visible ? ' is-on' : ''}`} aria-pressed={f.visible} onClick={() => mostrar([f], !f.visible)}
                      title={f.visible ? 'Ocultarlo de la web' : 'Mostrarlo en la web'}>
                      {f.visible ? <><FiEye aria-hidden="true" /> <span className="pn-vis__txt">Visible</span></> : <><FiEyeOff aria-hidden="true" /> <span className="pn-vis__txt">Oculto</span></>}
                    </button>
                  </span>
                  <span className="pn-tabla__orden" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="pn-ico pn-ico--chico" aria-label={`Subir ${v.titulo}`} disabled={filtrando || k === 0} onClick={() => mover(f, -1)}>
                      <FiArrowUp aria-hidden="true" />
                    </button>
                    <button type="button" className="pn-ico pn-ico--chico" aria-label={`Bajar ${v.titulo}`} disabled={filtrando || k === lista.length - 1} onClick={() => mover(f, 1)}>
                      <FiArrowDown aria-hidden="true" />
                    </button>
                  </span>
                  <span className="pn-tabla__acc" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="pn-ico pn-ico--chico" aria-label={`Editar ${v.titulo}`} title="Editar" onClick={() => setEditando(f)}><FiEdit2 aria-hidden="true" /></button>
                    <button type="button" className="pn-ico pn-ico--chico" aria-label={`Duplicar ${v.titulo}`} title="Duplicar" onClick={() => duplicar(f)}><FiCopy aria-hidden="true" /></button>
                    <button type="button" className="pn-ico pn-ico--chico pn-ico--quitar" aria-label={`Borrar ${v.titulo}`} title="Borrar" onClick={() => borrar([f])}><FiTrash2 aria-hidden="true" /></button>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {elegidas.length > 0 && (
        <div className="ld-masivo pn-masivo" role="region" aria-label="Acciones con los seleccionados">
          <b>{elegidas.length} {elegidas.length === 1 ? 'seleccionado' : 'seleccionados'}</b>
          <button type="button" className="ld-masivo__btn" onClick={() => { mostrar(elegidas, true); setMarcados(new Set()); }}><FiEye aria-hidden="true" /> Mostrar</button>
          <button type="button" className="ld-masivo__btn" onClick={() => { mostrar(elegidas, false); setMarcados(new Set()); }}><FiEyeOff aria-hidden="true" /> Ocultar</button>
          <button type="button" className="ld-masivo__btn pn-masivo__borrar" onClick={() => borrar(elegidas)}><FiTrash2 aria-hidden="true" /> Borrar</button>
          <button type="button" className="ld-masivo__quitar" onClick={() => setMarcados(new Set())} aria-label="Quitar la selección"><FiX aria-hidden="true" /></button>
        </div>
      )}

      {aviso && (
        <div className={`ld-toast${elegidas.length ? ' ld-toast--arriba' : ''}`} role="status" key={aviso.id}>
          <FiCheck aria-hidden="true" /> <span>{aviso.texto}</span>
          {aviso.deshacer && <button type="button" onClick={() => { aviso.deshacer(); setAviso(null); }}>Deshacer</button>}
        </div>
      )}

      {editando && (
        <Editor key={editando.id ?? 'nuevo'} seccion={seccion} contexto={contexto}
          fila={editando.nuevo ? { datos: editando.datos, visible: editando.visible ?? true } : editando}
          otros={lista.filter((f) => f.id !== editando.id)}
          onGuardar={guardar} onDuplicar={duplicar} onBorrar={(f) => borrar([f])} onCerrar={() => setEditando(null)} />
      )}
    </div>
  );
}

// la miniatura de cada fila: portada 9:16, captura de teléfono, foto, color o un texto corto
function Mini({ mini = {} }) {
  if ('vertical' in mini) return <span className="pn-mini pn-mini--vertical">{mini.vertical ? <img src={mini.vertical} alt="" loading="lazy" /> : <SiInstagram aria-hidden="true" />}</span>;
  if ('telefono' in mini) return <span className="pn-mini pn-mini--vertical">{mini.telefono ? <img src={mini.telefono} alt="" loading="lazy" /> : <FiImage aria-hidden="true" />}</span>;
  if ('imagen' in mini) return <span className="pn-mini">{mini.imagen ? <img src={mini.imagen} alt="" loading="lazy" /> : <FiImage aria-hidden="true" />}</span>;
  if ('color' in mini) return <span className="pn-mini" style={{ background: mini.color }} />;
  if ('texto' in mini) return <span className="pn-mini pn-mini--texto">{mini.texto}</span>;
  return <span className="pn-mini pn-mini--nada" />;
}

// la tarifa por hora del cotizador (la fila de «ajustes»): el precio de cada producto sale de aquí
function Tarifa({ tarifa, setTarifa, avisar, alCambiar }) {
  const [fila, setFila] = useState(null);
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    listarContenido('ajustes').then((l) => {
      if (!vivo) return;
      const f = l[0] ?? null;
      setFila(f);
      const t = Number(f?.datos?.tarifa_hora) || HOURLY_RATE_USD;
      setTarifa(t);
      setValor(String(t));
    }).catch((err) => vivo && setError(mensajeDeError(err)));
    return () => { vivo = false; };
  }, [setTarifa]);

  const n = Number(String(valor).replace(',', '.'));
  const cambio = Number.isFinite(n) && n > 0 && n !== tarifa;
  const guardar = async (e) => {
    e.preventDefault();
    if (!cambio) return;
    setGuardando(true); setError('');
    try {
      const datos = { ...(fila?.datos ?? {}), tarifa_hora: Math.round(n * 100) / 100 };
      const id = await guardarContenido('ajustes', { id: fila?.id ?? null, datos, visible: true });
      setFila({ ...(fila ?? {}), id, datos, visible: true });
      setTarifa(datos.tarifa_hora);
      avisar(`La tarifa quedó en ${datos.tarifa_hora} USD por hora: los precios del cotizador ya cambiaron.`);
      alCambiar?.();
    } catch (err) { setError(mensajeDeError(err)); }
    setGuardando(false);
  };

  return (
    <form className="pn-tarifa" onSubmit={guardar}>
      <div>
        <b>Tarifa por hora</b>
        <span>El precio de cada producto es horas × tarifa + extras.</span>
      </div>
      <label className="pn-tarifa__campo">
        <input className="ld-campo" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} aria-label="Tarifa por hora en USD" />
        <span>USD / h</span>
      </label>
      <button type="submit" className="ld-btn ld-btn--primario" disabled={!cambio || guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
    </form>
  );
}
