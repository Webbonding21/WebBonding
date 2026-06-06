import React from 'react';
import Reveal from './Reveal';
import '../assets/About.css';

const PILLARS = [
  {
    n: '01',
    title: 'Enfoque en resultados',
    desc: 'No entregamos «código»: entregamos eficiencia, automatización y escalabilidad que se nota en tu operación.',
  },
  {
    n: '02',
    title: 'Velocidad & seguridad',
    desc: 'Infraestructura optimizada, encriptada y rápida. Del primer pixel del frontend hasta el último query del servidor.',
  },
  {
    n: '03',
    title: 'Del pixel al sensor',
    desc: 'Vamos más allá de la pantalla: integramos software con hardware (IoT) para controlar tu entorno físico en tiempo real.',
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
            Construimos <em>ventaja competitiva</em>.
          </Reveal>
          <Reveal as="p" className="about__lead" delay="d2">
            Somos un estudio venezolano de producto digital. Unimos estrategia,
            diseño e ingeniería para construir ecosistemas robustos: del software a
            medida al hardware conectado.
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
        </div>
      </div>
    </section>
  );
}

export default About;
