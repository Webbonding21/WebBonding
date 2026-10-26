import React from 'react';
import Reveal from './Reveal';
import StepForModal from './StepForModal';
import '../assets/Services.css';

const SERVICES = [
  {
    n: '01',
    icon: '💻',
    img: '/img/service-web.jpg',
    title: 'Páginas web y apps',
    desc: 'Páginas y apps rápidas, fáciles de usar y listas para crecer contigo.',
    features: ['Páginas de presentación y corporativas', 'Tiendas en línea', 'Apps web y paneles de control', 'Apps para iPhone y Android'],
    mod: 'a',
  },
  {
    n: '02',
    icon: '⚙️',
    img: '/img/service-data.jpg',
    title: 'Sistemas para tu negocio',
    desc: 'El sistema que ordena tu negocio y saca las cuentas por ti.',
    features: ['Sistemas administrativos (ERP / CRM)', 'Conexión con bancos, pagos y WhatsApp', 'Tus datos seguros y ordenados', 'Cobros en línea'],
    mod: 'b',
  },
  {
    n: '03',
    icon: '📡',
    img: '/img/service-iot.jpg',
    title: 'Equipos conectados (IoT)',
    desc: 'Conectamos tus máquinas y sensores a una app para verlos y controlarlos a distancia.',
    features: ['Sensores y monitoreo a distancia', 'Automatización industrial', 'Control desde la web o el teléfono', 'Datos de tus equipos en tiempo real'],
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
            Un solo equipo para tu web,<br />tu app y tu <em>sistema</em>.
          </Reveal>
          <Reveal as="p" className="services__sub" delay="d2">
            Diseñamos, programamos y te acompañamos después de entregar. Hablas con
            el mismo equipo de principio a fin.
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
        <Reveal className="wb-comenzar"><StepForModal label="Comenzar ahora" /></Reveal>
      </div>
    </section>
  );
}

export default Services;
