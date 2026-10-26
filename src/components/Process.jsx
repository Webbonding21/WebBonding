import React from 'react';
import Reveal from './Reveal';
import StepForModal from './StepForModal';
import { FiDownload } from 'react-icons/fi';
import '../assets/Process.css';

const STEPS = [
  { n: '01', title: 'Te escuchamos', desc: 'Conocemos tu negocio y lo que necesitas. Definimos juntos qué vamos a construir, cuánto cuesta y cuándo estará listo.' },
  { n: '02', title: 'Diseño', desc: 'Te mostramos cómo se verá tu app, pantalla por pantalla, y la apruebas antes de programarla.' },
  { n: '03', title: 'Construcción y pruebas', desc: 'La construimos por etapas y cada semana ves el avance. La probamos a fondo antes de entregarla.' },
  { n: '04', title: 'En tu teléfono', desc: 'La publicamos en las tiendas o en la web y te acompañamos después con ajustes, mejoras y soporte.' },
];

function Process() {
  return (
    <section id="process" className="process wb-section wb-section--ink wb-grain">
      <div className="wb-container">
        <div className="process__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">// Cómo trabajamos</Reveal>
            <Reveal as="h2" className="wb-h2 process__title" delay="d1">
              De la idea<br />al <em>teléfono</em>.{' '}
              <FiDownload className="process__descarga" aria-hidden="true" />
            </Reveal>
          </div>
          <Reveal as="p" className="process__sub" delay="d2">
            Un camino claro y sin sorpresas: cada semana ves cómo avanza tu app, y
            nosotros nos encargamos de la parte técnica.
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
        <Reveal className="wb-comenzar"><StepForModal label="Comenzar ahora" /></Reveal>
      </div>
    </section>
  );
}

export default Process;
