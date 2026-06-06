import React from 'react';
import Reveal from './Reveal';
import '../assets/Work.css';

const wa = (name) =>
  `https://wa.me/584121510662?text=${encodeURIComponent(
    `Hola Web Bonding! 👋 Vi el proyecto *${name}* y quiero construir algo así para mi negocio.`
  )}`;

/* Colores de acento por tarjeta — variantes dentro de la paleta */
const PROJECTS = [
  {
    name: 'Riko',
    cat: 'Food-tech · App de delivery',
    year: '2025',
    desc: 'Marketplace de comida a domicilio: app del cliente, panel de restaurantes y módulo de repartidores con pagos y seguimiento en vivo.',
    tags: ['App móvil', 'Marketplace', 'Pagos', 'Tiempo real'],
    accent: '#7B2FBE',
    span: 'span-7',
  },
  {
    name: 'Llegate',
    cat: 'Movilidad · Ride-hailing',
    year: '2025',
    desc: 'Transporte urbano para Venezuela. Apps de pasajero y conductor con geolocalización y despacho en tiempo real.',
    tags: ['iOS/Android', 'GPS en vivo', 'Sockets'],
    accent: '#2E37FF',
    span: 'span-5',
  },
  {
    name: 'Planta Conectada',
    cat: 'IoT · Automatización industrial',
    year: '2024',
    desc: 'Monitoreo y control remoto de equipos con sensores, telemetría y alertas en tiempo real para plantas industriales.',
    tags: ['IoT', 'Telemetría', 'Hardware', 'Dashboard'],
    accent: '#1A1A2E',
    span: 'span-4',
  },
  {
    name: 'Automercado Digital',
    cat: 'Retail · E-commerce',
    year: '2024',
    desc: 'Catálogo en línea, carrito de compras y panel administrativo para cadenas de bodegones y automercados.',
    tags: ['E-commerce', 'Catálogo', 'Panel admin'],
    accent: '#0E3A2F',
    span: 'span-4',
  },
  {
    name: 'ERP / CRM a medida',
    cat: 'Sistemas · Software empresarial',
    year: '2024',
    desc: 'Gestión integral con módulos de facturación, dashboards en tiempo real, reportes y automatización de procesos para empresas y consultorios médicos.',
    tags: ['ERP', 'CRM', 'Dashboards', 'Roles', 'Reportes'],
    accent: '#1C1020',
    span: 'span-4',
  },
];

function Work() {
  return (
    <section id="work" className="work wb-section wb-section--paper">
      <div className="wb-container">
        <div className="work__header">
          <div>
            <Reveal as="span" className="wb-eyebrow wb-eyebrow--accent">// Proyectos</Reveal>
            <Reveal as="h2" className="wb-h2 work__title" delay="d1">
              Casos reales,<br />resultados <em>reales</em>.
            </Reveal>
          </div>
          <Reveal as="p" className="work__sub" delay="d2">
            Una muestra de lo que hemos construido para clientes en Venezuela y
            Latinoamérica — de apps con miles de pedidos a plantas industriales conectadas.
          </Reveal>
        </div>

        <div className="work__grid">
          {PROJECTS.map((p, i) => (
            <Reveal
              as="a"
              href={wa(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={`work-card ${p.span}`}
              key={p.name}
              delay={`d${(i % 3) + 1}`}
              style={{ '--card-accent': p.accent }}
            >
              <div className="work-card__top">
                <span className="work-card__cat">{p.cat}</span>
                <span className="work-card__yr">{p.year}</span>
              </div>

              <div className="work-card__mid">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>

              <div className="work-card__bot">
                <div className="work-card__tags">
                  {p.tags.map((t) => (
                    <span className="work-card__tag" key={t}>{t}</span>
                  ))}
                </div>
                <span className="work-card__go">Quiero algo así <b>→</b></span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Work;
