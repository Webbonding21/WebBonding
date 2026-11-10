/* eslint-disable react/prop-types */
// src/pages/Apps.jsx
// /apps: el enlace de la bio de Instagram (pedido de Williams del 10-nov-2026). Todas las apps que cualquiera puede abrir
// ya desde el teléfono, cada una con su botón para entrar y el reel que la cuenta. Es una landing como /portafolio: sin el
// menú ni el pie del sitio, con su barra arriba y el RIF abajo. Se abre casi siempre dentro de Instagram: una columna en el
// teléfono, nada escondido detrás de un toque y los reels como enlace (Instagram los abre en la app, no embebidos).
// Las apps salen de data/abiertas.js.
import { Helmet } from 'react-helmet-async';
import { FiArrowDown, FiArrowRight, FiArrowUpRight, FiPlay } from 'react-icons/fi';
import { SiAppstore, SiGoogleplay, SiInstagram, SiWhatsapp } from 'react-icons/si';
import { HiOutlineMail } from 'react-icons/hi';
import Reveal from '../components/Reveal';
import { EN_LA_CALLE, SERIE, reel } from '../data/abiertas';
import '../assets/CreaTuApp.css';
import '../assets/Apps.css';

const WA = '584220579731';
const wa = (texto) => `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
const fuera = { target: '_blank', rel: 'noopener noreferrer' };

// el ícono de cada enlace: la tienda si es una descarga, una flecha que sale si es una web
function Icono({ e }) {
  if (/google play/i.test(e.texto)) return <SiGoogleplay aria-hidden="true" />;
  if (/app store/i.test(e.texto)) return <SiAppstore aria-hidden="true" />;
  return null;
}

function Tarjeta({ app, k, oscura = false }) {
  const [principal, ...otros] = app.enlaces;
  return (
    <Reveal as="article" className={`ap-app${oscura ? ' ap-app--oscura' : ''}`} delay={`d${(k % 3) + 1}`}>
      {/* la pantalla también abre la app; para el lector de pantalla basta con el botón */}
      <a className="ap-app__pantalla" href={principal.url} {...fuera} tabIndex={-1} aria-hidden="true">
        <img src={app.captura} alt="" loading="lazy" decoding="async" width="600" height="1298" />
        {app.dia && <span className="ap-app__dia">Día {app.dia}</span>}
      </a>
      <div className="ap-app__info">
        <span className="ap-app__tipo">{app.tipo}</span>
        <h3 className="ap-app__nombre">{app.nombre}</h3>
        <p className="ap-app__linea">{app.linea}</p>
      </div>
      <div className="ap-app__botones">
        <a className="ap-btn ap-btn--abrir" href={principal.url} {...fuera} aria-label={`${principal.texto}: ${app.nombre}`}>
          <Icono e={principal} /> {principal.texto} {principal.tipo === 'web' && <FiArrowUpRight aria-hidden="true" />}
        </a>
        {otros.map((e) => (
          <a className="ap-btn ap-btn--otro" key={e.url} href={e.url} {...fuera}>
            <Icono e={e} /> {e.texto} {e.tipo === 'web' && <FiArrowUpRight aria-hidden="true" />}
          </a>
        ))}
        {app.reel && (
          <a className="ap-btn ap-btn--reel" href={reel(app.reel)} {...fuera} aria-label={`Ver el reel de ${app.nombre} en Instagram`}>
            <FiPlay aria-hidden="true" /> Ver el reel
          </a>
        )}
      </div>
    </Reveal>
  );
}

function Apps() {
  const total = SERIE.length + EN_LA_CALLE.length;
  return (
    <>
      <Helmet>
        <html lang="es-VE" />
        <title>Nuestras apps | Web Bonding · Entra y pruébalas</title>
        <meta name="description" content="Las apps que estamos haciendo en la serie «Haciendo una app por día» y las que ya usa la gente: Revísalo, Taquilla, Ojo al hueco, Riko, Cantera, Nobu Fit, Llegate y Brillarte. Ábrelas desde tu teléfono." />
        <link rel="canonical" href="https://webbonding.net/apps" />
        <meta property="og:title" content="Nuestras apps · Entra y pruébalas" />
        <meta property="og:description" content="Las apps de Web Bonding, abiertas para que las uses desde tu teléfono, cada una con el reel que la cuenta." />
        <meta property="og:url" content="https://webbonding.net/apps" />
      </Helmet>

      <main className="lp ap">
        <header className="lp-top">
          <a href="/" className="lp-top__logo"><img src="/logoenblanco.png" alt="" /> Web Bonding</a>
          <a href={wa('Hola Web Bonding! Vi sus apps y quiero una para mi negocio.')} className="lp-top__cta" {...fuera}>Quiero mi app</a>
        </header>

        {/* Portada corta: quien llega desde la bio viene a ver las apps, no a leer */}
        <section className="ap-hero wb-grain">
          <div className="wb-container ap-hero__in">
            <div>
              <Reveal as="span" className="wb-eyebrow ap-hero__k">Web Bonding · {total} apps abiertas</Reveal>
              <Reveal as="h1" className="ap-hero__t" delay="d1">Nuestras apps. <em>Entra y pruébalas.</em></Reveal>
              <Reveal as="p" className="ap-hero__p" delay="d2">
                Las que estamos haciendo y las que ya usa la gente, abiertas para que las uses desde tu teléfono. Cada una
                trae el reel donde la contamos.
              </Reveal>
              <Reveal as="nav" className="ap-saltos" delay="d3" aria-label="Secciones">
                <a href="#serie">Una app por día <FiArrowDown aria-hidden="true" /></a>
                <a href="#calle">Ya en la calle <FiArrowDown aria-hidden="true" /></a>
              </Reveal>
            </div>
            {/* las pantallas de la serie en abanico; solo en pantallas anchas (en el teléfono la portada va corta) */}
            <Reveal className="ap-abanico" variant="zoom" delay="d2" aria-hidden="true">
              {SERIE.map((a) => <img key={a.slug} src={a.captura} alt="" width="600" height="1298" />)}
            </Reveal>
          </div>
        </section>

        {/* La serie: la app de cada día, con su reel */}
        <section className="ap-sec ap-serie wb-section--paper" id="serie">
          <div className="wb-container">
            <Reveal as="span" className="wb-eyebrow ap-k">La serie · Haciendo una app por día</Reveal>
            <Reveal as="h2" className="lp-h2" delay="d1">Una app nueva, <em>cada día</em>.</Reveal>
            <Reveal as="p" className="ap-p" delay="d2">
              La hacemos, la publicamos y la contamos en un reel. No son maquetas: ábrelas y úsalas.
            </Reveal>
            <div className="ap-lista">
              {SERIE.map((a, k) => <Tarjeta app={a} k={k} key={a.slug} />)}
              <Reveal className="ap-sigue" delay="d4">
                <span className="ap-sigue__k">Día {SERIE.length + 1}</span>
                <b>La serie sigue.</b>
                <p>La próxima app sale en nuestro Instagram. Síguenos para verla primero.</p>
                <a className="ap-btn ap-btn--ig" href="https://www.instagram.com/web.bonding/" {...fuera}>
                  <SiInstagram aria-hidden="true" /> @web.bonding
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Las que ya están funcionando para negocios de verdad (las del catálogo con enlace público) */}
        <section className="ap-sec ap-calle wb-grain" id="calle">
          <div className="wb-container">
            <Reveal as="span" className="wb-eyebrow ap-k ap-k--claro">Ya en la calle</Reveal>
            <Reveal as="h2" className="lp-h2 lp-h2--claro" delay="d1">Apps que ya <em>usa la gente</em>.</Reveal>
            <Reveal as="p" className="ap-p ap-p--claro" delay="d2">
              Las hicimos para negocios de aquí y están funcionando: pide, descarga o entra a verlas.
            </Reveal>
            <div className="ap-lista">
              {EN_LA_CALLE.map((a, k) => <Tarjeta app={a} k={k} key={a.slug} oscura />)}
            </div>
          </div>
        </section>

        {/* Cierre: la de quien está viendo */}
        <section className="ap-sec ap-tuya" id="contacto">
          <div className="wb-container ap-tuya__in">
            <Reveal as="h2" className="lp-h2 ap-tuya__t">¿Y la app de <em>tu negocio</em>?</Reveal>
            <Reveal as="p" className="ap-tuya__p" delay="d1">
              Cuéntanos tu idea por WhatsApp. Te decimos cómo quedaría y cuánto tarda, antes de programar nada.
            </Reveal>
            <Reveal className="ap-tuya__botones" delay="d2">
              <a className="lp-btn ap-tuya__wa" href={wa('Hola Web Bonding! Vi sus apps y quiero una para mi negocio.')} {...fuera}>
                <SiWhatsapp aria-hidden="true" /> Quiero mi app
              </a>
              <a className="ap-tuya__mas" href="/portafolio">Ver el portafolio y los videos <FiArrowRight aria-hidden="true" /></a>
            </Reveal>
            <Reveal className="ap-datos" delay="d3">
              <a href={`https://wa.me/${WA}`} {...fuera}><SiWhatsapp aria-hidden="true" /> +58 422 057 9731</a>
              <a href="https://www.instagram.com/web.bonding/" {...fuera}><SiInstagram aria-hidden="true" /> @web.bonding</a>
              <a href="mailto:webbonding21@gmail.com"><HiOutlineMail aria-hidden="true" /> webbonding21@gmail.com</a>
            </Reveal>
          </div>
        </section>

        <footer className="lp-pie">Web Bonding, C.A. · RIF J-50804362-6 · <a href="/privacidad">Política de privacidad</a></footer>
      </main>
    </>
  );
}

export default Apps;
