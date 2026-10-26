// src/pages/CreaTuApp.jsx
// Landing para Google Ads (idea de Roikel): sencilla y al punto, cuatro partes y un CTA distinto en cada una.
// Todos los botones bajan al formulario; el formulario manda los datos al WhatsApp de Web Bonding, igual que
// «Iniciar proyecto» del sitio. La página completa (/) sigue siendo la informativa.
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiDownload, FiArrowRight } from 'react-icons/fi';
import { SiWhatsapp, SiInstagram } from 'react-icons/si';
import { HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';
import Reveal from '../components/Reveal';
import APPS from '../data/apps';
import '../assets/CreaTuApp.css';

const WA = '584121510662';

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

function Formulario() {
  const [d, setD] = useState({ nombre: '', telefono: '', correo: '', adicional: '' });
  const [tocado, setTocado] = useState(false);
  const err = {
    nombre: d.nombre.trim().length < 3 ? 'Escribe tu nombre.' : '',
    telefono: d.telefono.replace(/\D/g, '').length < 7 ? 'Escribe un teléfono válido.' : '',
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo.trim()) ? '' : 'Escribe un correo válido.',
  };
  const valido = !err.nombre && !err.telefono && !err.correo;
  const cambia = (k) => (e) => setD({ ...d, [k]: e.target.value });

  const enviar = (e) => {
    e.preventDefault();
    setTocado(true);
    if (!valido) return;
    const msg = `Hola Web Bonding! 👋 Quiero comenzar mi proyecto.\n\n👤 *Nombre:* ${d.nombre.trim()}\n📱 *Teléfono:* ${d.telefono.trim()}\n📧 *Correo:* ${d.correo.trim()}` +
      (d.adicional.trim() ? `\n📝 *Adicional:* ${d.adicional.trim()}` : '');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <form className="lp-form" onSubmit={enviar} noValidate>
      {[
        ['nombre', 'Nombre', 'text', 'name', 'text', 'Ej: María González'],
        ['telefono', 'Teléfono', 'tel', 'tel', 'tel', 'Ej: 0412 123 4567'],
        ['correo', 'Correo', 'email', 'email', 'email', 'Ej: maria@gmail.com'],
      ].map(([k, label, type, auto, modo, ejemplo]) => (
        <label className="lp-campo" key={k}>
          <span>{label}</span>
          <input type={type} autoComplete={auto} inputMode={modo} placeholder={ejemplo} value={d[k]} onChange={cambia(k)}
            className={tocado && err[k] ? 'lp-error' : ''} />
          {tocado && err[k] && <small>{err[k]}</small>}
        </label>
      ))}
      <label className="lp-campo">
        <span>Adicional <i>(opcional)</i></span>
        <textarea rows="3" value={d.adicional} onChange={cambia('adicional')} autoComplete="off"
          placeholder="Ej: Quiero una app para que mis clientes pidan y paguen desde el teléfono" />
      </label>
      <button type="submit" className="lp-btn lp-btn--envio">Comenzar mi proyecto <FiArrowRight aria-hidden="true" /></button>
      <p className="lp-form__nota">Te escribimos en menos de 24 horas.</p>
    </form>
  );
}

function CreaTuApp() {
  const vitrina = APPS.filter((a) => a.capturas.length).slice(0, 3);
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
            {vitrina.length > 0 && (
              <Reveal className="lp-hero__vitrina" variant="zoom" delay="d2">
                {vitrina.map((a, i) => (
                  <img key={a.slug} className={`lp-cap lp-cap--${a.formato} lp-hero__cap${i}`} src={a.capturas[0].src} alt={`${a.nombre}: ${a.capturas[0].alt}`} />
                ))}
              </Reveal>
            )}
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
            <div className="lp-apps__lista">
              {APPS.map((a) => (
                <Reveal as="article" className="lp-app" key={a.slug}>
                  <div className="lp-app__info">
                    <span className="lp-app__tipo">{a.tipo}</span>
                    <h3>{a.nombre}</h3>
                    <p>{a.descripcion}</p>
                    {a.descarga && (
                      <a className="lp-app__bajar" href={a.descarga} target="_blank" rel="noopener noreferrer">
                        <FiDownload aria-hidden="true" /> Descargar la app
                      </a>
                    )}
                  </div>
                  {a.capturas.length > 0 && (
                    <div className="lp-app__capturas">
                      {a.capturas.map((c) => (
                        <img key={c.src} className={`lp-cap lp-cap--${a.formato}`} src={c.src} alt={`${a.nombre}: ${c.alt}`} loading="lazy" />
                      ))}
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
            <Reveal className="lp-centro"><Boton claro>Creemos tu aplicación</Boton></Reveal>
          </div>
        </section>

        {/* 4 · Contáctanos */}
        <section className="lp-contacto wb-section--paper" id="contacto">
          <div className="wb-container lp-contacto__in">
            <div>
              <Reveal as="h2" className="lp-h2">Da el <em>siguiente paso</em>.</Reveal>
              <Reveal as="p" className="lp-contacto__p" delay="d1">Déjanos tus datos y te escribimos para conversar sobre tu proyecto, sin compromiso.</Reveal>
              <Reveal className="lp-contacto__datos" delay="d2">
                <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"><SiWhatsapp /> +58 412 151 0662</a>
                <a href="https://www.instagram.com/web.bonding/" target="_blank" rel="noopener noreferrer"><SiInstagram /> @web.bonding</a>
                <a href="mailto:webbonding21@gmail.com"><HiOutlineMail /> webbonding21@gmail.com</a>
                <span><HiOutlineLocationMarker /> Acarigua–Araure, Portuguesa</span>
              </Reveal>
            </div>
            <Reveal delay="d1"><Formulario /></Reveal>
          </div>
        </section>

        <footer className="lp-pie">Web Bonding, C.A. · RIF J-50804362-6</footer>
      </main>
    </>
  );
}

export default CreaTuApp;
