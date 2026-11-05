import Reveal from './Reveal';
import StepForModal from './StepForModal';
import { PILARES } from '../data/sitio';
import { numero, useContenido } from '../lib/contenido';
import '../assets/About.css';

// los pilares se cambian en /admin (sección «pilares»)
function About() {
  const pilares = useContenido('pilares', PILARES);
  return (
    <section id="about" className="about wb-section wb-section--paper">
      <div className="wb-container about__inner">
        {/* Media */}
        <div className="about__media">
          <Reveal variant="from-left" className="about__img about__img--main">
            <img src="/img/team.jpg" alt="Equipo de Web Bonding trabajando" />
            <div className="about__badge">
              <b>Diseño + Ingeniería</b>
              <span>bajo un mismo techo</span>
            </div>
          </Reveal>
          <Reveal variant="zoom" delay="d3" className="about__img about__img--inset">
            <img src="/img/team2.jpg" alt="Colaboración del equipo de desarrollo" />
          </Reveal>
        </div>

        {/* Contenido */}
        <div className="about__content">
          <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">{'// El estudio'}</Reveal>
          <Reveal as="h2" className="wb-h2 about__title" delay="d1">
            No vendemos código.
            <br />
            Construimos lo que hace <em>crecer</em> tu negocio.
          </Reveal>
          <Reveal as="p" className="about__lead" delay="d2">
            Somos un equipo venezolano que diseña y programa apps, páginas web y
            sistemas a la medida, y los conecta con equipos físicos cuando tu
            negocio lo necesita.
          </Reveal>

          {pilares.length > 0 && (
            <div className="about__list">
              {pilares.map((p, i) => (
                <Reveal className="about__item" key={i} delay={`d${i + 1}`}>
                  <span className="about__num">{numero(i)}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <Reveal className="wb-comenzar wb-comenzar--izq"><StepForModal label="Comenzar ahora" /></Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;
