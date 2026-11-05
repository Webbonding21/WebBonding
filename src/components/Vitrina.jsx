// src/components/Vitrina.jsx
// La vitrina de apps del catálogo (src/data/apps.js): se elige la app en las etiquetas y se ven sus pantallas reales.
// La usan /crea-tu-app y /portafolio; sus estilos (lp-vitrina, lp-app, lp-shot, lp-zoom) están en CreaTuApp.css.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiDownload, FiArrowRight, FiArrowLeft, FiExternalLink, FiX } from 'react-icons/fi';
import APPS from '../data/apps';
import '../assets/CreaTuApp.css';

// «Nuestras apps» como vitrina: se elige la app en las etiquetas (o con las flechas) y se ven sus pantallas
// reales; cada captura se amplía al tocarla.
export default function Vitrina() {
  const [i, setI] = useState(0);
  const [atras, setAtras] = useState(false);
  const [zoom, setZoom] = useState(-1); // captura ampliada; -1 = ninguna
  const fila = useRef(null);
  const a = APPS[i];
  const n = a.capturas.length;

  const ver = (k) => {
    const m = (k + APPS.length) % APPS.length;
    setAtras(k < i);
    setZoom(-1);
    setI(m);
    // la etiqueta elegida queda a la vista dentro de su fila, sin mover la página
    const chip = fila.current?.children[m];
    if (chip) fila.current.scrollTo({ left: chip.offsetLeft - (fila.current.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
  };

  useEffect(() => {
    if (zoom < 0) return undefined;
    const tecla = (e) => {
      if (e.key === 'Escape') setZoom(-1);
      if (e.key === 'ArrowRight') setZoom((z) => (z + 1) % n);
      if (e.key === 'ArrowLeft') setZoom((z) => (z - 1 + n) % n);
    };
    document.addEventListener('keydown', tecla);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
    };
  }, [zoom, n]);

  const z = a.capturas[zoom];
  return (
    <div className="lp-vitrina">
      <div className="lp-vitrina__chips" ref={fila} role="group" aria-label="Elige una app">
        {APPS.map((x, k) => (
          <button type="button" key={x.slug} className={`lp-vitrina__chip ${k === i ? 'is-on' : ''}`} aria-pressed={k === i} onClick={() => ver(k)}>
            {x.chip || x.nombre}
          </button>
        ))}
      </div>

      <article key={a.slug} className={`lp-app ${atras ? 'lp-app--atras' : ''}`}>
        <div className="lp-app__info">
          <span className="lp-app__tipo">{a.tipo}</span>
          <h3>{a.nombre}</h3>
          <p>{a.descripcion}</p>
          {a.enlaces && (
            <div className="lp-app__enlaces">
              {a.enlaces.map((e) => (
                <a key={e.url} className={`lp-app__enlace lp-app__enlace--${e.tipo}`} href={e.url} target="_blank" rel="noopener noreferrer">
                  {e.tipo === 'descarga' ? <FiDownload aria-hidden="true" /> : <FiExternalLink aria-hidden="true" />} {e.texto}
                </a>
              ))}
            </div>
          )}
          <div className="lp-app__pasar">
            <button type="button" onClick={() => ver(i - 1)} aria-label="App anterior"><FiArrowLeft aria-hidden="true" /></button>
            <span>{String(i + 1).padStart(2, '0')} / {String(APPS.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => ver(i + 1)} aria-label="App siguiente"><FiArrowRight aria-hidden="true" /></button>
          </div>
        </div>
        <div className="lp-app__capturas">
          {a.capturas.map((c, k) => (
            <figure className="lp-shot" key={c.src}>
              <button type="button" className="lp-shot__ampliar" onClick={() => setZoom(k)} aria-label={`Ampliar: ${c.t}`}>
                <img className={`lp-cap lp-cap--${c.formato}`} src={c.src} alt={`${a.nombre}: ${c.t}`} loading="lazy" />
              </button>
              <figcaption>{c.t}</figcaption>
            </figure>
          ))}
        </div>
      </article>

      {/* en <body>: dentro de Reveal (que anima con transform) el position: fixed quedaría encerrado en su caja */}
      {z && createPortal(
        <div className="lp-zoom" role="dialog" aria-modal="true" aria-label={`${a.nombre}: ${z.t}`} onClick={() => setZoom(-1)}>
          <figure className="lp-zoom__fig" onClick={(e) => e.stopPropagation()}>
            <img key={z.src} className={`lp-zoom__img lp-zoom__img--${z.formato}`} src={z.src} alt={`${a.nombre}: ${z.t}`} />
            <figcaption>{a.nombre} · {z.t} <span>{zoom + 1} / {n}</span></figcaption>
          </figure>
          <button type="button" className="lp-zoom__cerrar" onClick={() => setZoom(-1)} aria-label="Cerrar" autoFocus><FiX aria-hidden="true" /></button>
          {n > 1 && (
            <>
              <button type="button" className="lp-zoom__paso lp-zoom__paso--ant" aria-label="Anterior"
                onClick={(e) => { e.stopPropagation(); setZoom((zoom - 1 + n) % n); }}><FiArrowLeft aria-hidden="true" /></button>
              <button type="button" className="lp-zoom__paso lp-zoom__paso--sig" aria-label="Siguiente"
                onClick={(e) => { e.stopPropagation(); setZoom((zoom + 1) % n); }}><FiArrowRight aria-hidden="true" /></button>
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
