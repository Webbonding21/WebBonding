import React from 'react';
import Reveal from './Reveal';
import '../assets/Process.css';

const STEPS = [
  { n: '01', title: 'Descubrimiento', desc: 'Entendemos tu negocio, objetivos y usuarios. Definimos alcance, presupuesto y métricas de éxito.' },
  { n: '02', title: 'Diseño & Prototipo', desc: 'Arquitectura, UX/UI y un prototipo navegable. Validamos antes de escribir la primera línea.' },
  { n: '03', title: 'Desarrollo & QA', desc: 'Construimos por sprints con entregas visibles. Código limpio, pruebas y revisiones continuas.' },
  { n: '04', title: 'Lanzamiento & Soporte', desc: 'Desplegamos, medimos y acompañamos. Iteramos con datos reales y soporte prioritario.' },
];

function Process() {
  return (
    <section id="process" className="process wb-section wb-section--ink wb-grain">
      <div className="wb-container">
        <div className="process__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">// Cómo trabajamos</Reveal>
            <Reveal as="h2" className="wb-h2 process__title" delay="d1">
              De la idea<br />al <em>deploy</em>.
            </Reveal>
          </div>
          <Reveal as="p" className="process__sub" delay="d2">
            Un método claro y sin sorpresas. Tú ves avances reales cada semana;
            nosotros nos encargamos de la complejidad.
          </Reveal>
        </div>

        <div className="process__grid">
          <span className="process__line" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal className="process__step" key={s.n} delay={`d${i + 1}`}>
              <span className="process__dot" />
              <span className="process__num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Process;
