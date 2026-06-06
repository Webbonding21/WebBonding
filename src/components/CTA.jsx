import React from 'react';
import StepForModal from './StepForModal';
import Reveal from './Reveal';
import { SiWhatsapp } from 'react-icons/si';
import { HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';
import '../assets/CTA.css';

const waLink = `https://wa.me/584121510662?text=${encodeURIComponent(
  'Hola Web Bonding! 👋 Quiero hablar sobre un proyecto.'
)}`;

function CTA() {
  return (
    <section id="contact" className="cta wb-grain">
      <div className="cta__grid-bg" aria-hidden="true" />
      <div className="wb-container cta__inner">
        <div className="cta__text">
          <Reveal as="span" className="wb-eyebrow cta__eyebrow">// Hablemos</Reveal>
          <Reveal as="h2" className="cta__title" delay="d1">
            ¿Listo para construir<br />algo que <em>importe</em>?
          </Reveal>
          <Reveal as="p" className="cta__sub" delay="d2">
            Cuéntanos tu idea. Te respondemos hoy con próximos pasos claros y un
            presupuesto sin compromiso.
          </Reveal>

          <Reveal className="cta__actions" delay="d3">
            <div className="cta__primary"><StepForModal /></div>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="cta__wa">
              <SiWhatsapp /> Escríbenos por WhatsApp
            </a>
          </Reveal>

          <Reveal className="cta__contacts" delay="d4">
            <a href="mailto:webbonding21@gmail.com"><HiOutlineMail /> webbonding21@gmail.com</a>
            <span><HiOutlineLocationMarker /> Acarigua–Araure, VE</span>
          </Reveal>
        </div>

        <Reveal className="cta__media" variant="zoom" delay="d2">
          <img src="/img/contact-team.jpg" alt="Equipo de Web Bonding listo para tu proyecto" loading="lazy" />
          <span className="cta__media-chip">Respuesta &lt; 24h</span>
        </Reveal>
      </div>
    </section>
  );
}

export default CTA;
