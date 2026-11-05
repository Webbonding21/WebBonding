import Reveal from './Reveal';
import StepForModal from './StepForModal';
import { PLANES } from '../data/sitio';
import { useContenido } from '../lib/contenido';
import '../assets/Plans.css';

const sendWhatsAppMessage = (planName) => {
  const phone = '584220579731';
  const message = `Hola Web Bonding! 👋\nMe interesa llevar mi negocio al siguiente nivel con el plan *${planName}*.\n\nQuisiera agendar una asesoría para discutir mi proyecto. 🚀`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

// los planes se cambian en /admin (sección «planes»); sin ninguno visible, la sección no sale
function Plans() {
  const planes = useContenido('planes', PLANES);
  if (!planes.length) return null;
  return (
    <section id="plans" className="plans wb-section wb-section--paper">
      <div className="wb-container">
        <div className="plans__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">{'// Planes'}</Reveal>
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
          {planes.map((plan, i) => (
            <Reveal
              className={`plan-card ${plan.featured ? 'plan-card--featured' : ''}`}
              key={i}
              delay={`d${i + 1}`}
            >
              {plan.featured && <span className="plan-card__badge">Más popular</span>}
              <div className="plan-card__head">
                <h3>{plan.name}</h3>
                <p className="plan-card__tagline">{plan.tagline}</p>
              </div>
              {plan.price && (
                <div className="plan-card__price">
                  <span className="plan-card__from">desde</span>
                  <strong>{plan.price}</strong>
                </div>
              )}
              <ul className="plan-card__features">
                {(plan.features ?? []).map((f, j) => (
                  <li key={j}>{f}</li>
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
        <Reveal className="wb-comenzar"><StepForModal label="Comenzar ahora" /></Reveal>
      </div>
    </section>
  );
}

export default Plans;
