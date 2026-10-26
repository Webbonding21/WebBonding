import React from 'react';
import StepForModal from './StepForModal';
import Reveal from './Reveal';
import CountUp from './CountUp';
import '../assets/Hero.css';

const STATS = [
  { n: 30, suffix: '+', label: 'proyectos\nentregados' },
  { n: 8,  suffix: '',  label: 'industrias\natendidas' },
  { n: 2,  suffix: '',  label: 'países\n(VE · Latam)' },
  { n: 100,suffix: '%', label: 'código\na medida' },
];

const KEYWORDS = [
  'Apps móviles', 'Tiendas en línea', 'Sistemas administrativos', 'Equipos conectados',
  'Delivery', 'Pagos en línea', 'Paneles de control', 'Automatización', 'Apps web', 'Chatbots de WhatsApp',
];

function Hero() {
  return (
    <section id="home" className="hero wb-grain">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__dots" aria-hidden="true" />

      <div className="wb-container hero__inner">
        {/* Texto */}
        <div className="hero__head">
          <Reveal as="span" className="wb-eyebrow hero__eyebrow">
            Apps · Páginas web · Sistemas · Acarigua, VE
          </Reveal>

          <Reveal as="h1" className="hero__title" delay="d1">
            Construimos software que la gente{' '}
            <span className="hero__nb"><em>usa</em><span className="hero__rule" aria-hidden="true" /></span>
            <br />y negocios que <em>escalan</em>.
          </Reveal>

          <Reveal as="p" className="hero__sub" delay="d2">
            Creamos la app de tu negocio, tu página web, tu tienda en línea y el
            sistema para controlar ventas, inventario y cobranzas. Un solo equipo,
            desde Venezuela para toda Latinoamérica.
          </Reveal>

          <Reveal className="hero__actions" delay="d3">
            <div className="hero__primary">
              <StepForModal />
            </div>
            <a href="#work" className="wb-btn wb-btn--ghost on-ink hero__ghost">
              Ver proyectos <span className="wb-btn__arrow">→</span>
            </a>
          </Reveal>
        </div>

        {/* Collage visual — sin imágenes de productos específicos */}
        <Reveal className="hero__visual" variant="zoom" delay="d2">
          <div className="hero__cluster">
            <figure className="hero__card hero__card--main">
              <img src="/img/service-web.jpg" alt="Código y desarrollo web" loading="eager" />
              <figcaption>Desarrollo a medida</figcaption>
            </figure>
            <figure className="hero__card hero__card--app">
              <img src="/img/hero-apps.jpg" alt="Aplicación móvil" />
              <figcaption>App móvil</figcaption>
            </figure>
            <figure className="hero__card hero__card--iot">
              <img src="/img/hero-circuit.jpg" alt="Sistema IoT / hardware" />
              <figcaption>IoT · Hardware</figcaption>
            </figure>
            <div className="hero__chip hero__chip--ship">Entregamos en semanas, no meses</div>
          </div>
        </Reveal>
      </div>

      {/* Stats */}
      <div className="wb-container">
        <Reveal className="hero__stats" delay="d2">
          {STATS.map((s, i) => (
            <div className="hero__stat" key={i}>
              <span className="hero__stat-n">
                <CountUp to={s.n} suffix={s.suffix} />
              </span>
              <span className="hero__stat-l">
                {s.label.split('\n').map((t, j) => (
                  <span key={j}>{t}<br /></span>
                ))}
              </span>
            </div>
          ))}
        </Reveal>
      </div>

      {/* Marquee */}
      <div className="hero__marquee wb-marquee" aria-hidden="true">
        <div className="wb-marquee__track">
          {[...KEYWORDS, ...KEYWORDS].map((k, i) => (
            <span className="hero__kw" key={i}>
              {k} <b>✦</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
