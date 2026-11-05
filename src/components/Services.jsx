import Reveal from './Reveal';
import StepForModal from './StepForModal';
import { SERVICIOS } from '../data/sitio';
import { numero, useContenido } from '../lib/contenido';
import '../assets/Services.css';

// los servicios se cambian en /admin (sección «servicios»); mod es el color de la tarjeta: a, b o c
function Services() {
  const servicios = useContenido('servicios', SERVICIOS);
  return (
    <section id="services" className="services wb-section wb-section--ink wb-grain">
      <div className="wb-container">
        <div className="services__header">
          <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent" style={{ color: 'var(--accent)' }}>
            {'// Qué hacemos'}
          </Reveal>
          <Reveal as="h2" className="wb-h2 services__title" delay="d1">
            Un solo equipo para tu web,<br />tu app y tu <em>sistema</em>.
          </Reveal>
          <Reveal as="p" className="services__sub" delay="d2">
            Diseñamos, programamos y te acompañamos después de entregar. Hablas con
            el mismo equipo de principio a fin.
          </Reveal>
        </div>

        {servicios.length > 0 && (
          <div className="services__grid">
            {servicios.map((s, i) => (
              <Reveal as="article" className={`svc-card svc-card--${s.mod || 'a'}`} key={i} delay={`d${i + 1}`}>
                <div className="svc-card__media">
                  {s.img && <img src={s.img} alt={s.title} loading="lazy" />}
                  <span className="svc-card__num">{numero(i)}</span>
                </div>
                <div className="svc-card__body">
                  <h3>{s.icon && <><span className="svc-card__emoji">{s.icon}</span>{' '}</>}{s.title}</h3>
                  <p className="svc-card__desc">{s.desc}</p>
                  <ul className="svc-card__list">
                    {(s.features ?? []).map((f, j) => (
                      <li key={j}>{f}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="wb-comenzar"><StepForModal label="Comenzar ahora" /></Reveal>
      </div>
    </section>
  );
}

export default Services;
