import React from 'react';
import '../assets/Home.css';

const plans = [
  {
    name: "Plan Emprendedor",
    description: "Pequeñas empresas y emprendedores individuales",
    features: ["Landing page personalizada", "Sitios web de hasta 5 páginas", "Blog o sitio de portafolio", "Pequeña tienda en línea"]
  },
  {
    name: "Plan Profesional",
    description: "Empresas medianas y negocios en crecimiento",
    features: ["Sitio web de hasta 10 páginas", "Tienda virtual avanzada", "Portales de membresía/sitios de afiliación", "Desarrollo de aplicación web básica", "Sistema administrativo"]
  },
  {
    name: "Plan Master",
    description: "Empresas de alto alcance y organizaciones que requieren de soluciones digitales personalizadas",
    features: ["Sitio web sin límite de páginas", "Tienda en línea profesional", "Plataforma de e-learning", "Desarrollo de aplicación web compleja y personalizada", "Soluciones de software empresarial"]
  }
];

const sendWhatsAppMessage = (planName) => {
  const phoneNumber = "1234567890"; // Reemplaza con tu número de WhatsApp
  const message = `Hola, estoy interesado en el ${planName}. ¿Podrían darme más información?`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
};

function Plans() {
  return (
    <section className="plans-section">
      <h1 className="PreciosTxt">Conoce nuestros planes</h1>
      <div className="plans-container">
        {plans.map((plan, index) => (
          <div className={`plan-card ${index === 0 ? 'simple' : index === 1 ? 'pro' : 'master'}`} key={index}>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <ul>{plan.features.map((feature, i) => <li key={i}>{feature}</li>)}</ul>
            <button className='obtenerServicio' onClick={() => sendWhatsAppMessage(plan.name)}>
              Obtener Servicio
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Plans;