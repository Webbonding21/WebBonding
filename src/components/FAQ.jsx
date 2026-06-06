import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Reveal from './Reveal';
import '../assets/FAQ.css';

/** Las mismas preguntas que están en el JSON-LD FAQPage del index.html.
 *  Mantenlas sincronizadas para que el contenido visible coincida con el schema. */
const FAQS = [
  {
    q: '¿Dónde está ubicada Web Bonding?',
    a: 'Web Bonding tiene sede en Acarigua–Araure, estado Portuguesa, Venezuela. Atendemos clientes presenciales en la región y trabajamos de forma remota con empresas de toda Venezuela y Latinoamérica.',
  },
  {
    q: '¿Qué tipo de proyectos desarrollan?',
    a: 'Construimos páginas web, e-commerce, aplicaciones móviles iOS y Android, sistemas ERP/CRM, agentes de Inteligencia Artificial, chatbots WhatsApp, soluciones IoT, automatización industrial y software a medida para cualquier industria.',
  },
  {
    q: '¿Cuánto cuesta hacer una página web o una app en Venezuela?',
    a: 'Una landing page profesional inicia desde aproximadamente 300 USD; un e-commerce desde 1.200 USD; y una aplicación móvil multiplataforma desde 2.700 USD. Todos los proyectos se cotizan a medida según funcionalidades. Solicita una cotización por WhatsApp al +58 412 151 0662.',
  },
  {
    q: '¿Trabajan con empresas fuera de Acarigua y Araure?',
    a: 'Sí. Aunque nuestra sede está en Acarigua–Araure, Portuguesa, atendemos remotamente a clientes de Barquisimeto, Caracas, Valencia, Maracay, Maracaibo y toda Latinoamérica (Colombia, México, Argentina, entre otros).',
  },
  {
    q: '¿Qué tecnologías usan?',
    a: 'Desarrollamos con React, Next.js, TypeScript, Node.js, Python, Flutter, Capacitor, Supabase, MongoDB, PostgreSQL y plataformas en la nube como AWS, Render y Vercel. Para IoT usamos Arduino, ESP32, Raspberry Pi y MQTT.',
  },
  {
    q: '¿En cuánto tiempo entregan un proyecto?',
    a: 'Una landing page se entrega en 1 a 2 semanas, un e-commerce en 4 a 6 semanas y una app móvil completa entre 8 y 12 semanas. Trabajamos por sprints con entregas visibles cada semana.',
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="faq wb-section wb-section--paper" aria-labelledby="faq-title">
      <div className="wb-container">
        <div className="faq__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">// Preguntas frecuentes</Reveal>
            <Reveal as="h2" id="faq-title" className="wb-h2 faq__title" delay="d1">
              Todo lo que quieres saber<br />sobre <em>Web Bonding</em>.
            </Reveal>
          </div>
          <Reveal as="p" className="faq__sub" delay="d2">
            Si tienes alguna duda que no esté aquí, escríbenos por WhatsApp al{' '}
            <a href="https://wa.me/584121510662" target="_blank" rel="noopener noreferrer">
              +58 412 151 0662
            </a>{' '}
            y te respondemos hoy.
          </Reveal>
        </div>

        <ul className="faq__list" itemScope itemType="https://schema.org/FAQPage">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal
                as="li"
                className={`faq__item ${isOpen ? 'is-open' : ''}`}
                key={f.q}
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
      </div>
    </section>
  );
}

export default FAQ;
