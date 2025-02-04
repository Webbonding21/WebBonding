import React from 'react';
import '../assets/Home.css';

function About() {
  return (
    <section id="about" className="about">
      <div className="about-content">
        <h2>🚀🚀🚀 Transformamos tu Visión en una Potente Realidad Digital 🚀🚀🚀</h2>
        <p className="aboutTxt">
          En <strong>Web Bonding</strong>, no solo creamos páginas web, <strong>creamos experiencias digitales </strong> 
           que generan impacto, aumentan conversiones y fortalecen tu marca.
        </p>
        <p className="aboutTxt">
          Tu negocio merece más que una web estándar. Diseñamos plataformas <strong>modernas, rápidas y efectivas</strong> 
          que destacan y conectan con tu audiencia. 
        </p>
        <p className="aboutTxt">
          ¡Demos juntos el siguiente gran paso en tu presencia digital! 💡
        </p>
      </div>
      <img src="/logoennegro.png" alt="Web Bonding" className="about-logo" draggable="false"/>
    </section>
  );
}

export default About;
