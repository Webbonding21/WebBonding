import StepForModal from './StepForModal';
import Reveal from './Reveal';
import CountUp from './CountUp';
import { CIFRAS, PALABRAS } from '../data/sitio';
import { useContenido } from '../lib/contenido';
import '../assets/Hero.css';

// las cifras y la cinta de palabras se cambian en /admin (secciones «cifras» y «palabras»)
function Hero() {
  const cifras = useContenido('cifras', CIFRAS);
  const palabras = useContenido('palabras', PALABRAS).filter((p) => p.texto);
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
      {cifras.length > 0 && (
        <div className="wb-container">
          <Reveal className="hero__stats" delay="d2">
            {cifras.map((s, i) => (
              <div className="hero__stat" key={i}>
                <span className="hero__stat-n">
                  <CountUp to={Number(s.n) || 0} suffix={s.suffix ?? ''} />
                </span>
                <span className="hero__stat-l">
                  {String(s.label ?? '').split('\n').map((t, j) => (
                    <span key={j}>{t}<br /></span>
                  ))}
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      )}

      {/* Marquee */}
      {palabras.length > 0 && (
        <div className="hero__marquee wb-marquee" aria-hidden="true">
          <div className="wb-marquee__track">
            {[...palabras, ...palabras].map((p, i) => (
              <span className="hero__kw" key={i}>
                {p.texto} <b>✦</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;
