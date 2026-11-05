/* eslint-disable react/prop-types */
// Los campos del editor del panel /admin: un control por cada tipo de dato de secciones.js (<Control campo={…} />). Todos
// reciben el campo, su valor y poner(valor); los que tocan otro dato (la portada llena la duración) usan d y ponerCampo(k, valor).
// Las imágenes nuevas no se suben al elegirlas: quedan como { blob, url, nombre } hasta que se guarda (Editor.jsx).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUp, FiFilm, FiImage, FiMonitor, FiPlus, FiSmartphone, FiX,
} from 'react-icons/fi';
import EmbedInstagram from '../EmbedInstagram';
import PortadaVideo from '../PortadaVideo';
import { ETIQUETAS, codigoDe } from '../../data/portafolio';
import { recortar, reducirImagen } from './datos';
import { clave, srcDe } from './valores';

const mover = (lista, i, paso) => {
  const n = lista.slice();
  [n[i], n[i + paso]] = [n[i + paso], n[i]];
  return n;
};

function Contador({ valor, max }) {
  const n = (valor ?? '').length;
  if (!max || n < max * 0.75) return null;
  return <small className={`pn-cuenta${n >= max ? ' is-lleno' : ''}`}>{n} / {max}</small>;
}

function Texto({ campo, valor, poner, id }) {
  return (
    <>
      <input id={id} className="ld-campo" type="text" autoComplete="off" maxLength={campo.max} value={valor ?? ''}
        placeholder={campo.ejemplo ? `Ej.: ${campo.ejemplo}` : ''} onChange={(e) => poner(e.target.value)} />
      <Contador valor={valor} max={campo.max} />
    </>
  );
}

function Largo({ campo, valor, poner, id }) {
  const caja = useRef(null);
  // crece con el texto, para leerlo entero sin la barra; el panel no salta al encogerla un instante
  useLayoutEffect(() => {
    const t = caja.current;
    if (!t) return;
    const panel = t.closest('.pn-panel__cuerpo');
    const y = panel?.scrollTop;
    const borde = t.offsetHeight - t.clientHeight;
    t.style.height = 'auto';
    t.style.height = `${t.scrollHeight + borde}px`;
    if (panel) panel.scrollTop = y;
  }, [valor]);
  return (
    <>
      <textarea ref={caja} id={id} className="ld-campo pn-texto" rows={campo.filas ?? 3} maxLength={campo.max} value={valor ?? ''}
        placeholder={campo.ejemplo ? `Ej.: ${campo.ejemplo.replace(/\n/g, ' / ')}` : ''} onChange={(e) => poner(e.target.value)} />
      <Contador valor={valor} max={campo.max} />
    </>
  );
}

function Numero({ campo, valor, poner, id }) {
  return (
    <input id={id} className="ld-campo pn-numero" type="number" inputMode="decimal" min={campo.min} max={campo.max} step={campo.paso ?? 'any'}
      value={valor ?? ''} onChange={(e) => poner(e.target.value === '' ? null : Number(e.target.value))} />
  );
}

// hasta 4 opciones, como botones; más, como menú
function Opciones({ campo, valor, poner, id }) {
  if (campo.opciones.length > 4) {
    return (
      <select id={id} className="ld-campo" value={valor ?? ''} onChange={(e) => poner(e.target.value)}>
        <option value="" disabled>Elige…</option>
        {campo.opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    );
  }
  return (
    <div className="pn-segmento" role="radiogroup" id={id}>
      {campo.opciones.map(([v, t, detalle]) => (
        <button key={v} type="button" role="radio" aria-checked={valor === v} className={valor === v ? 'is-elegida' : ''} onClick={() => poner(v)}>
          <b>{t}</b>{detalle && <span>{detalle}</span>}
        </button>
      ))}
    </div>
  );
}

function SiNo({ campo, valor, poner, id }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={Boolean(valor)} className="pn-switch" onClick={() => poner(!valor)}>
      <i aria-hidden="true" /> {valor ? 'Sí' : 'No'}
      <span className="pn-switch__texto">{campo.ayuda}</span>
    </button>
  );
}

// una lista de textos: se agrega con Enter (o al salir del campo), se ordena y se quita
function Lista({ campo, valor, poner, id }) {
  const lista = Array.isArray(valor) ? valor : [];
  const [nuevo, setNuevo] = useState('');
  const agregar = () => {
    const t = nuevo.trim();
    if (!t) return;
    poner([...lista, t]);
    setNuevo('');
  };
  return (
    <div className="pn-lista-campo">
      {lista.map((t, i) => (
        <div className="pn-item" key={i}>
          <input className="ld-campo" value={t} maxLength={campo.max} aria-label={`${campo.t}, ${i + 1}`}
            onChange={(e) => poner(lista.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" className="pn-ico pn-ico--chico" aria-label="Subir" disabled={i === 0} onClick={() => poner(mover(lista, i, -1))}><FiArrowUp aria-hidden="true" /></button>
          <button type="button" className="pn-ico pn-ico--chico" aria-label="Bajar" disabled={i === lista.length - 1} onClick={() => poner(mover(lista, i, 1))}><FiArrowDown aria-hidden="true" /></button>
          <button type="button" className="pn-ico pn-ico--chico pn-ico--quitar" aria-label="Quitar" onClick={() => poner(lista.filter((_, j) => j !== i))}><FiX aria-hidden="true" /></button>
        </div>
      ))}
      <div className="pn-item pn-item--nuevo">
        <input id={id} className="ld-campo" value={nuevo} maxLength={campo.max} aria-label={`Agregar a ${campo.t}`}
          placeholder={campo.ejemplo ? `Agregar, ej.: ${campo.ejemplo}` : 'Escribe y presiona Enter'}
          onChange={(e) => setNuevo(e.target.value)} onBlur={agregar}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }} />
        <button type="button" className="ld-btn" onMouseDown={(e) => e.preventDefault()} onClick={agregar} disabled={!nuevo.trim()}>
          <FiPlus aria-hidden="true" /> Agregar
        </button>
      </div>
    </div>
  );
}

const MUESTRAS = ['#0E0E11', '#1A1A2E', '#1C1020', '#0E3A2F', '#2E37FF', '#7B2FBE', '#FF5A3C', '#A35F00'];
function Color({ valor, poner, id }) {
  const v = valor || '#0E0E11';
  const muestras = MUESTRAS.includes(v.toUpperCase()) ? MUESTRAS : [...MUESTRAS, v];
  return (
    <div className="pn-color">
      {muestras.map((c) => (
        <button key={c} type="button" className={`pn-muestra${c.toUpperCase() === v.toUpperCase() ? ' is-elegida' : ''}`} style={{ background: c }}
          aria-label={c} onClick={() => poner(c)} />
      ))}
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(v) ? v : '#0e0e11'} onChange={(e) => poner(e.target.value.toUpperCase())} aria-label="Otro color" />
      <input id={id} className="ld-campo pn-hex" value={valor ?? ''} maxLength={7} onChange={(e) => poner(e.target.value)} aria-label="Color en hexadecimal" />
    </div>
  );
}

// una foto: se sube (se reduce aquí) o se quita
function Imagen({ campo, valor, poner, setError, id }) {
  const entrada = useRef(null);
  const src = srcDe(valor);
  const elegir = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    try {
      const blob = await reducirImagen(archivo, campo.lado ?? 1600);
      poner({ blob, url: URL.createObjectURL(blob), nombre: archivo.name.replace(/\.[^.]+$/, '') });
    } catch (err) { setError(err.message); }
  };
  return (
    <div className="pn-imagen">
      <div className="pn-imagen__prev">{src ? <img src={src} alt="" /> : <FiImage aria-hidden="true" />}</div>
      <div className="pn-imagen__acc">
        <button id={id} type="button" className="ld-btn" onClick={() => entrada.current.click()}>
          <FiImage aria-hidden="true" /> {src ? 'Cambiar la foto' : 'Subir una foto'}
        </button>
        {src && <button type="button" className="pn-cambiar pn-sin" onClick={() => poner('')}>Quitar la foto</button>}
      </div>
      <input ref={entrada} type="file" accept="image/*" hidden onChange={elegir} />
    </div>
  );
}

// las pantallas de una app: varias a la vez, con su texto, si son de teléfono o de computadora, en orden
function Capturas({ valor, poner, setError, id }) {
  const lista = Array.isArray(valor) ? valor : [];
  const entrada = useRef(null);
  const cambiar = (i, cambio) => poner(lista.map((c, j) => (j === i ? { ...c, ...cambio } : c)));
  const agregar = async (e) => {
    const archivos = [...(e.target.files ?? [])];
    e.target.value = '';
    const nuevas = [];
    for (const archivo of archivos) {
      try {
        const blob = await reducirImagen(archivo, 1600);
        const img = await createImageBitmap(blob).catch(() => null);
        nuevas.push({
          _k: clave(), src: { blob, url: URL.createObjectURL(blob), nombre: archivo.name.replace(/\.[^.]+$/, '') },
          t: '', formato: img && img.width > img.height ? 'web' : 'movil',
        });
      } catch (err) { setError(`${archivo.name}: ${err.message}`); }
    }
    if (nuevas.length) poner([...lista, ...nuevas]);
  };
  return (
    <div className="pn-capturas">
      {lista.map((c, i) => (
        <figure key={c._k ?? c.src} className={`pn-captura${c.formato === 'web' ? ' is-web' : ''}`}>
          <div className="pn-captura__img"><img src={srcDe(c.src)} alt="" loading="lazy" /><span>{i + 1}</span></div>
          <input className="ld-campo" value={c.t ?? ''} maxLength={60} placeholder="Qué muestra" aria-label={`Pantalla ${i + 1}: qué muestra`}
            onChange={(e) => cambiar(i, { t: e.target.value })} />
          <div className="pn-captura__acc">
            <button type="button" className={`pn-ico pn-ico--chico${c.formato !== 'web' ? ' is-on' : ''}`} aria-pressed={c.formato !== 'web'}
              title="De teléfono" aria-label="De teléfono" onClick={() => cambiar(i, { formato: 'movil' })}><FiSmartphone aria-hidden="true" /></button>
            <button type="button" className={`pn-ico pn-ico--chico${c.formato === 'web' ? ' is-on' : ''}`} aria-pressed={c.formato === 'web'}
              title="De computadora" aria-label="De computadora" onClick={() => cambiar(i, { formato: 'web' })}><FiMonitor aria-hidden="true" /></button>
            <button type="button" className="pn-ico pn-ico--chico" aria-label="Antes" disabled={i === 0} onClick={() => poner(mover(lista, i, -1))}><FiArrowLeft aria-hidden="true" /></button>
            <button type="button" className="pn-ico pn-ico--chico" aria-label="Después" disabled={i === lista.length - 1} onClick={() => poner(mover(lista, i, 1))}><FiArrowRight aria-hidden="true" /></button>
            <button type="button" className="pn-ico pn-ico--chico pn-ico--quitar" aria-label="Quitar" onClick={() => poner(lista.filter((_, j) => j !== i))}><FiX aria-hidden="true" /></button>
          </div>
        </figure>
      ))}
      <button id={id} type="button" className="pn-captura pn-captura--agregar" onClick={() => entrada.current.click()}>
        <FiPlus aria-hidden="true" /> <b>Agregar pantallas</b><span>Puedes elegir varias a la vez</span>
      </button>
      <input ref={entrada} type="file" accept="image/*" multiple hidden onChange={agregar} />
    </div>
  );
}

// los enlaces de una app: texto, dirección y si es la web o una tienda
function Enlaces({ valor, poner, id }) {
  const lista = Array.isArray(valor) ? valor : [];
  const cambiar = (i, cambio) => poner(lista.map((x, j) => (j === i ? { ...x, ...cambio } : x)));
  return (
    <div className="pn-enlaces">
      {lista.map((x, i) => (
        <div className="pn-enlace" key={x._k ?? i}>
          <input className="ld-campo" value={x.texto ?? ''} maxLength={60} placeholder="Texto, ej.: Descargar en Google Play" aria-label={`Enlace ${i + 1}: texto`}
            onChange={(e) => cambiar(i, { texto: e.target.value })} />
          <input className="ld-campo" value={x.url ?? ''} maxLength={300} inputMode="url" placeholder="https://…" aria-label={`Enlace ${i + 1}: dirección`}
            onChange={(e) => cambiar(i, { url: e.target.value.trim() })} />
          <select className="ld-campo" value={x.tipo ?? 'web'} aria-label={`Enlace ${i + 1}: tipo`} onChange={(e) => cambiar(i, { tipo: e.target.value })}>
            <option value="web">Web</option>
            <option value="descarga">Tienda (descarga)</option>
          </select>
          <button type="button" className="pn-ico pn-ico--chico pn-ico--quitar" aria-label="Quitar el enlace" onClick={() => poner(lista.filter((_, j) => j !== i))}><FiX aria-hidden="true" /></button>
        </div>
      ))}
      <button id={id} type="button" className="ld-btn" onClick={() => poner([...lista, { _k: clave(), texto: '', url: '', tipo: 'web' }])}>
        <FiPlus aria-hidden="true" /> Agregar un enlace
      </button>
    </div>
  );
}

// el enlace del video: se pega tal cual lo copia Instagram y se ve el video para confirmar que es ese
function Instagram({ valor, poner, otros, id }) {
  const codigo = codigoDe(valor);
  const repetido = codigo ? otros?.find((o) => o.datos.codigo === codigo) : null;
  return (
    <>
      <input id={id} className="ld-campo pn-grande" inputMode="url" autoComplete="off" spellCheck="false" value={valor ?? ''}
        placeholder="https://www.instagram.com/reel/…" onChange={(e) => poner(e.target.value)} />
      {repetido && <p className="pn-campo__error" role="alert">Ese video ya está en el portafolio: «{repetido.datos.titulo}».</p>}
      {codigo && !repetido && <VistaPrevia codigo={codigo} />}
    </>
  );
}

function VistaPrevia({ codigo }) {
  const [visto, setVisto] = useState(null);
  useEffect(() => {
    const t = setTimeout(() => setVisto(codigo), 500);
    return () => clearTimeout(t);
  }, [codigo]);
  if (!visto) return null;
  return (
    <details className="pn-previa">
      <summary>Ver el video para confirmar que es ese</summary>
      <EmbedInstagram className="pn-ig" codigo={visto} titulo="vista previa" />
    </details>
  );
}

// qué es: las de siempre a un toque, u otra escrita. campo.opciones: [{ valor, b, t }] (por defecto, las del portafolio)
const DEL_PORTAFOLIO = ETIQUETAS.map((x) => ({ valor: x.valor, b: x.valor, t: x.t }));
function Etiqueta({ campo, valor, poner, id }) {
  const opciones = campo.opciones ?? DEL_PORTAFOLIO;
  const [propia, setPropia] = useState(() => Boolean(valor) && !opciones.some((x) => x.valor === valor));
  return (
    <>
      <div className="pn-segmento pn-segmento--ancho" role="radiogroup" id={id}>
        {opciones.map(({ valor: v, b, t }) => (
          <button type="button" key={v} role="radio" aria-checked={!propia && valor === v} className={!propia && valor === v ? 'is-elegida' : ''}
            onClick={() => { setPropia(false); poner(v); }}>
            <b>{b}</b><span>{t}</span>
          </button>
        ))}
        <button type="button" role="radio" aria-checked={propia} className={propia ? 'is-elegida' : ''}
          onClick={() => { if (!propia) poner(''); setPropia(true); }}>
          <b>{campo.otra ?? 'Otra'}</b><span>La escribes tú.</span>
        </button>
      </div>
      {propia && (
        <input className="ld-campo pn-otra" autoFocus maxLength={campo.max} placeholder={`Ej.: ${campo.ejemploOtra ?? 'Flyer animado'}`}
          aria-label={campo.t} value={valor ?? ''} onChange={(e) => poner(e.target.value)} />
      )}
    </>
  );
}

const mmss = (s) => { const t = Math.floor(s); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

// la portada de un video: una imagen o un cuadro del video, recortada aquí a 9:16 (540x960); con el video sale la duración
function Portada({ valor, d, ponerCampo, setError, id }) {
  const deImagen = useRef(null);
  const deVideo = useRef(null);
  const [fuente, setFuente] = useState(null);
  const imagen = srcDe(valor);
  useEffect(() => () => { if (fuente) URL.revokeObjectURL(fuente); }, [fuente]);

  const usar = (blob) => ponerCampo('portada', { blob, url: URL.createObjectURL(blob), nombre: 'portada' });
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
    if (archivo) setFuente(URL.createObjectURL(archivo));
  };

  return (
    <div className="pn-portada">
      <div className="pf-video pn-portada__prev">
        <PortadaVideo v={{ titulo: (d.titulo ?? '').trim() || 'Título', duracion: (d.duracion ?? '').trim() }} imagen={imagen} />
      </div>
      <div className="pn-portada__op">
        {fuente ? (
          <Cuadro src={fuente} setError={setError}
            alDuracion={(s) => { if (!(d.duracion ?? '').trim()) ponerCampo('duracion', mmss(s)); }}
            usar={(blob) => { usar(blob); setFuente(null); }} cancelar={() => setFuente(null)} />
        ) : (
          <>
            <button id={id} type="button" className="ld-btn" onClick={() => deImagen.current.click()}><FiImage aria-hidden="true" /> Subir una imagen</button>
            <button type="button" className="ld-btn" onClick={() => deVideo.current.click()}><FiFilm aria-hidden="true" /> Sacarla del video</button>
            {imagen && <button type="button" className="pn-cambiar pn-sin" onClick={() => ponerCampo('portada', '')}>Quitar la portada</button>}
          </>
        )}
        <input ref={deImagen} type="file" accept="image/*" hidden onChange={alElegirImagen} />
        <input ref={deVideo} type="file" accept="video/*" hidden onChange={alElegirVideo} />
        <label className="ld-etiqueta" htmlFor="pn-dur">Duración <span className="pn-opcional">(opcional, como 1:34)</span></label>
        <input id="pn-dur" className="ld-campo pn-dur" inputMode="numeric" autoComplete="off" placeholder="1:34" maxLength={5}
          value={d.duracion ?? ''} onChange={(e) => ponerCampo('duracion', e.target.value)} />
      </div>
    </div>
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
  const correr = (e) => {
    const s = Number(e.target.value);
    setT(s);
    video.current.currentTime = s;
  };
  const tomar = async () => {
    const v = video.current;
    if (v.videoWidth) usar(await recortar(v, v.videoWidth, v.videoHeight));
  };

  return (
    <div className="pn-cuadro">
      <video ref={video} src={src} muted playsInline preload="auto" onLoadedMetadata={alCargar} onSeeked={() => setListo(true)}
        onError={() => { setError('Ese video no se pudo abrir aquí: prueba con el MP4 o sube una imagen.'); cancelar(); }} />
      <input type="range" min={0} max={largo || 0} step={0.04} value={t} onChange={correr} aria-label="Elige el cuadro" disabled={!largo} />
      <div className="pn-cuadro__pie">
        <span>{t.toFixed(1)} s</span>
        <button type="button" className="ld-btn" onClick={cancelar}>Cancelar</button>
        <button type="button" className="ld-btn ld-btn--primario" onClick={tomar} disabled={!listo}>Usar este cuadro</button>
      </div>
    </div>
  );
}

function Codigo({ campo, valor, poner, id }) {
  return <input id={id} className="ld-campo pn-mono" autoComplete="off" spellCheck="false" maxLength={60} value={valor ?? ''}
    placeholder={campo.ejemplo ?? ''} onChange={(e) => poner(e.target.value.toLowerCase().replace(/\s+/g, '-'))} />;
}

const CONTROLES = {
  texto: Texto, largo: Largo, numero: Numero, opciones: Opciones, si_no: SiNo, lista: Lista, color: Color, imagen: Imagen,
  capturas: Capturas, enlaces: Enlaces, instagram: Instagram, etiqueta: Etiqueta, portada: Portada, codigo: Codigo,
};

// el control que le toca a un campo según su tipo
export default function Control({ campo, ...resto }) {
  const C = CONTROLES[campo.tipo];
  return <C campo={campo} {...resto} />;
}
