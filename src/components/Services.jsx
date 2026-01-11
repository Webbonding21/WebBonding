import '../assets/Services.css';

// Datos estructurados para fácil mantenimiento
const serviceCategories = [
  {
    icon: "💻", 
    title: "Desarrollo Web & Apps",
    desc: "Plataformas modernas, rápidas y escalables.",
    features: ["Landing Pages & Corporativas", "E-commerce & Tiendas Virtuales", "Web Apps (PWA) & Dashboards", "Apps Móviles (iOS/Android)"]
  },
  {
    icon: "⚙️",
    title: "Backend & Sistemas",
    desc: "El motor inteligente de tu negocio.",
    features: ["Sistemas ERP/CRM a Medida", "APIs REST & GraphQL", "Bases de Datos Robustas", "Integración con Pasarelas de Pago"]
  },
  {
    icon: "📡",
    title: "IoT & Hardware",
    desc: "Conectamos el mundo físico con el digital.",
    features: ["Sensores & Monitoreo Remoto", "Automatización Industrial", "Control vía Web/App", "Telemetría en Tiempo Real"]
  },
  // {
  //   icon: "☁️",
  //   title: "Infraestructura & DevOps",
  //   desc: "Tu tecnología siempre activa y segura.",
  //   features: ["Despliegue en la Nube (AWS/Google)", "Seguridad & Encriptación", "Mantenimiento & Soporte", "Consultoría Tecnológica"]
  // }
];

function Services() {
  return (
    <section id="services" className='services-section'>
      <div className="services-header">
        <h2 className='services-title'>Nuestro Ecosistema de <span className="text-gradient">Servicios</span></h2>
        <p className='services-subtitle'>Cubrimos todo el ciclo de vida del software: desde el diseño visual hasta el sensor físico.</p>
      </div>

      <div className='services-grid'>
        {serviceCategories.map((cat, index) => (
          <div className='service-card' key={index}>
            <div className="card-icon">{cat.icon}</div>
            <h3>{cat.title}</h3>
            <p className="card-desc">{cat.desc}</p>
            <ul className="service-list">
              {cat.features.map((item, i) => (
                <li key={i}>✓ {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;