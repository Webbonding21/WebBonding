import React from 'react';
import Reveal from './Reveal';
import '../assets/Services.css';

const SERVICES = [
  {
    n: '01',
    icon: '💻',
    img: '/img/service-web.jpg',
    title: 'Desarrollo Web & Apps',
    desc: 'Plataformas modernas, rápidas y escalables que tus clientes disfrutan usar.',
    features: ['Landing & corporativas', 'E-commerce & tiendas', 'Web Apps (PWA) & dashboards', 'Apps móviles iOS / Android'],
    mod: 'a',
  },
  {
    n: '02',
    icon: '⚙️',
    img: '/img/service-data.jpg',
    title: 'Backend & Sistemas',
    desc: 'El motor inteligente que automatiza y ordena tu negocio.',
    features: ['Sistemas ERP / CRM a medida', 'APIs REST & GraphQL', 'Bases de datos robustas', 'Pasarelas de pago'],
    mod: 'b',
  },
  {
    n: '03',
    icon: '📡',
    img: '/img/service-iot.jpg',
    title: 'IoT & Hardware',
    desc: 'Conectamos el mundo físico con el digital. Software que toca la realidad.',
    features: ['Sensores & monitoreo remoto', 'Automatización industrial', 'Control vía web / app', 'Telemetría en tiempo real'],
    mod: 'c',
  },
];

function Services() {
  return (
    <section id="services" className="services wb-section wb-section--ink wb-grain">
      <div className="wb-container">
        <div className="services__header">
          <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent" style={{ color: 'var(--accent)' }}>
            // Qué hacemos
          </Reveal>
          <Reveal as="h2" className="wb-h2 services__title" delay="d1">
            Un estudio,<br />todo el <em>stack</em>.
          </Reveal>
          <Reveal as="p" className="services__sub" delay="d2">
            Cubrimos el ciclo completo del producto: del diseño visual al sensor físico.
            Tres frentes, un mismo equipo.
          </Reveal>
        </div>

        <div className="services__grid">
          {SERVICES.map((s, i) => (
            <Reveal as="article" className={`svc-card svc-card--${s.mod}`} key={s.n} delay={`d${i + 1}`}>
              <div className="svc-card__media">
                <img src={s.img} alt={s.title} loading="lazy" />
                <span className="svc-card__num">{s.n}</span>
              </div>
              <div className="svc-card__body">
                <h3><span className="svc-card__emoji">{s.icon}</span> {s.title}</h3>
                <p className="svc-card__desc">{s.desc}</p>
                <ul className="svc-card__list">
                  {s.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
