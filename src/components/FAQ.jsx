import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Reveal from './Reveal';
import StepForModal from './StepForModal';
import { PREGUNTAS } from '../data/sitio';
import { useContenido } from '../lib/contenido';
import '../assets/FAQ.css';

// las preguntas se cambian en /admin (sección «preguntas»); el JSON-LD FAQPage del index.html trae las de siempre.
// Sin ninguna visible, la sección no sale.
function PreguntasFrecuentes() {
  const preguntas = useContenido('preguntas', PREGUNTAS);
  const [open, setOpen] = useState(0);
  if (!preguntas.length) return null;

  return (
    <section id="faq" className="faq wb-section wb-section--paper" aria-labelledby="faq-title">
      <div className="wb-container">
        <div className="faq__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">{'// Preguntas frecuentes'}</Reveal>
            <Reveal as="h2" id="faq-title" className="wb-h2 faq__title" delay="d1">
              Todo lo que quieres saber<br />sobre <em>Web Bonding</em>.
            </Reveal>
          </div>
          <Reveal as="p" className="faq__sub" delay="d2">
            Si tienes alguna duda que no esté aquí, escríbenos por WhatsApp al{' '}
            <a href="https://wa.me/584220579731" target="_blank" rel="noopener noreferrer">
              +58 422 057 9731
            </a>{' '}
            y te respondemos hoy.
          </Reveal>
        </div>

        <ul className="faq__list" itemScope itemType="https://schema.org/FAQPage">
          {preguntas.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal
                as="li"
                className={`faq__item ${isOpen ? 'is-open' : ''}`}
                key={i}
                delay={`d${(i % 4) + 1}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  className="faq__q"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span itemProp="name">{f.q}</span>
                  <span className="faq__icon" aria-hidden="true"><FaPlus /></span>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  className="faq__a"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p itemProp="text">{f.a}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
        <Reveal className="wb-comenzar"><StepForModal label="Comenzar ahora" /></Reveal>
      </div>
    </section>
  );
}

export default PreguntasFrecuentes;
