import Reveal from './Reveal';
import StepForModal from './StepForModal';
import { PROYECTOS } from '../data/sitio';
import { useContenido } from '../lib/contenido';
import '../assets/Work.css';

const wa = (name) =>
  `https://wa.me/584220579731?text=${encodeURIComponent(
    `Hola Web Bonding! 👋 Vi el proyecto *${name}* y quiero construir algo así para mi negocio.`
  )}`;

// el ancho de cada tarjeta en la grilla de 12 (Work.css)
const ANCHOS = ['span-7', 'span-5', 'span-4'];

// los proyectos se cambian en /admin (sección «proyectos»); sin ninguno visible, la sección no sale
function Work() {
  const proyectos = useContenido('proyectos', PROYECTOS);
  if (!proyectos.length) return null;
  return (
    <section id="work" className="work wb-section wb-section--paper">
      <div className="wb-container">
        <div className="work__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">{'// Proyectos'}</Reveal>
            <Reveal as="h2" className="wb-h2 work__title" delay="d1">
              Casos reales,<br />resultados <em>reales</em>.
            </Reveal>
          </div>
          <Reveal as="p" className="work__sub" delay="d2">
            Una muestra de lo que hemos construido para clientes en Venezuela y
            Latinoamérica: de apps con miles de pedidos a plantas industriales conectadas.
          </Reveal>
        </div>

        <div className="work__grid">
          {proyectos.map((p, i) => (
            <Reveal
              as="a"
              href={wa(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={`work-card ${ANCHOS.includes(p.span) ? p.span : 'span-4'}`}
              key={i}
              delay={`d${(i % 3) + 1}`}
              style={{ '--card-accent': p.accent }}
            >
              <div className="work-card__top">
                <span className="work-card__cat">{p.cat}</span>
                <span className="work-card__yr">{p.year}</span>
              </div>

              <div className="work-card__mid">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>

              <div className="work-card__bot">
                <div className="work-card__tags">
                  {(p.tags ?? []).map((t, j) => (
                    <span className="work-card__tag" key={j}>{t}</span>
                  ))}
                </div>
                <span className="work-card__go">Quiero algo así <b>→</b></span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="wb-comenzar"><StepForModal label="Comenzar ahora" /></Reveal>
      </div>
    </section>
  );
}

export default Work;
