// src/pages/CreaTuApp.jsx
// Landing para Google Ads (idea de Roikel): sencilla y al punto, cuatro partes y un CTA distinto en cada una.
// Todos los botones bajan al formulario; el formulario va paso a paso, guarda el lead (con la aceptación de la
// política de privacidad) y manda los datos al WhatsApp de Web Bonding. La página completa (/) sigue siendo la informativa.
import React, { useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiDownload, FiArrowRight, FiArrowLeft, FiCheck, FiSmartphone, FiGrid, FiMonitor, FiHelpCircle, FiExternalLink, FiX,
} from 'react-icons/fi';
import { SiWhatsapp, SiInstagram } from 'react-icons/si';
import { HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';
import Reveal from '../components/Reveal';
import APPS from '../data/apps';
import { guardarLead } from '../lib/privacidad';
import '../assets/CreaTuApp.css';

const WA = '584220579731';

const QUE_HACEMOS = [
  { t: 'Apps para tus clientes', d: 'Pedidos, delivery, reservas y pagos desde el teléfono.' },
  { t: 'Sistemas para tu negocio', d: 'Ventas, inventario, cobranzas y empleados en un solo lugar.' },
  { t: 'Páginas web y tiendas', d: 'Tu negocio en Google, con catálogo y botón de WhatsApp.' },
];

function Boton({ children, claro = false }) {
  return (
    <a href="#contacto" className={`lp-btn ${claro ? 'lp-btn--claro' : ''}`}>
      {children} <FiArrowRight aria-hidden="true" />
    </a>
  );
}

// «Nuestras apps» como vitrina: se elige la app en las etiquetas (o con las flechas) y se ven sus pantallas
// reales; cada captura se amplía al tocarla.
function Vitrina() {
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

// Formulario paso a paso: una pregunta por pantalla. Pide lo que dibujó Roikel (nombre, teléfono, correo y
// adicional opcional) y abre con lo que quiere construir, que se responde con un toque y pasa solo.
const OPCIONES = [
  { v: 'Una app para mis clientes', t: 'Una app', d: 'Para que tus clientes pidan, paguen o reserven.', Icono: FiSmartphone },
  { v: 'Un sistema para mi negocio', t: 'Un sistema', d: 'Ventas, inventario y cobranzas en un solo lugar.', Icono: FiGrid },
  { v: 'Una página web o tienda', t: 'Una página web', d: 'Tu negocio en Google, con catálogo.', Icono: FiMonitor },
  { v: 'Todavía no sé qué necesito', t: 'No estoy seguro', d: 'Te ayudamos a elegir.', Icono: FiHelpCircle },
];

const PASOS = ['tipo', 'nombre', 'telefono', 'correo', 'adicional'];

const PREGUNTAS = {
  nombre: { t: () => '¿Cómo te llamas?', p: 'Así sabemos con quién hablamos.', type: 'text', auto: 'name', ej: 'Ej: María González' },
  telefono: { t: (n) => `Mucho gusto, ${n}. ¿A qué número te escribimos?`, p: 'Te escribimos por WhatsApp en menos de 24 horas.', type: 'tel', auto: 'tel', ej: 'Ej: 0412 123 4567' },
  correo: { t: () => '¿Y tu correo?', p: 'Ahí te mandamos la propuesta.', type: 'email', auto: 'email', ej: 'Ej: maria@gmail.com' },
  adicional: { t: () => '¿Algo más que debamos saber?', p: 'Cuéntanos de tu negocio o de tu idea. Es opcional.', ej: 'Ej: Quiero una app para que mis clientes pidan y paguen desde el teléfono' },
};

const FALTA = {
  tipo: (d) => (d.tipo ? '' : 'Elige una opción.'),
  nombre: (d) => (d.nombre.trim().length < 3 ? 'Escribe tu nombre.' : ''),
  telefono: (d) => (d.telefono.replace(/\D/g, '').length < 10 ? 'Escribe el número completo, con el código. Ej: 0412 123 4567' : ''),
  correo: (d) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo.trim()) ? '' : 'Escribe un correo válido.'),
  adicional: (d) => (d.acepta ? '' : 'Para enviarlo, acepta la política de privacidad.'),
};

// acepta: la política de privacidad (obligatoria); novedades: ofertas y novedades (opcional)
const VACIO = { tipo: '', nombre: '', telefono: '', correo: '', adicional: '', acepta: false, novedades: false };

function Formulario() {
  const [d, setD] = useState(VACIO);
  const [paso, setPaso] = useState(0);
  const [atras, setAtras] = useState(false);
  const [aviso, setAviso] = useState('');
  const [intento, setIntento] = useState(0); // cambia en cada intento fallido para que el aviso vuelva a temblar
  const [enviado, setEnviado] = useState(''); // el enlace de WhatsApp, una vez enviado
  const campo = useRef(null);
  const casilla = useRef(null);

  const k = PASOS[paso];
  const primero = d.nombre.trim().split(/\s+/)[0] || '';
  const nombre = primero.charAt(0).toUpperCase() + primero.slice(1);

  // flushSync: la pregunta nueva se pinta dentro del mismo toque, así en el teléfono el teclado se abre al enfocarla
  const ir = (n) => {
    flushSync(() => { setAtras(n < paso); setAviso(''); setPaso(n); });
    campo.current?.focus();
  };

  const elegir = (v) => {
    setD({ ...d, tipo: v });
    ir(1);
  };

  const cambia = (e) => {
    setD({ ...d, [k]: e.target.value });
    if (aviso) setAviso('');
  };

  const marca = (e) => {
    setD({ ...d, [e.target.name]: e.target.checked });
    if (aviso) setAviso('');
  };

  const enviar = () => {
    const msg = `Hola Web Bonding! 👋 Quiero comenzar mi proyecto.\n\n💡 *Quiero:* ${d.tipo}\n👤 *Nombre:* ${d.nombre.trim()}\n📱 *Teléfono:* ${d.telefono.trim()}\n📧 *Correo:* ${d.correo.trim()}` +
      (d.adicional.trim() ? `\n📝 *Adicional:* ${d.adicional.trim()}` : '');
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    // el guardado sale primero y queda en camino aunque WhatsApp tome la pantalla; WhatsApp se abre en el mismo
    // toque para que el navegador no lo bloquee. Si no se pudo guardar, el mensaje igual llega por WhatsApp.
    guardarLead(d).catch((err) => console.warn('No se pudo guardar el lead:', err.message));
    window.open(url, '_blank');
    setEnviado(url);
  };

  const siguiente = (e) => {
    e.preventDefault();
    const falta = FALTA[k](d);
    if (falta) {
      setAviso(falta);
      setIntento((i) => i + 1);
      (k === 'adicional' ? casilla : campo).current?.focus();
      return;
    }
    if (paso < PASOS.length - 1) ir(paso + 1);
    else enviar();
  };

  if (enviado) {
    return (
      <div className="lp-pasos">
        <div className="lp-pasos__barra"><span style={{ width: '100%' }} /></div>
        <div className="lp-paso lp-listo" role="status">
          <span className="lp-listo__check"><FiCheck aria-hidden="true" /></span>
          <h3 className="lp-paso__t">¡Listo, {nombre}!</h3>
          <p className="lp-paso__p">Te abrimos WhatsApp con tu mensaje: solo falta enviarlo. Te respondemos en menos de 24 horas.</p>
          <a className="lp-btn" href={enviado} target="_blank" rel="noopener noreferrer"><SiWhatsapp aria-hidden="true" /> Abrir WhatsApp</a>
          <button type="button" className="lp-listo__otra" onClick={() => { setD(VACIO); setEnviado(''); setAtras(false); setPaso(0); }}>
            Empezar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const q = PREGUNTAS[k];
  return (
    <form className="lp-pasos" onSubmit={siguiente} noValidate>
      <div className="lp-pasos__barra" role="progressbar" aria-label="Avance" aria-valuemin={1} aria-valuemax={PASOS.length} aria-valuenow={paso + 1}>
        <span style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} />
      </div>
      <div className="lp-pasos__top">
        <span>Paso {paso + 1} de {PASOS.length}</span>
        {paso > 0 && (
          <button type="button" className="lp-pasos__atras" onClick={() => ir(paso - 1)}>
            <FiArrowLeft aria-hidden="true" /> Atrás
          </button>
        )}
      </div>

      {/* lo que ya respondió, como etiquetas: tocar una vuelve a esa pregunta */}
      {paso > 0 && (
        <div className="lp-pasos__resumen">
          {PASOS.slice(0, paso).map((p, i) => {
            const valor = p === 'tipo' ? OPCIONES.find((o) => o.v === d.tipo)?.t : d[p].trim();
            return (
              <button type="button" key={p} className="lp-pasos__chip" onClick={() => ir(i)} aria-label={`Cambiar: ${valor}`}>
                {valor}
              </button>
            );
          })}
        </div>
      )}

      <div key={paso} className={`lp-paso ${atras ? 'lp-paso--atras' : ''}`}>
        {k === 'tipo' ? (
          <>
            <p className="lp-paso__t" id="lp-tipo">¿Qué quieres construir?</p>
            <p className="lp-paso__p">Toca una opción.</p>
            <div className="lp-opciones" role="group" aria-labelledby="lp-tipo">
              {OPCIONES.map(({ v, t, d: desc, Icono }) => (
                <button type="button" aria-pressed={d.tipo === v} key={v}
                  className={`lp-opcion ${d.tipo === v ? 'is-on' : ''}`} onClick={() => elegir(v)}
                  ref={d.tipo === v || (!d.tipo && v === OPCIONES[0].v) ? campo : undefined}>
                  <span className="lp-opcion__i"><Icono aria-hidden="true" /></span>
                  <b>{t}</b>
                  <small>{desc}</small>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <label className="lp-paso__t" htmlFor={`lp-${k}`}>{q.t(nombre)}</label>
            <p className="lp-paso__p">{q.p}</p>
            {k === 'adicional' ? (
              <>
                <textarea id="lp-adicional" ref={campo} className="lp-paso__input" rows="4" autoComplete="off"
                  placeholder={q.ej} value={d.adicional} onChange={cambia} />
                {/* sin marcar de antemano: la aceptación la da la persona; la política abre en otra pestaña para no perder lo escrito */}
                <label className={`lp-acepto ${aviso ? 'lp-error' : ''}`}>
                  <input type="checkbox" name="acepta" ref={casilla} checked={d.acepta} onChange={marca}
                    aria-invalid={aviso ? true : undefined} aria-describedby={aviso ? 'lp-aviso' : undefined} />
                  <span>Acepto la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a> y que Web Bonding me escriba por WhatsApp o correo sobre mi proyecto.</span>
                </label>
                <label className="lp-acepto">
                  <input type="checkbox" name="novedades" checked={d.novedades} onChange={marca} />
                  <span>También quiero recibir ofertas y novedades. <em>Opcional.</em></span>
                </label>
              </>
            ) : (
              <input id={`lp-${k}`} ref={campo} className={`lp-paso__input ${aviso ? 'lp-error' : ''}`} type={q.type}
                inputMode={q.type} autoComplete={q.auto} enterKeyHint="next" placeholder={q.ej} value={d[k]} onChange={cambia}
                aria-invalid={aviso ? true : undefined} aria-describedby={aviso ? 'lp-aviso' : undefined} />
            )}
            {aviso && <small id="lp-aviso" key={intento} className="lp-paso__aviso" role="alert">{aviso}</small>}
            <div className="lp-paso__acciones">
              <button type="submit" className="lp-btn">
                {k === 'adicional' ? 'Comenzar mi proyecto' : 'Siguiente'} <FiArrowRight aria-hidden="true" />
              </button>
              {k !== 'adicional' && <span className="lp-paso__tecla">o presiona <kbd>Enter ↵</kbd></span>}
            </div>
          </>
        )}
      </div>
    </form>
  );
}

function CreaTuApp() {
  // portada: la primera pantalla de teléfono de las tres primeras apps del catálogo
  const portada = APPS.slice(0, 3).map((a) => ({ a, c: a.capturas.find((x) => x.formato === 'movil') || a.capturas[0] }));
  return (
    <>
      <Helmet>
        <html lang="es-VE" />
        <title>Crea la app de tu negocio | Web Bonding · Acarigua–Araure</title>
        <meta name="description" content="Construimos apps, sistemas administrativos y páginas web a la medida para negocios de Venezuela. Te mostramos el diseño antes de programar. Escríbenos y comienza hoy." />
        <link rel="canonical" href="https://webbonding.net/crea-tu-app" />
      </Helmet>

      <main className="lp">
        <header className="lp-top">
          <a href="/" className="lp-top__logo"><img src="/logoenblanco.png" alt="" /> Web Bonding</a>
          <a href="#contacto" className="lp-top__cta">Comenzar ahora</a>
        </header>

        {/* 1 · Portada */}
        <section className="lp-hero wb-grain">
          <div className="wb-container lp-hero__in">
            <div>
              <Reveal as="span" className="wb-eyebrow lp-eyebrow">Apps y sistemas a la medida · Acarigua–Araure</Reveal>
              <Reveal as="h1" className="lp-hero__t" delay="d1">Construimos apps que <em>sí funcionan</em>.</Reveal>
              <Reveal as="p" className="lp-hero__p" delay="d2">
                La app para tus clientes, el sistema para controlar ventas e inventario o la página web de tu negocio.
                Te mostramos el diseño antes de programar y la entregamos en semanas.
              </Reveal>
              <Reveal delay="d3"><Boton>Comenzar ahora</Boton></Reveal>
              <Reveal as="p" className="lp-hero__aval" delay="d4">+30 proyectos entregados · Hicimos Riko</Reveal>
            </div>
            <Reveal className="lp-hero__vitrina" variant="zoom" delay="d2">
              {portada.map(({ a, c }, i) => (
                <img key={a.slug} className={`lp-cap lp-cap--${c.formato} lp-hero__cap${i}`} src={c.src} alt={`${a.nombre}: ${c.t}`} />
              ))}
            </Reveal>
          </div>
        </section>

        {/* 2 · Qué hacemos (corto) */}
        <section className="lp-que wb-section--paper">
          <div className="wb-container">
            <Reveal as="h2" className="lp-h2">Lo que tu negocio necesita, <em>hecho a tu medida</em>.</Reveal>
            <div className="lp-que__grid">
              {QUE_HACEMOS.map((q, i) => (
                <Reveal className="lp-que__card" key={q.t} delay={`d${i + 1}`}>
                  <b>0{i + 1}</b><h3>{q.t}</h3><p>{q.d}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="lp-centro"><Boton>Quiero mi app</Boton></Reveal>
          </div>
        </section>

        {/* 3 · Nuestras apps: capturas reales y descarga directa de las que están publicadas */}
        <section className="lp-apps wb-grain" id="apps">
          <div className="wb-container">
            <Reveal as="span" className="wb-eyebrow lp-eyebrow">Nuestras apps</Reveal>
            <Reveal as="h2" className="lp-h2 lp-h2--claro" delay="d1">Apps reales, <em>funcionando hoy</em>.</Reveal>
            <Reveal as="p" className="lp-apps__p" delay="d2">Elige una y mira cómo se ve por dentro: son pantallas reales, sin adornos.</Reveal>
            <Reveal delay="d2"><Vitrina /></Reveal>
            <Reveal className="lp-centro"><Boton claro>Creemos tu aplicación</Boton></Reveal>
          </div>
        </section>

        {/* 4 · Contáctanos */}
        <section className="lp-contacto wb-section--paper" id="contacto">
          {/* en el teléfono el formulario va justo después del título; los datos de contacto, al final */}
          <div className="wb-container lp-contacto__in">
            <div className="lp-contacto__intro">
              <Reveal as="h2" className="lp-h2">Da el <em>siguiente paso</em>.</Reveal>
              <Reveal as="p" className="lp-contacto__p" delay="d1">Responde 5 preguntas rápidas y te escribimos para conversar sobre tu proyecto, sin compromiso.</Reveal>
            </div>
            <Reveal className="lp-contacto__form" delay="d1"><Formulario /></Reveal>
            <Reveal className="lp-contacto__datos" delay="d2">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"><SiWhatsapp /> +58 422 057 9731</a>
              <a href="https://www.instagram.com/web.bonding/" target="_blank" rel="noopener noreferrer"><SiInstagram /> @web.bonding</a>
              <a href="mailto:webbonding21@gmail.com"><HiOutlineMail /> webbonding21@gmail.com</a>
              <span><HiOutlineLocationMarker /> Acarigua–Araure, Portuguesa</span>
            </Reveal>
          </div>
        </section>

        <footer className="lp-pie">Web Bonding, C.A. · RIF J-50804362-6 · <a href="/privacidad">Política de privacidad</a></footer>
      </main>
    </>
  );
}

export default CreaTuApp;
