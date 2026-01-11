import '../assets/Plans.css';

const plans = [
  {
    name: "StartUp",
    tagline: "Ideal para validación y presencia",
    price: "Consultar",
    features: ["Landing Page Moderna", "Diseño Responsivo", "Botón a WhatsApp", "Hosting Incluido (1 año)", "SEO Básico"]
  },
  {
    name: "Business Growth",
    tagline: "Para negocios en expansión",
    featured: true, // Destacado
    price: "Consultar",
    features: ["Sitio Web Corporativo (10 pags)", "Catálogo o E-commerce", "Panel Administrativo", "Blog / Noticias", "Integración de Pagos"]
  },
  {
    name: "Enterprise & IoT",
    tagline: "Automatización y Sistemas a Medida",
    price: "A Medida",
    features: ["Desarrollo de Software Full Stack", "Integración Hardware/Sensores (IoT)", "Apps Móviles Nativas", "Sistemas ERP/CRM Personalizados", "Soporte Prioritario 24/7"]
  }
];

const sendWhatsAppMessage = (planName) => {
  const phoneNumber = "584121510662"; 
  const message = `Hola Web Bonding! 👋\nMe interesa llevar mi negocio al siguiente nivel con el plan *${planName}*.\n\nQuisiera agendar una asesoría para discutir mi proyecto. 🚀`;
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
};

function Plans() {
  return (
    <section className="plans-section">
      <div className="plans-header">
        <h2 className="plans-title">Inversión Inteligente</h2>
        <p className="plans-subtitle">Elige la escala que tu visión necesita hoy.</p>
      </div>
      
      <div className="plans-container">
        {plans.map((plan, index) => (
          <div className={`plan-card ${plan.featured ? 'featured' : ''}`} key={index}>
            {plan.featured && <div className="featured-badge">Más Popular</div>}
            <div className="plan-header-content">
              <h3>{plan.name}</h3>
              <p className="plan-tagline">{plan.tagline}</p>
            </div>
            
            <div className="plan-body">
              <ul className="plan-features">
                {plan.features.map((feat, i) => <li key={i}>{feat}</li>)}
              </ul>
              <button className="plan-btn" onClick={() => sendWhatsAppMessage(plan.name)}>
                Cotizar Ahora
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Plans;