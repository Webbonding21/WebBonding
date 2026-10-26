import React from 'react';
import Reveal from './Reveal';
import StepForModal from './StepForModal';
import '../assets/About.css';

const PILLARS = [
  {
    n: '01',
    title: 'Enfoque en resultados',
    desc: 'No entregamos «código»: entregamos orden, tiempo ahorrado y un negocio listo para crecer.',
  },
  {
    n: '02',
    title: 'Rápido y seguro',
    desc: 'Apps que cargan rápido y datos protegidos, desde lo que ve tu cliente hasta el servidor donde se guarda todo.',
  },
  {
    n: '03',
    title: 'Más allá de la pantalla',
    desc: 'Conectamos tu app con equipos físicos (sensores, máquinas, cámaras) para que los veas y controles desde el teléfono.',
  },
];

function About() {
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
          <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">// El estudio</Reveal>
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

          <div className="about__list">
            {PILLARS.map((p, i) => (
              <Reveal className="about__item" key={p.n} delay={`d${i + 1}`}>
                <span className="about__num">{p.n}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="wb-comenzar wb-comenzar--izq"><StepForModal label="Comenzar ahora" /></Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;
