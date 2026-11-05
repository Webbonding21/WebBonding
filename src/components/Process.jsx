import { FiDownload } from 'react-icons/fi';
import Reveal from './Reveal';
import StepForModal from './StepForModal';
import { PASOS } from '../data/sitio';
import { numero, useContenido } from '../lib/contenido';
import '../assets/Process.css';

// los pasos se cambian en /admin (sección «pasos»)
function Process() {
  const pasos = useContenido('pasos', PASOS);
  return (
    <section id="process" className="process wb-section wb-section--ink wb-grain">
      <div className="wb-container">
        <div className="process__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">{'// Cómo trabajamos'}</Reveal>
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

        {pasos.length > 0 && (
          <div className="process__grid">
            <span className="process__line" aria-hidden="true" />
            {pasos.map((s, i) => (
              <Reveal className="process__step" key={i} delay={`d${i + 1}`}>
                <span className="process__dot" />
                <span className="process__num">{numero(i)}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="wb-comenzar"><StepForModal label="Comenzar ahora" /></Reveal>
      </div>
    </section>
  );
}

export default Process;
