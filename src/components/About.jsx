import React from 'react';
import '../assets/About.css';

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-text-wrapper">
          <h2 className="section-title">Ingeniería Digital de <span className="highlight">Siguiente Nivel</span></h2>
          <p className="about-lead">
            En <strong>Web Bonding</strong>, fusionamos código limpio, diseño estratégico e innovación de hardware para crear ecosistemas digitales robustos.
          </p>
          <div className="about-grid-text">
            <div className="about-item">
              <h3>🎯 Enfoque en Resultados</h3>
              <p>No vendemos "código", vendemos eficiencia, automatización y escalabilidad para tu empresa.</p>
            </div>
            <div className="about-item">
              <h3>⚡ Velocidad & Seguridad</h3>
              <p>Infraestructuras optimizadas, seguras y rápidas. Desde el frontend hasta el servidor.</p>
            </div>
            <div className="about-item">
              <h3>🔌 Conexión Mundo Real</h3>
              <p>Vamos más allá de la pantalla. Integramos software con hardware (IoT) para controlar tu entorno.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;