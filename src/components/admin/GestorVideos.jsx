/* eslint-disable react/prop-types */
// Gestor de los videos de /portafolio (/admin/portafolio). Cada video se agrega paso a paso: el enlace de Instagram (con el
// video a la vista para confirmar que es ese), el título, qué es, la descripción y la portada, que se sube de una imagen o
// se saca de un cuadro del video. En la lista se ordenan, se ocultan o se quitan a un toque, y lo guardado sale en la
// página al momento. Las consultas están en components/admin/datos.js.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertTriangle, FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUp, FiCheck, FiEdit2, FiExternalLink, FiEye, FiEyeOff,
  FiFilm, FiImage, FiPlus, FiTrash2, FiX,
} from 'react-icons/fi';
import { SiInstagram } from 'react-icons/si';
import EmbedInstagram, { IG } from '../EmbedInstagram';
import PortadaVideo from '../PortadaVideo';
import { ETIQUETAS, PLUS, codigoDe } from '../../data/portafolio';
import {
  borrarPortada, guardar, listar, mensajeDeError, mostrar, ordenar, quitar, recortar, subirPortada,
} from './datos';
import '../../assets/Portafolio.css';
import '../../assets/Admin.css';

export default function GestorVideos() {
  const [videos, setVideos] = useState(null); // null: cargando
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [editando, setEditando] = useState(null); // null: cerrado; {}: uno nuevo; un video: cambiarlo
  const [vuelta, setVuelta] = useState(0); // «Agregar otro» empieza el asistente de cero

  const cargar = useCallback(async () => {
    try {
      setVideos(await listar());
      setError('');
    } catch (err) {
      setError(mensajeDeError(err));
      setVideos((v) => v ?? []);
    }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  // los cambios a un toque se ven al momento; si la base dice que no, se vuelve a cargar la lista
  const probar = async (accion, texto) => {
    setAviso(''); setError('');
    try {
      await accion();
      if (texto) setAviso(texto);
    } catch (err) {
      setError(mensajeDeError(err));
      cargar();
    }
  };

  const mover = (k, paso) => {
    const nueva = videos.slice();
    [nueva[k], nueva[k + paso]] = [nueva[k + paso], nueva[k]];
    setVideos(nueva);
    probar(() => ordenar(nueva.map((v) => v.id)));
  };

  const alternar = (v) => {
    setVideos((l) => l.map((x) => (x.id === v.id ? { ...x, visible: !v.visible } : x)));
    probar(() => mostrar(v.id, !v.visible),
      v.visible ? `«${v.titulo}» quedó oculto: ya no sale en la página.` : `«${v.titulo}» ya sale en la página.`);
  };

  const sacar = (v) => {
    if (!window.confirm(`¿Quitar «${v.titulo}» del portafolio?\nEl video sigue en Instagram.`)) return;
    setVideos((l) => l.filter((x) => x.id !== v.id));
    probar(() => quitar(v), `«${v.titulo}» ya no está en el portafolio.`);
  };

  const nuevo = () => { setVuelta((n) => n + 1); setEditando({}); };

  return (
    <main className="ad-contenido">
      <div className="ad-titulo">
        <div>
          <h1>Videos del portafolio</h1>
          <p>
            Pega el enlace de Instagram de cada video. Salen en{' '}
            <a href="/portafolio" target="_blank" rel="noopener noreferrer">webbonding.net/portafolio</a> en este orden.
          </p>
        </div>
        <button type="button" className="ld-btn ld-btn--primario ad-agregar" onClick={nuevo}><FiPlus aria-hidden="true" /> Agregar video</button>
      </div>

      {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
      {aviso && <p className="ad-aviso" role="status"><FiCheck aria-hidden="true" /> {aviso}</p>}

      {videos === null ? <p className="ad-nota">Cargando…</p> : videos.length === 0 ? (
        <div className="ad-vacio">
          <SiInstagram aria-hidden="true" />
          <b>Todavía no hay videos.</b>
          <p>En Instagram, abre el video, toca Compartir y «Copiar enlace». Luego lo pegas aquí.</p>
          <button type="button" className="ld-btn ld-btn--primario" onClick={nuevo}><FiPlus aria-hidden="true" /> Agregar el primero</button>
        </div>
      ) : (
        <ol className="ad-lista">
          {videos.map((v, k) => (
            <li key={v.id} className={`ad-fila${v.visible ? '' : ' is-oculto'}`}>
              <span className="ad-fila__n">{String(k + 1).padStart(2, '0')}</span>
              <span className="ad-mini">{v.portada ? <img src={v.portada} alt="" loading="lazy" /> : <SiInstagram aria-hidden="true" />}</span>
              <div className="ad-fila__txt">
                <b>{v.titulo}</b>
                <span>{v.etiqueta}{v.tipo ? ` · ${v.tipo}` : ''}</span>
                <a href={`${IG}/p/${v.codigo}/`} target="_blank" rel="noopener noreferrer"><SiInstagram aria-hidden="true" /> {v.codigo}</a>
              </div>
              <div className="ad-fila__acc">
                <button type="button" className={`ad-vis${v.visible ? ' is-on' : ''}`} aria-pressed={v.visible} onClick={() => alternar(v)}
                  title={v.visible ? 'Ocultarlo de la página' : 'Mostrarlo en la página'}>
                  {v.visible ? <><FiEye aria-hidden="true" /> Visible</> : <><FiEyeOff aria-hidden="true" /> Oculto</>}
                </button>
                <button type="button" className="ad-ico" aria-label={`Subir ${v.titulo}`} disabled={k === 0} onClick={() => mover(k, -1)}>
                  <FiArrowUp aria-hidden="true" />
                </button>
                <button type="button" className="ad-ico" aria-label={`Bajar ${v.titulo}`} disabled={k === videos.length - 1} onClick={() => mover(k, 1)}>
                  <FiArrowDown aria-hidden="true" />
                </button>
                <button type="button" className="ad-ico" aria-label={`Cambiar ${v.titulo}`} title="Cambiar" onClick={() => setEditando(v)}>
                  <FiEdit2 aria-hidden="true" />
                </button>
                <button type="button" className="ad-ico ad-ico--quitar" aria-label={`Quitar ${v.titulo}`} title="Quitar" onClick={() => sacar(v)}>
                  <FiTrash2 aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {editando && (
        <Asistente key={`${vuelta}-${editando.id ?? 'nuevo'}`} video={editando} videos={videos ?? []}
          cerrar={() => setEditando(null)} otro={nuevo} alGuardar={() => { setAviso(''); cargar(); }} />
      )}
    </main>
  );
}

// ── El asistente: un paso por pantalla ──────────────────────────────────────────────────────────────────────

const PASOS = [
  { k: 'enlace', nombre: 'Enlace' },
  { k: 'titulo', nombre: 'Título' },
  { k: 'etiqueta', nombre: 'Qué es' },
  { k: 'descripcion', nombre: 'Descripción' },
  { k: 'portada', nombre: 'Portada' },
  { k: 'resumen', nombre: 'Revisar' },
];
const RESUMEN = PASOS.length - 1;
const DURACION = /^\d{1,2}:[0-5]\d$/;
const mmss = (s) => { const t = Math.floor(s); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; }; // como los reproductores
const recorte = (t, n = 34) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);

function Asistente({ video, videos, cerrar, otro, alGuardar }) {
  const nuevo = !video.id;
  const [d, setD] = useState(() => ({
    enlace: video.codigo ? `${IG}/p/${video.codigo}/` : '', titulo: video.titulo ?? '', tipo: video.tipo ?? '',
    etiqueta: video.etiqueta ?? '', descripcion: video.descripcion ?? '', duracion: video.duracion ?? '',
    portada: video.portada ?? null, visible: video.visible ?? true,
  }));
  const [paso, setPaso] = useState(nuevo ? 0 : RESUMEN);
  const [alResumen, setAlResumen] = useState(!nuevo); // ya pasó por el resumen: al corregir un paso se vuelve a él
  const [nuevaPortada, setNuevaPortada] = useState(null); // { blob, url }: recortada aquí, se sube al guardar
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);
  const [tocado, setTocado] = useState(false);

  const poner = (cambios) => { setD((x) => ({ ...x, ...cambios })); setTocado(true); setError(''); };
  const codigo = codigoDe(d.enlace);
  const repetido = codigo ? videos.find((x) => x.codigo === codigo && x.id !== video.id) : null;
  const imagen = nuevaPortada?.url ?? d.portada;

  // la portada nueva vive en memoria hasta guardar; al cambiarla o al salir se suelta
  useEffect(() => () => { if (nuevaPortada) URL.revokeObjectURL(nuevaPortada.url); }, [nuevaPortada]);

  const salir = () => {
    if (!listo && tocado && !window.confirm('¿Salir sin guardar este video?')) return;
    cerrar();
  };
  const salirRef = useRef(salir);
  salirRef.current = salir;
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape') salirRef.current(); };
    document.addEventListener('keydown', tecla);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', tecla); document.body.style.overflow = previo; };
  }, []);

  const problema = {
    enlace: !codigo ? 'Pega el enlace del video tal cual lo copia Instagram.'
      : repetido ? `Ese video ya está en el portafolio: «${repetido.titulo}».` : '',
    titulo: d.titulo.trim() ? '' : 'Escribe el título.',
    etiqueta: d.etiqueta.trim() ? '' : 'Elige qué es, o escríbelo.',
    descripcion: '',
    portada: d.duracion.trim() && !DURACION.test(d.duracion.trim()) ? 'La duración va como 1:34 (minutos y segundos), o vacía.' : '',
    resumen: '',
  };

  const avanzar = () => {
    setError('');
    if (alResumen || paso + 1 === RESUMEN) { setAlResumen(true); setPaso(RESUMEN); } else setPaso(paso + 1);
  };
  const seguir = (e) => {
    e.preventDefault();
    const p = problema[PASOS[paso].k];
    if (p) setError(p); else avanzar();
  };
  const ir = (k) => { setError(''); setPaso(k); };

  async function guardarTodo(e) {
    e.preventDefault();
    const malo = PASOS.findIndex(({ k }) => problema[k]);
    if (malo >= 0) { setPaso(malo); setError(problema[PASOS[malo].k]); return; }
    setGuardando(true); setError('');
    let subida = null;
    try {
      let { portada } = d;
      if (nuevaPortada) { subida = await subirPortada(nuevaPortada.blob, codigo); portada = subida; }
      await guardar({
        id: video.id, codigo, titulo: d.titulo.trim(), tipo: d.tipo.trim(), etiqueta: d.etiqueta.trim(),
        descripcion: d.descripcion.trim(), duracion: d.duracion.trim(), portada, visible: d.visible,
      });
      // la portada de antes ya no la usa nadie (cada una se sube con nombre propio)
      if (video.portada && video.portada !== portada) borrarPortada(video.portada).catch(() => {});
      setListo(true);
      alGuardar();
    } catch (err) {
      if (subida) borrarPortada(subida).catch(() => {});
      setError(mensajeDeError(err));
    }
    setGuardando(false);
  }

  // lo ya respondido, como etiquetas que se tocan para corregir
  const respuesta = {
    enlace: codigo ?? '—', titulo: d.titulo.trim() || '—', etiqueta: d.etiqueta.trim() || '—',
    descripcion: d.descripcion.trim() ? recorte(d.descripcion.trim()) : 'Sin descripción',
    portada: imagen ? 'Con portada' : 'Sin portada',
  };
  const hechos = PASOS.slice(0, RESUMEN).map((p, i) => ({ ...p, i })).filter(({ i }) => i !== paso && (alResumen || i < paso));

  const cuerpo = {
    enlace: (
      <>
        <h2>Pega el enlace del video</h2>
        <p>En Instagram, abre el video, toca Compartir y «Copiar enlace». Sirve un reel o una publicación.</p>
        <input className="ld-campo ad-grande" autoFocus inputMode="url" autoComplete="off" spellCheck="false"
          placeholder="https://www.instagram.com/reel/…" aria-label="Enlace de Instagram" value={d.enlace}
          onChange={(e) => poner({ enlace: e.target.value })} />
        {codigo && !repetido && <VistaPrevia codigo={codigo} />}
      </>
    ),
    titulo: (
      <>
        <h2>¿Cómo se llama?</h2>
        <p>Va grande debajo de la portada. Corto: el nombre de la app, de la marca o del negocio.</p>
        <input className="ld-campo ad-grande" autoFocus maxLength={80} placeholder="Ej.: Taquilla" aria-label="Título"
          value={d.titulo} onChange={(e) => poner({ titulo: e.target.value })} />
        <label className="ld-etiqueta" htmlFor="ad-tipo">La línea de abajo <span className="ad-opcional">(opcional)</span></label>
        <input id="ad-tipo" className="ld-campo" maxLength={120} placeholder="Ej.: Reel · Haciendo una app por día, Día 2"
          value={d.tipo} onChange={(e) => poner({ tipo: e.target.value })} />
      </>
    ),
    etiqueta: <Etiqueta valor={d.etiqueta} poner={(etiqueta) => poner({ etiqueta })} elegir={(etiqueta) => { poner({ etiqueta }); avanzar(); }} />,
    descripcion: (
      <>
        <h2>Cuéntalo en una o dos líneas</h2>
        <p>Sale al lado del video cuando alguien lo abre: qué es y para quién. Si no hace falta, sigue.</p>
        <textarea className="ld-campo ad-texto" autoFocus rows={4} maxLength={600} aria-label="Descripción"
          placeholder="Ej.: Para vender las entradas de un evento: cada una lleva su QR y se valida en la puerta."
          value={d.descripcion} onChange={(e) => poner({ descripcion: e.target.value })} />
        <small className="ad-cuenta">{d.descripcion.length} / 600</small>
      </>
    ),
    portada: (
      <ElegirPortada d={d} imagen={imagen} poner={poner} setD={setD} setError={setError}
        usar={(blob) => { setNuevaPortada({ blob, url: URL.createObjectURL(blob) }); setTocado(true); setError(''); }}
        quitarla={() => { setNuevaPortada(null); poner({ portada: null }); }} />
    ),
    resumen: (
      <>
        <h2>{nuevo ? 'Así va a salir' : 'Revisa y guarda'}</h2>
        <div className="ad-resumen">
          <div className="pf-video ad-resumen__tarjeta">
            <PortadaVideo v={{ titulo: d.titulo.trim(), duracion: d.duracion.trim() }} imagen={imagen} />
            <span className="pf-etq">{d.etiqueta}</span>
            <h3>{d.titulo}</h3>
            {d.tipo.trim() && <p>{d.tipo}</p>}
          </div>
          <div>
            <dl className="ad-datos">
              {PASOS.slice(0, RESUMEN).map(({ k, nombre }, i) => (
                <div key={k}>
                  <dt>{nombre}</dt>
                  <dd>{respuesta[k]}</dd>
                  <button type="button" className="ad-cambiar" onClick={() => ir(i)}>Cambiar</button>
                </div>
              ))}
            </dl>
            {d.etiqueta === PLUS && <p className="ad-nota">Sale también en la sección del Plus.</p>}
            <label className="ad-check">
              <input type="checkbox" checked={d.visible} onChange={(e) => poner({ visible: e.target.checked })} />
              Que salga en la página
            </label>
          </div>
        </div>
      </>
    ),
  };

  return createPortal(
    <div className="ad-asis" role="dialog" aria-modal="true" aria-label={nuevo ? 'Agregar un video' : `Cambiar ${video.titulo}`}
      onMouseDown={(e) => e.target === e.currentTarget && salir()}>
      <div className="ad-asis__caja">
        <div className="ad-asis__barra"><span style={{ width: `${listo ? 100 : ((paso + 1) / PASOS.length) * 100}%` }} /></div>
        <div className="ad-asis__cab">
          <span>{listo ? 'Guardado' : `${nuevo ? 'Video nuevo' : 'Cambiar el video'} · paso ${paso + 1} de ${PASOS.length}`}</span>
          <button type="button" className="ad-ico" aria-label="Cerrar" onClick={salir}><FiX aria-hidden="true" /></button>
        </div>

        {listo ? (
          <div className="ad-listo" role="status">
            <span className="ad-listo__ok"><FiCheck aria-hidden="true" /></span>
            <h2>{d.visible ? `Listo: «${d.titulo.trim()}» ya sale en el portafolio.` : `Listo: «${d.titulo.trim()}» quedó guardado y oculto.`}</h2>
            <p>{d.visible ? 'Se ve en webbonding.net/portafolio desde ahora.' : 'Lo muestras cuando quieras desde la lista.'}</p>
            <div className="ad-listo__acc">
              {nuevo && <button type="button" className="ld-btn ld-btn--primario" autoFocus onClick={otro}><FiPlus aria-hidden="true" /> Agregar otro video</button>}
              <button type="button" className="ld-btn" autoFocus={!nuevo} onClick={cerrar}>Ver la lista</button>
              <a className="ld-btn" href="/portafolio" target="_blank" rel="noopener noreferrer">Ver la página <FiExternalLink aria-hidden="true" /></a>
            </div>
          </div>
        ) : (
          <>
            {hechos.length > 0 && paso !== RESUMEN && (
              <div className="ad-chips">
                {hechos.map(({ k, i, nombre }) => (
                  <button type="button" key={k} className="ad-chip" onClick={() => ir(i)}>
                    <span>{nombre}</span> {respuesta[k]}
                  </button>
                ))}
              </div>
            )}
            <form key={paso} className="ad-paso" onSubmit={paso === RESUMEN ? guardarTodo : seguir} noValidate>
              {cuerpo[PASOS[paso].k]}
              {error && <p className="ld-error" role="alert"><FiAlertTriangle aria-hidden="true" /> {error}</p>}
              <div className="ad-pie">
                {paso > 0 && paso !== RESUMEN ? (
                  <button type="button" className="ld-btn" onClick={() => ir(alResumen ? RESUMEN : paso - 1)}>
                    <FiArrowLeft aria-hidden="true" /> {alResumen ? 'Volver al resumen' : 'Atrás'}
                  </button>
                ) : <span />}
                {paso === RESUMEN ? (
                  <button className="ld-btn ld-btn--primario" disabled={guardando}>
                    <FiCheck aria-hidden="true" /> {guardando ? 'Guardando…' : nuevo ? 'Guardar en el portafolio' : 'Guardar los cambios'}
                  </button>
                ) : (
                  <button className="ld-btn ld-btn--primario">{alResumen ? 'Listo' : 'Seguir'} <FiArrowRight aria-hidden="true" /></button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

// el video tal cual sale en Instagram, para confirmar que el enlace es el correcto (espera a que se deje de escribir)
function VistaPrevia({ codigo }) {
  const [visto, setVisto] = useState(null);
  useEffect(() => {
    const t = setTimeout(() => setVisto(codigo), 500);
    return () => clearTimeout(t);
  }, [codigo]);
  if (!visto) return null;
  return (
    <div className="ad-previa">
      <span>Así se ve en Instagram. Si no es este, revisa el enlace.</span>
      <EmbedInstagram className="ad-ig" codigo={visto} titulo="vista previa" />
    </div>
  );
}

// qué es: un toque elige y sigue; «Otra» la escribe él
function Etiqueta({ valor, poner, elegir }) {
  const [propia, setPropia] = useState(() => Boolean(valor) && !ETIQUETAS.some((x) => x.valor === valor));
  return (
    <>
      <h2>¿Qué es?</h2>
      <p>Sale como etiqueta encima del título.</p>
      <div className="ad-opciones">
        {ETIQUETAS.map(({ valor: v, t }) => (
          <button type="button" key={v} className={`ad-op${!propia && valor === v ? ' is-elegida' : ''}`} onClick={() => { setPropia(false); elegir(v); }}>
            <b>{v}</b><span>{t}</span>
          </button>
        ))}
        <button type="button" className={`ad-op${propia ? ' is-elegida' : ''}`}
          onClick={() => { if (!propia) poner(''); setPropia(true); }}>
          <b>Otra</b><span>La escribes tú.</span>
        </button>
      </div>
      {propia && (
        <input className="ld-campo ad-otra" autoFocus maxLength={30} placeholder="Ej.: Flyer animado" aria-label="Qué es"
          value={valor} onChange={(e) => poner(e.target.value)} />
      )}
    </>
  );
}

// la portada: una imagen o un cuadro del video, recortada aquí a 9:16 (540x960). Con el video se llena la duración.
function ElegirPortada({ d, imagen, poner, setD, setError, usar, quitarla }) {
  const deImagen = useRef(null);
  const deVideo = useRef(null);
  const [fuente, setFuente] = useState(null); // el video del que se saca el cuadro

  useEffect(() => () => { if (fuente) URL.revokeObjectURL(fuente); }, [fuente]);

  const alElegirImagen = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    const url = URL.createObjectURL(archivo);
    try {
      const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = url; });
      usar(await recortar(img, img.naturalWidth, img.naturalHeight));
      setFuente(null);
    } catch {
      setError('Esa imagen no se pudo abrir aquí: usa una JPG, PNG o WebP.');
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const alElegirVideo = (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (archivo) { setError(''); setFuente(URL.createObjectURL(archivo)); }
  };

  return (
    <>
      <h2>La portada</h2>
      <p>Es lo que se ve en la grilla antes de darle play. Sube una imagen o saca un cuadro del video. Sin portada, sale el título.</p>
      <div className="ad-portada">
        <div className="pf-video ad-portada__prev">
          <PortadaVideo v={{ titulo: d.titulo.trim() || 'Título', duracion: d.duracion.trim() }} imagen={imagen} />
        </div>
        <div className="ad-portada__op">
          {fuente ? (
            <Cuadro src={fuente} setError={setError}
              alDuracion={(s) => setD((x) => ({ ...x, duracion: x.duracion.trim() || mmss(s) }))}
              usar={(blob) => { usar(blob); setFuente(null); }} cancelar={() => setFuente(null)} />
          ) : (
            <>
              <button type="button" className="ld-btn" onClick={() => deImagen.current.click()}><FiImage aria-hidden="true" /> Subir una imagen</button>
              <button type="button" className="ld-btn" onClick={() => deVideo.current.click()}><FiFilm aria-hidden="true" /> Sacarla del video</button>
              {imagen && <button type="button" className="ad-cambiar ad-sin" onClick={quitarla}>Quitar la portada</button>}
            </>
          )}
          <input ref={deImagen} type="file" accept="image/*" hidden onChange={alElegirImagen} />
          <input ref={deVideo} type="file" accept="video/*" hidden onChange={alElegirVideo} />
          <label className="ld-etiqueta" htmlFor="ad-dur">Duración <span className="ad-opcional">(opcional, como 1:34)</span></label>
          <input id="ad-dur" className="ld-campo ad-dur" inputMode="numeric" autoComplete="off" placeholder="1:34" maxLength={5}
            value={d.duracion} onChange={(e) => poner({ duracion: e.target.value })} />
        </div>
      </div>
    </>
  );
}

// el video en pausa con una barra para elegir el cuadro de la portada
function Cuadro({ src, setError, alDuracion, usar, cancelar }) {
  const video = useRef(null);
  const [largo, setLargo] = useState(0);
  const [t, setT] = useState(0);
  const [listo, setListo] = useState(false);

  const alCargar = (e) => {
    const s = e.currentTarget.duration;
    setLargo(s);
    if (Number.isFinite(s) && s > 0) alDuracion(s);
    const inicio = Math.min(1, s / 2) || 0;
    e.currentTarget.currentTime = inicio;
    setT(inicio);
  };

  const mover = (e) => {
    const s = Number(e.target.value);
    setT(s);
    video.current.currentTime = s;
  };

  const tomar = async () => {
    const v = video.current;
    if (!v.videoWidth) return;
    usar(await recortar(v, v.videoWidth, v.videoHeight));
  };

  return (
    <div className="ad-cuadro">
      <video ref={video} src={src} muted playsInline preload="auto" onLoadedMetadata={alCargar} onSeeked={() => setListo(true)}
        onError={() => { setError('Ese video no se pudo abrir aquí: prueba con el MP4 o sube una imagen.'); cancelar(); }} />
      <input type="range" min={0} max={largo || 0} step={0.04} value={t} onChange={mover} aria-label="Elige el cuadro" disabled={!largo} />
      <div className="ad-cuadro__pie">
        <span>{t.toFixed(1)} s</span>
        <button type="button" className="ld-btn" onClick={cancelar}>Cancelar</button>
        <button type="button" className="ld-btn ld-btn--primario" onClick={tomar} disabled={!listo}>Usar este cuadro</button>
      </div>
    </div>
  );
}
