/* eslint-disable react/prop-types */
// Los leads dentro del panel /admin (/admin/leads), pensado para muchos leads y para usarlo todo el día: pestañas por
// estado con sus conteos, los que van tarde aparte, filtros que se quedan en la dirección, una fila por lead con su estado
// a un toque, la ficha al lado con atajos de teclado, acciones en grupo y «Deshacer» después de cada cambio.
// Se crean a mano (los que escriben por WhatsApp, los referidos), se editan sus datos y un administrador los puede borrar.
// Los datos y las consultas están en components/leads/datos.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiAlertTriangle, FiAlertCircle, FiRefreshCw, FiSearch, FiX, FiChevronDown, FiCheck, FiArrowRight, FiFileText,
  FiFilter, FiCalendar, FiGlobe, FiBarChart2, FiPlus, FiTrash2,
} from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
import Menu from './Menu';
import Ficha from './Ficha';
import EditorLead from './EditorLead';
import { PastillaEstado } from './Estado';
import {
  CLAVES, ESTADOS, FECHAS, INICIALES, MINUTO, ORDENES, ORIGENES, POR_PAGINA, SIGUIENTE, TIPOS,
  actualizar, atrasado, borrarLeads, consultar, contar, contarTodos, enlaceWhatsApp, fecha, filtrosALaUrl, filtrosDeLaUrl,
  guardarLead, hace, origenDe, primerNombre, tipoCorto,
} from './datos';

const mensajeDeError = (err) => (err.message === 'No autorizado'
  ? 'Tu usuario no tiene permiso para ver los leads: hace falta el rol de ventas o de administrador. Pídeselo a Williams.'
  : `No se pudieron cargar los leads: ${err.message}`);

const numero = (n) => (n ?? 0).toLocaleString('es-VE');

// la hora de «ahora», que se mueve cada minuto para que «hace 5 min» se mantenga al día
function useAhora() {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), MINUTO);
    return () => clearInterval(id);
  }, []);
  return ahora;
}

// un filtro como botón con menú: muestra el valor elegido y se resalta cuando no está en «cualquiera»
function Filtro({ icono: Icono, nombre, opciones, valor, porDefecto, onElegir }) {
  const activo = valor !== porDefecto;
  return (
    <Menu etiqueta={nombre} botonClase={`ld-filtro-btn${activo ? ' is-activo' : ''}`}
      boton={<><Icono aria-hidden="true" /> {activo ? opciones[valor] : nombre} <FiChevronDown aria-hidden="true" /></>}>
      {(cerrar) => (
        <>
          <p className="ld-menu__titulo">{nombre}</p>
          {Object.entries(opciones).map(([v, t]) => (
            <button key={v} type="button" role="menuitemradio" aria-checked={v === valor} className="ld-menu__op"
              onClick={() => { cerrar(); onElegir(v); }}>
              {t}{v === valor && <FiCheck className="ld-menu__marca" aria-hidden="true" />}
            </button>
          ))}
        </>
      )}
    </Menu>
  );
}

export default function PanelLeads({ rol, alCambiar }) {
  const admin = rol === 'admin';
  const ahora = useAhora();
  const [filtros, setFiltros] = useState(filtrosDeLaUrl);
  const [escrito, setEscrito] = useState(() => filtrosDeLaUrl().busca); // se busca al dejar de escribir
  const [filas, setFilas] = useState(null);
  const [total, setTotal] = useState(0);
  const [cuenta, setCuenta] = useState({});
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState(null); // id del lead que se ve en la ficha
  const [editando, setEditando] = useState(null); // null · { nuevo: true } · el lead
  const [marcados, setMarcados] = useState(() => new Set());
  const [nuevos, setNuevos] = useState(0); // leads que llegaron después de la última carga
  const [aviso, setAviso] = useState(null); // { texto, deshacer, id }
  const conocidos = useRef(null);
  const filasRef = useRef(null);
  const buscador = useRef(null);
  filasRef.current = filas;

  useEffect(() => {
    const t = setTimeout(() => setFiltros((f) => (f.busca === escrito ? f : { ...f, busca: escrito })), 350);
    return () => clearTimeout(t);
  }, [escrito]);

  useEffect(() => { filtrosALaUrl(filtros); }, [filtros]);

  // devuelve las filas cargadas (o null si falló)
  const cargar = useCallback(async (pag = 0) => {
    setCargando(true); setError('');
    let cargadas = null;
    try {
      const [res, c] = await Promise.all([consultar(filtros, pag), pag === 0 ? contar(filtros) : null]);
      cargadas = res.filas;
      setFilas((prev) => (pag === 0 ? res.filas : [...(prev ?? []), ...res.filas]));
      setTotal(res.total);
      setPagina(pag);
      if (c) setCuenta(c);
    } catch (err) {
      setError(mensajeDeError(err));
      setFilas((prev) => prev ?? []);
    }
    setCargando(false);
    return cargadas;
  }, [filtros]);

  const recontar = useCallback(() => contar(filtros).then(setCuenta).catch(() => {}), [filtros]);

  useEffect(() => { setMarcados(new Set()); cargar(0); }, [cargar]);

  // cada minuto se revisa si llegaron leads nuevos, sin recargar la lista que se está trabajando
  useEffect(() => {
    let vivo = true;
    const revisar = async () => {
      const n = await contarTodos().catch(() => null);
      if (!vivo || n === null) return;
      if (conocidos.current === null) conocidos.current = n;
      else setNuevos(Math.max(0, n - conocidos.current));
    };
    revisar();
    const id = setInterval(revisar, MINUTO);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  // «/» lleva al buscador, como en Gmail; «n» crea un lead
  useEffect(() => {
    const alTeclear = (e) => {
      if (abierto || editando || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '')) return;
      if (e.key === '/') { e.preventDefault(); buscador.current?.focus(); }
      if (e.key === 'n') { e.preventDefault(); setEditando({ nuevo: true }); }
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto, editando]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), aviso.deshacer ? 7000 : 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const avisar = (texto, deshacer = null) => setAviso({ texto, deshacer, id: Date.now() });

  const verNuevos = async () => {
    conocidos.current = await contarTodos().catch(() => conocidos.current);
    setNuevos(0);
    setFiltros((f) => ({ ...f, estado: 'todos', orden: 'recientes' }));
    cargar(0);
  };

  // los conteos se mueven al momento; la base los confirma en la próxima carga
  const moverCuenta = (lead, de, a) => setCuenta((c) => {
    const n = { ...c, [de]: Math.max(0, (c[de] ?? 1) - 1), [a]: (c[a] ?? 0) + 1 };
    if (atrasado({ ...lead, estado: de }, Date.now())) n.urgentes = Math.max(0, (c.urgentes ?? 1) - 1);
    if (atrasado({ ...lead, estado: a }, Date.now())) n.urgentes = (n.urgentes ?? 0) + 1;
    return n;
  });

  // cambia el estado o las notas: se ve al instante, se deshace si la base no lo acepta y avisa con «Deshacer»
  const guardar = async (id, cambios, { silencioso = false } = {}) => {
    const encontrado = filasRef.current?.find((l) => l.id === id);
    if (!encontrado) return false;
    const antes = { ...encontrado }; // copia: lo que se usa para revertir o deshacer no debe cambiar
    const despues = { ...antes, ...cambios };
    const poner = (l) => setFilas((fs) => fs.map((x) => (x.id === l.id ? l : x)));
    const cambiaEstado = cambios.estado && cambios.estado !== antes.estado;
    poner(despues);
    if (cambiaEstado) moverCuenta(antes, antes.estado, cambios.estado);
    const err = await actualizar(despues);
    if (err) {
      poner(antes);
      if (cambiaEstado) moverCuenta(antes, cambios.estado, antes.estado);
      avisar(`No se guardó el cambio de ${primerNombre(antes.nombre)}: ${err.message}`);
      return false;
    }
    if (cambiaEstado) alCambiar?.();
    if (cambiaEstado && !silencioso) {
      avisar(`${primerNombre(antes.nombre)} pasó a ${ESTADOS[cambios.estado]}`, () => guardar(id, { estado: antes.estado }, { silencioso: true }));
    }
    return true;
  };

  // un lead nuevo, cargado a mano: queda de primero y se abre su ficha
  const crear = async (datos) => {
    const id = await guardarLead(datos);
    if (conocidos.current !== null) conocidos.current += 1; // no es uno que «llegó»
    setEditando(null);
    const cargadas = await cargar(0);
    alCambiar?.();
    if (cargadas?.some((l) => l.id === id)) {
      setAbierto(id);
      avisar(`Listo: ${primerNombre(datos.nombre)} quedó en tus leads.`);
    } else {
      avisar(`Listo: ${primerNombre(datos.nombre)} quedó en tus leads. Con estos filtros no sale en la lista.`);
    }
  };

  // los datos de uno que ya está: se ven al momento y se vuelve a su ficha
  const editar = async (lead, datos) => {
    await guardarLead(datos, lead.id);
    setFilas((fs) => fs.map((x) => (x.id === lead.id ? { ...x, ...datos } : x)));
    setEditando(null);
    setAbierto(lead.id);
    if (datos.estado !== lead.estado) { recontar(); alCambiar?.(); }
    avisar(`Guardaste los datos de ${primerNombre(datos.nombre)}.`);
  };

  // borrar es para siempre (solo un administrador): se pregunta antes
  const borrar = async (leads) => {
    const que = leads.length === 1 ? `a ${leads[0].nombre}` : `${leads.length} leads`;
    if (!window.confirm(`¿Borrar ${que} para siempre?\nNo se puede deshacer. Si solo ya no interesa, mejor pásalo a «Descartado».`)) return;
    const ids = leads.map((l) => l.id);
    try {
      await borrarLeads(ids);
    } catch (err) {
      avisar(err.message === 'No autorizado' ? 'Solo un administrador puede borrar leads.' : `No se borró: ${err.message}`);
      return;
    }
    setAbierto(null);
    setMarcados(new Set());
    setFilas((fs) => fs.filter((x) => !ids.includes(x.id)));
    setTotal((t) => Math.max(0, t - ids.length));
    if (conocidos.current !== null) conocidos.current = Math.max(0, conocidos.current - ids.length);
    recontar();
    alCambiar?.();
    avisar(leads.length === 1 ? `Borraste a ${primerNombre(leads[0].nombre)}.` : `Borraste ${leads.length} leads.`);
  };

  const marcar = (id) => setMarcados((m) => {
    const s = new Set(m);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const todosMarcados = Boolean(filas?.length) && filas.every((l) => marcados.has(l.id));
  const marcarTodos = () => setMarcados(todosMarcados ? new Set() : new Set(filas.map((l) => l.id)));
  const marcarComo = async (estado) => {
    const elegidos = filas.filter((l) => marcados.has(l.id) && l.estado !== estado).map((l) => ({ id: l.id, estado: l.estado }));
    setMarcados(new Set());
    await Promise.all(elegidos.map((l) => guardar(l.id, { estado }, { silencioso: true })));
    if (elegidos.length) {
      avisar(`${elegidos.length} ${elegidos.length === 1 ? 'lead pasó' : 'leads pasaron'} a ${ESTADOS[estado]}`,
        () => Promise.all(elegidos.map((l) => guardar(l.id, { estado: l.estado }, { silencioso: true }))));
    }
  };

  const poner = (cambio) => setFiltros((f) => ({ ...f, ...cambio }));
  const hayFiltros = ['tipo', 'fecha', 'origen', 'busca'].some((k) => filtros[k] !== INICIALES[k]);
  const limpiar = () => { setEscrito(''); setFiltros((f) => ({ ...INICIALES, estado: f.estado, orden: f.orden })); };

  const indice = filas?.findIndex((l) => l.id === abierto) ?? -1;
  const leadAbierto = indice >= 0 ? filas[indice] : null;

  return (
    <div className="ad-leads">
      <div className="ad-cab">
        <div>
          <h1>Leads</h1>
          <p>Los que llenan el formulario de /crea-tu-app y los que cargas tú: en qué va cada uno, tus notas y su WhatsApp a un toque.</p>
        </div>
        <div className="ad-cab__acc">
          <button type="button" className="ad-ico" onClick={() => cargar(0)} aria-label="Actualizar" title="Actualizar" disabled={cargando}>
            <FiRefreshCw aria-hidden="true" className={cargando ? 'ld-girando' : ''} />
          </button>
          <button type="button" className="ld-btn ld-btn--primario ad-nuevo" onClick={() => setEditando({ nuevo: true })} title="Nuevo lead · tecla N">
            <FiPlus aria-hidden="true" /> Nuevo lead
          </button>
        </div>
      </div>

      {nuevos > 0 && (
        <button type="button" className="ld-aviso-nuevos" onClick={verNuevos}>
          {nuevos === 1 ? 'Llegó 1 lead nuevo' : `Llegaron ${nuevos} leads nuevos`} · Ver
        </button>
      )}

      <div className="ld-estados">
        <div className="ld-tabs" role="tablist" aria-label="Estado">
          {['todos', ...CLAVES].map((e) => (
            <button key={e} type="button" role="tab" aria-selected={filtros.estado === e} className={`ld-tab ld-c--${e}`} onClick={() => poner({ estado: e })}>
              {e !== 'todos' && <i aria-hidden="true" />}
              {e === 'todos' ? 'Todos' : ESTADOS[e]}
              <b>{numero(cuenta[e])}</b>
            </button>
          ))}
        </div>
        {(cuenta.urgentes > 0 || filtros.estado === 'urgentes') && (
          <button type="button" className="ld-urgentes" aria-pressed={filtros.estado === 'urgentes'}
            onClick={() => poner({ estado: filtros.estado === 'urgentes' ? 'todos' : 'urgentes' })}>
            <FiAlertCircle aria-hidden="true" /> {numero(cuenta.urgentes)} sin contactar hace más de 1 h
          </button>
        )}
      </div>

      <div className="ld-herramientas">
        <label className="ld-buscar">
          <FiSearch aria-hidden="true" />
          <input ref={buscador} type="search" placeholder="Buscar por nombre, teléfono, correo, notas o campaña"
            value={escrito} onChange={(e) => setEscrito(e.target.value)} />
          {escrito
            ? <button type="button" className="ld-buscar__borrar" onClick={() => setEscrito('')} aria-label="Borrar la búsqueda"><FiX aria-hidden="true" /></button>
            : <kbd className="ld-buscar__tecla" aria-hidden="true">/</kbd>}
        </label>
        <div className="ld-herramientas__filtros">
          <Filtro icono={FiFilter} nombre="Qué pide" porDefecto="" valor={filtros.tipo}
            opciones={{ '': 'Todo lo que piden', ...Object.fromEntries(Object.entries(TIPOS).map(([k, v]) => [k, v.t])) }}
            onElegir={(tipo) => poner({ tipo })} />
          <Filtro icono={FiCalendar} nombre="Fecha" porDefecto="todo" valor={filtros.fecha} opciones={FECHAS} onElegir={(f) => poner({ fecha: f })} />
          <Filtro icono={FiGlobe} nombre="Origen" porDefecto="todos" valor={filtros.origen} opciones={ORIGENES} onElegir={(origen) => poner({ origen })} />
          <Filtro icono={FiBarChart2} nombre="Orden" porDefecto="recientes" valor={filtros.orden} opciones={ORDENES} onElegir={(orden) => poner({ orden })} />
          {hayFiltros && <button type="button" className="ld-limpiar" onClick={limpiar}><FiX aria-hidden="true" /> Limpiar</button>}
        </div>
      </div>

      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}

      {filas === null ? <p className="ld-vacio">Cargando…</p> : !filas.length ? (
        <div className="ld-vacio">
          <p>{cuenta.todos ? 'Ningún lead coincide con estos filtros.' : 'Todavía no ha llegado ningún lead.'}</p>
          {hayFiltros
            ? <button type="button" className="ld-btn" onClick={limpiar}>Quitar los filtros</button>
            : <button type="button" className="ld-btn" onClick={() => setEditando({ nuevo: true })}><FiPlus aria-hidden="true" /> Cargar uno a mano</button>}
        </div>
      ) : (
        <>
          <p className="ld-resumen">
            {numero(total)} {total === 1 ? 'lead' : 'leads'}
            {filas.length < total && ` · viendo ${numero(filas.length)}`}
          </p>
          <ul className="ld-lista" aria-busy={cargando}>
            <li className="ld-fila ld-fila--cabeza" aria-hidden="true">
              <input type="checkbox" checked={todosMarcados} onChange={marcarTodos} tabIndex={-1} />
              <span>Lead</span><span>Teléfono</span><span>Llegó</span><span>Origen</span><span>Estado</span><span />
            </li>
            {filas.map((l) => (
              <Fila key={l.id} lead={l} ahora={ahora} marcado={marcados.has(l.id)} onMarcar={marcar} onAbrir={setAbierto} onGuardar={guardar} />
            ))}
          </ul>
        </>
      )}

      {filas && filas.length < total && (
        <button type="button" className="ld-mas" onClick={() => cargar(pagina + 1)} disabled={cargando}>
          {cargando ? 'Cargando…' : `Cargar ${numero(Math.min(POR_PAGINA, total - filas.length))} más`}
        </button>
      )}

      {marcados.size > 0 && (
        <div className="ld-masivo" role="region" aria-label="Acciones con los seleccionados">
          <b>{marcados.size} {marcados.size === 1 ? 'seleccionado' : 'seleccionados'}</b>
          <span className="ld-masivo__texto">Pasar a</span>
          {CLAVES.map((e) => (
            <button type="button" key={e} className={`ld-masivo__btn ld-c--${e}`} onClick={() => marcarComo(e)}><i aria-hidden="true" /> {ESTADOS[e]}</button>
          ))}
          {admin && (
            <button type="button" className="ld-masivo__btn ad-masivo__borrar" onClick={() => borrar(filas.filter((l) => marcados.has(l.id)))}>
              <FiTrash2 aria-hidden="true" /> Borrar
            </button>
          )}
          <button type="button" className="ld-masivo__quitar" onClick={() => setMarcados(new Set())} aria-label="Quitar la selección"><FiX aria-hidden="true" /></button>
        </div>
      )}

      {aviso && (
        <div className={`ld-toast${marcados.size ? ' ld-toast--arriba' : ''}`} role="status" key={aviso.id}>
          <span>{aviso.texto}</span>
          {aviso.deshacer && <button type="button" onClick={() => { aviso.deshacer(); setAviso(null); }}>Deshacer</button>}
        </div>
      )}

      {leadAbierto && (
        <Ficha lead={leadAbierto} ahora={ahora} posicion={indice + 1} total={total}
          onAnterior={indice > 0 ? () => setAbierto(filas[indice - 1].id) : null}
          onSiguiente={indice < filas.length - 1 ? () => setAbierto(filas[indice + 1].id) : null}
          onCerrar={() => setAbierto(null)} onGuardar={guardar} onAvisar={(t) => avisar(t)}
          onEditar={(l) => { setAbierto(null); setEditando(l); }} onBorrar={admin ? (l) => borrar([l]) : null} />
      )}

      {editando && (
        <EditorLead key={editando.id ?? 'nuevo'} lead={editando.nuevo ? null : editando}
          onGuardar={(datos) => (editando.nuevo ? crear(datos) : editar(editando, datos))}
          onCerrar={() => { if (!editando.nuevo) setAbierto(editando.id); setEditando(null); }} />
      )}
    </div>
  );
}

function Fila({ lead: l, ahora, marcado, onMarcar, onAbrir, onGuardar }) {
  const tarde = atrasado(l, ahora);
  const siguiente = SIGUIENTE[l.estado];
  const detener = (e) => e.stopPropagation();
  return (
    <li className={`ld-fila ld-c--${l.estado}${marcado ? ' is-marcada' : ''}`} onClick={() => onAbrir(l.id)}>
      <input type="checkbox" checked={marcado} onClick={detener} onChange={() => onMarcar(l.id)} aria-label={`Seleccionar a ${l.nombre}`} />
      <button type="button" className="ld-fila__quien" onClick={(e) => { detener(e); onAbrir(l.id); }}>
        <b>{l.nombre}</b>
        <span>
          <em className="ld-tipo">{tipoCorto(l.tipo)}</em>
          {l.notas && <FiFileText className="ld-fila__nota" aria-label="Tiene notas" />}
          {l.adicional && <span className="ld-fila__texto">{l.adicional}</span>}
        </span>
      </button>
      <span className="ld-fila__tel">{l.telefono}</span>
      <span className={`ld-fila__cuando${tarde ? ' is-tarde' : ''}`} title={tarde ? `Sin contactar desde el ${fecha(l.created_at)}` : fecha(l.created_at)}>
        {hace(l.created_at, ahora)}
      </span>
      <span className="ld-fila__origen">{origenDe(l)}</span>
      <div className="ld-fila__estado" onClick={detener}>
        <PastillaEstado estado={l.estado} nombre={l.nombre} onCambiar={(estado) => onGuardar(l.id, { estado })} />
        {siguiente && (
          <button type="button" className={`ld-avanzar ld-c--${siguiente}`} onClick={() => onGuardar(l.id, { estado: siguiente })}
            title={`Pasar a ${ESTADOS[siguiente]}`} aria-label={`Pasar a ${l.nombre} a ${ESTADOS[siguiente]}`}>
            <FiArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
      <a className="ld-fila__wa" href={enlaceWhatsApp(l)} target="_blank" rel="noopener noreferrer" aria-label={`Escribirle a ${l.nombre} por WhatsApp`}
        onClick={(e) => { detener(e); if (l.estado === 'nuevo') onGuardar(l.id, { estado: 'contactado' }); }}>
        <SiWhatsapp aria-hidden="true" />
      </a>
    </li>
  );
}
