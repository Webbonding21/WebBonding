import React from 'react';
import Reveal from './Reveal';
import '../assets/Plans.css';

const PLANS = [
  {
    name: 'StartUp',
    tagline: 'Para validar y tener presencia',
    price: 'Consultar',
    features: ['Landing page moderna', 'Diseño 100% responsivo', 'Botón directo a WhatsApp', 'Hosting incluido (1 año)', 'SEO básico'],
  },
  {
    name: 'Business Growth',
    tagline: 'Para negocios en expansión',
    price: 'Consultar',
    featured: true,
    features: ['Sitio corporativo (hasta 10 págs)', 'Catálogo o e-commerce', 'Panel administrativo', 'Blog / Noticias', 'Integración de pagos'],
  },
  {
    name: 'Enterprise & IoT',
    tagline: 'Automatización y software a medida',
    price: 'A medida',
    features: ['Software full-stack a medida', 'Integración hardware / IoT', 'Apps móviles nativas', 'ERP / CRM personalizado', 'Soporte prioritario 24/7'],
  },
];

const sendWhatsAppMessage = (planName) => {
  const phone = '584121510662';
  const message = `Hola Web Bonding! 👋\nMe interesa llevar mi negocio al siguiente nivel con el plan *${planName}*.\n\nQuisiera agendar una asesoría para discutir mi proyecto. 🚀`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

function Plans() {
  return (
    <section id="plans" className="plans wb-section wb-section--paper">
      <div className="wb-container">
        <div className="plans__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">// Planes</Reveal>
            <Reveal as="h2" className="wb-h2 plans__title" delay="d1">
              Inversión <em>inteligente</em>.
            </Reveal>
          </div>
          <Reveal as="p" className="plans__sub" delay="d2">
            Elige la escala que tu visión necesita hoy. Sin letra chica: presupuesto
            claro antes de empezar.
          </Reveal>
        </div>

        <div className="plans__grid">
          {PLANS.map((plan, i) => (
            <Reveal
              className={`plan-card ${plan.featured ? 'plan-card--featured' : ''}`}
              key={plan.name}
              delay={`d${i + 1}`}
            >
              {plan.featured && <span className="plan-card__badge">Más popular</span>}
              <div className="plan-card__head">
                <h3>{plan.name}</h3>
                <p className="plan-card__tagline">{plan.tagline}</p>
              </div>
              <div className="plan-card__price">
                <span className="plan-card__from">desde</span>
                <strong>{plan.price}</strong>
              </div>
              <ul className="plan-card__features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button className="plan-card__btn" onClick={() => sendWhatsAppMessage(plan.name)}>
                Cotizar ahora <span className="wb-btn__arrow">→</span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal as="p" className="plans__note" delay="d2">
          ¿No encaja ninguno? <a href="#contact">Armamos un plan a tu medida →</a>
        </Reveal>
      </div>
    </section>
  );
}

export default Plans;
