/* eslint-disable react/prop-types */
// src/pages/Portafolio.jsx
// Portafolio de los tres paquetes (pedido de Williams del 4-nov-2026): lo que el flyer de los paquetes adelanta, aquí se
// ve. El 01 son las apps y webs (la misma vitrina de /crea-tu-app), el 02 el marketing y las redes (los reels, que se
// ven embebidos de Instagram en un reproductor encima de la página) y el Plus, los dos juntos. Sin precios: cada paquete
// se cotiza por WhatsApp. Es una landing como /crea-tu-app: sin el menú ni el pie del sitio, con su barra arriba y el RIF.
// Los videos se cargan de Supabase al abrir la página (data/portafolio.js); se agregan y se ordenan en /admin/portafolio.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowDown, FiArrowLeft, FiArrowRight, FiX } from 'react-icons/fi';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';
import { HiOutlineMail } from 'react-icons/hi';
import Reveal from '../components/Reveal';
import Vitrina from '../components/Vitrina';
import EmbedInstagram, { IG } from '../components/EmbedInstagram';
import PortadaVideo from '../components/PortadaVideo';
import { PLUS as APP_Y_VIDEO, cargarVideos } from '../data/portafolio';
import '../assets/CreaTuApp.css';
import '../assets/Portafolio.css';

const WA = '584220579731';
const wa = (que) => `https://wa.me/${WA}?text=${encodeURIComponent(`Hola Web Bonding! Vi el portafolio y me interesa ${que}`)}`;

// los paquetes como en el flyer: 01 + 02 = PLUS. «ir» es la sección que muestra cada uno; «msj», cómo lo nombra el WhatsApp.
const PAQUETES = [
  { k: '01', num: '01', nombre: 'Paquete 01', linea: 'Tu app o tu web', ir: 'apps', ver: 'Ver apps', msj: 'el Paquete 01: mi app o mi web.' },
  { k: '02', num: '02', nombre: 'Paquete 02', linea: 'Tu marketing y tus redes', ir: 'videos', ver: 'Ver videos', msj: 'el Paquete 02: el marketing y las redes de mi negocio.' },
  { k: 'plus', num: 'PLUS', nombre: 'Paquete Plus', linea: 'Tu app y tus redes, todo de una.', ir: 'plus', ver: 'Ver el Plus', msj: 'el Paquete Plus: mi app y el marketing, todo de una.' },
];
const [P01, P02, PLUS] = PAQUETES;

function Ficha({ p }) {
  return (
    <a href={`#${p.ir}`} className={`pf-paq pf-paq--${p.k}`}>
      <span className="pf-paq__k">Paquete</span>
      <b className="pf-paq__n">{p.num}</b>
      <span className="pf-paq__t">{p.linea}</span>
      <span className="pf-paq__ver">{p.ver} <FiArrowDown aria-hidden="true" /></span>
      {p.k === 'plus' && <span className="pf-pega">El más completo</span>}
    </a>
  );
}

// los signos de la suma, dibujados como en el flyer: círculo coral y barras tinta
function Signo({ igual = false }) {
  return (
    <span className={`pf-signo pf-signo--${igual ? 'igual' : 'mas'}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        {igual ? (
          <><rect x="25" y="35" width="50" height="11" rx="5.5" /><rect x="25" y="54" width="50" height="11" rx="5.5" /></>
        ) : (
          <><rect x="23" y="44" width="54" height="12" rx="6" /><rect x="44" y="23" width="12" height="54" rx="6" /></>
        )}
      </svg>
    </span>
  );
}

function Pedir({ p, className = '', children }) {
  return (
    <a className={`lp-btn ${className}`} href={wa(p.msj)} target="_blank" rel="noopener noreferrer">
      <SiWhatsapp aria-hidden="true" /> {children}
    </a>
  );
}

// El reproductor: el video embebido de Instagram, que se reproduce desde allá. Va en <body> (dentro de Reveal, que anima
// con transform, el position: fixed quedaría encerrado en su caja). Se pasa de un video a otro con las flechas de la
// pantalla o del teclado; mientras el video tiene el foco, el teclado se queda dentro de Instagram.
function Cine({ videos, k, ver, cerrar }) {
  const v = videos[k];
  const n = videos.length;
  return createPortal(
    <div className="pf-cine" role="dialog" aria-modal="true" aria-label={v.titulo} onClick={cerrar}>
      <figure className="pf-cine__fig" onClick={(e) => e.stopPropagation()}>
        <EmbedInstagram className="pf-cine__ig" codigo={v.codigo} titulo={v.titulo} />
        <figcaption className="pf-cine__info">
          <span className="pf-etq">{v.etiqueta}</span>
          <h3>{v.titulo}</h3>
          {v.tipo && <small>{v.tipo}</small>}
          {v.descripcion && <p>{v.descripcion}</p>}
          <a className="pf-cine__ir" href={`${IG}/p/${v.codigo}/`} target="_blank" rel="noopener noreferrer">
            <SiInstagram aria-hidden="true" /> Verlo en Instagram
          </a>
          <span className="pf-cine__n">{String(k + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </figcaption>
      </figure>
      <button type="button" className="pf-cine__cerrar" onClick={cerrar} aria-label="Cerrar" autoFocus><FiX aria-hidden="true" /></button>
      {n > 1 && (
        <>
          <button type="button" className="pf-cine__paso pf-cine__paso--ant" aria-label="Video anterior"
            onClick={(e) => { e.stopPropagation(); ver(k - 1); }}><FiArrowLeft aria-hidden="true" /></button>
          <button type="button" className="pf-cine__paso pf-cine__paso--sig" aria-label="Video siguiente"
            onClick={(e) => { e.stopPropagation(); ver(k + 1); }}><FiArrowRight aria-hidden="true" /></button>
        </>
      )}
    </div>,
    document.body,
  );
}

function Portafolio() {
  const [videos, setVideos] = useState(null); // null: cargando
  const [actual, setActual] = useState(-1); // el video abierto; -1 = ninguno
  const abierto = actual >= 0 && Boolean(videos?.[actual]);

  // si la base no responde, la sección queda con la casilla lima
  useEffect(() => {
    let vivo = true;
    cargarVideos().then((l) => vivo && setVideos(l)).catch(() => vivo && setVideos([]));
    return () => { vivo = false; };
  }, []);

  // el reel no arranca solo: se le da play en la tarjeta de Instagram
  const ver = (k) => setActual((k + videos.length) % videos.length);
  const cerrar = () => setActual(-1);

  // teclado: Escape cierra y las flechas pasan de video
  const teclado = useRef(null);
  teclado.current = (e) => {
    if (e.key === 'Escape') cerrar();
    else if (e.key === 'ArrowRight') ver(actual + 1);
    else if (e.key === 'ArrowLeft') ver(actual - 1);
  };
  useEffect(() => {
    if (!abierto) return undefined;
    const tecla = (e) => teclado.current(e);
    document.addEventListener('keydown', tecla);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
    };
  }, [abierto]);

  // los videos «App + video» son el Plus hecho: la app y el reel, del mismo equipo (dos, para que quepan girados)
  const ejemplos = (videos ?? []).map((v, k) => ({ v, k })).filter(({ v }) => v.etiqueta === APP_Y_VIDEO).slice(0, 2);

  return (
    <>
      <Helmet>
        <html lang="es-VE" />
        <title>Portafolio | Web Bonding · Apps, webs y marketing</title>
        <meta name="description" content="Mira las apps y webs que ya hicimos y los videos con los que las contamos. Paquete 01: tu app o tu web. Paquete 02: tu marketing y tus redes. Paquete Plus: los dos, todo de una." />
        <link rel="canonical" href="https://webbonding.net/portafolio" />
      </Helmet>

      <main className="lp pf">
        <header className="lp-top">
          <a href="/" className="lp-top__logo"><img src="/logoenblanco.png" alt="" /> Web Bonding</a>
          <a href="#contacto" className="lp-top__cta">Cotiza tu paquete</a>
        </header>

        {/* Portada: la suma del flyer; cada ficha baja a lo que trae su paquete */}
        <section className="pf-hero wb-section--paper">
          <div className="wb-container">
            <Reveal as="span" className="wb-eyebrow pf-eyebrow">Portafolio · Paquetes Web Bonding</Reveal>
            <Reveal as="h1" className="pf-hero__t" delay="d1">Mira lo que trae <em>cada paquete</em>.</Reveal>
            <Reveal as="p" className="pf-hero__p" delay="d2">
              Las apps y webs que ya están funcionando, y los videos con los que las contamos. Toca un paquete y míralo.
            </Reveal>
            <Reveal className="pf-suma" variant="zoom" delay="d3">
              <Ficha p={P01} />
              <Signo />
              <Ficha p={P02} />
              <Signo igual />
              <Ficha p={PLUS} />
            </Reveal>
          </div>
        </section>

        {/* Paquete 01: la vitrina de apps, con sus pantallas reales */}
        <section className="lp-apps pf-sec wb-grain" id="apps">
          <div className="wb-container">
            <Reveal as="span" className="wb-eyebrow lp-eyebrow">Paquete 01 · Apps y webs</Reveal>
            <Reveal as="h2" className="lp-h2 lp-h2--claro" delay="d1">Tu app o tu web, <em>hecha a tu medida</em>.</Reveal>
            <Reveal as="p" className="lp-apps__p" delay="d2">
              Antes de programar te mostramos el diseño, así ves cómo va a quedar. Estas ya están funcionando: elige una y
              mira sus pantallas reales.
            </Reveal>
            <Reveal as="ul" className="pf-trae pf-trae--claro" delay="d2">
              {['Apps para tus clientes', 'Sistemas para tu negocio', 'Páginas web y tiendas'].map((t) => <li key={t}>{t}</li>)}
            </Reveal>
            <Reveal delay="d2"><Vitrina /></Reveal>
            <Reveal className="lp-centro"><Pedir p={P01} className="lp-btn--claro">Quiero el Paquete 01</Pedir></Reveal>
          </div>
        </section>

        {/* Paquete 02: los videos; la última casilla es para el negocio de quien está viendo */}
        <section className="pf-videos pf-sec wb-section--paper" id="videos">
          <div className="wb-container">
            <Reveal as="span" className="wb-eyebrow pf-eyebrow">Paquete 02 · Marketing y redes</Reveal>
            <Reveal as="h2" className="lp-h2" delay="d1">Videos que <em>cuentan lo que haces</em>.</Reveal>
            <Reveal as="p" className="pf-p" delay="d2">
              Armamos la estrategia, hacemos los videos, el contenido y los flyers, y un community manager lleva tus redes
              por ti. Toca un video para verlo.
            </Reveal>
            <Reveal as="ul" className="pf-trae" delay="d2">
              {['Estrategia', 'Videos', 'Contenido', 'Flyers', 'Community manager'].map((t) => <li key={t}>{t}</li>)}
            </Reveal>
            <div className="pf-grilla" aria-busy={videos === null}>
              {videos === null && [1, 2, 3].map((n) => (
                <div className="pf-video pf-video--cargando" key={n} aria-hidden="true"><div className="pf-portada" /></div>
              ))}
              {videos?.map((v, k) => (
                <Reveal as="article" className="pf-video" key={v.codigo} delay={`d${(k % 3) + 1}`}>
                  <PortadaVideo v={v} onVer={() => ver(k)} />
                  <span className="pf-etq">{v.etiqueta}</span>
                  <h3>{v.titulo}</h3>
                  {v.tipo && <p>{v.tipo}</p>}
                </Reveal>
              ))}
              <Reveal className="pf-video" delay="d4">
                <a className="pf-tuyo" href={wa(P02.msj)} target="_blank" rel="noopener noreferrer">
                  <span className="pf-tuyo__k">Paquete 02</span>
                  <b>¿El próximo? <em>El de tu negocio.</em></b>
                  <span className="pf-tuyo__ir"><SiWhatsapp aria-hidden="true" /> Quiero el Paquete 02</span>
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Paquete Plus: los dos, con los reels de la serie como ejemplo */}
        <section className="pf-plus pf-sec" id="plus">
          <div className={`wb-container pf-plus__in${ejemplos.length ? '' : ' pf-plus__in--solo'}`}>
            <div>
              <Reveal as="span" className="wb-eyebrow pf-plus__eyebrow">Paquete Plus</Reveal>
              <Reveal as="h2" className="lp-h2 pf-plus__t" delay="d1">El 01 y el 02, <em>todo de una</em>.</Reveal>
              <Reveal as="p" className="pf-plus__p" delay="d2">
                Tu app o tu web, y el marketing para que la gente la conozca y la use, con un solo equipo. Como en la serie
                «Haciendo una app por día»: la app y el reel los hace el mismo equipo.
              </Reveal>
              <Reveal delay="d3"><Pedir p={PLUS} className="pf-btn--lima">Quiero el Plus</Pedir></Reveal>
            </div>
            {ejemplos.length > 0 && (
              <Reveal className="pf-plus__ejemplos" variant="zoom" delay="d2">
                {ejemplos.map(({ v, k }) => (
                  <figure className="pf-plus__ejemplo" key={v.codigo}>
                    <PortadaVideo v={v} onVer={() => ver(k)} />
                    <figcaption><b>{v.titulo}</b> {v.etiqueta}</figcaption>
                  </figure>
                ))}
              </Reveal>
            )}
          </div>
        </section>

        {/* Contacto: un botón por paquete, cada uno con su mensaje de WhatsApp */}
        <section className="pf-contacto pf-sec wb-grain" id="contacto">
          <div className="wb-container">
            <Reveal as="h2" className="lp-h2 lp-h2--claro">¿Cuál <em>te llevas</em>?</Reveal>
            <Reveal as="p" className="lp-apps__p" delay="d1">Escríbenos por WhatsApp y te contamos los detalles del paquete que te interese.</Reveal>
            <div className="pf-elige">
              {PAQUETES.map((p, i) => (
                <Reveal key={p.k} delay={`d${i + 1}`}>
                  <a className={`pf-elige__op pf-elige__op--${p.k}`} href={wa(p.msj)} target="_blank" rel="noopener noreferrer">
                    <span className="pf-elige__n">{p.num}</span>
                    <b>{p.nombre}</b>
                    <span className="pf-elige__t">{p.linea}</span>
                    <span className="pf-elige__ir"><SiWhatsapp aria-hidden="true" /> Escríbenos <FiArrowRight aria-hidden="true" /></span>
                  </a>
                </Reveal>
              ))}
            </div>
            <Reveal className="pf-datos" delay="d2">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"><SiWhatsapp aria-hidden="true" /> +58 422 057 9731</a>
              <a href="https://www.instagram.com/web.bonding/" target="_blank" rel="noopener noreferrer"><SiInstagram aria-hidden="true" /> @web.bonding</a>
              <a href="mailto:webbonding21@gmail.com"><HiOutlineMail aria-hidden="true" /> webbonding21@gmail.com</a>
            </Reveal>
          </div>
        </section>

        <footer className="lp-pie">Web Bonding, C.A. · RIF J-50804362-6 · <a href="/privacidad">Política de privacidad</a></footer>
      </main>

      {abierto && <Cine videos={videos} k={actual} ver={ver} cerrar={cerrar} />}
    </>
  );
}

export default Portafolio;
