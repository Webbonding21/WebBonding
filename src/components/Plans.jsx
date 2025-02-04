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

function Plans() {
  return (
    <section className="plans-section">
      <div className="plans-container">
        {plans.map((plan, index) => (
          <div className={`plan-card ${index === 0 ? 'simple' : index === 1 ? 'pro' : 'master'}`} key={index}>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <ul>{plan.features.map((feature, i) => <li key={i}>{feature}</li>)}</ul>
            <button className='obtenerServicio'>Obtener Servicio</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Plans;
