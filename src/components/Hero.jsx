import React from 'react';
import StepForModal from './StepForModal';
import '../assets/Hero.css'; 

function Hero() {
  return (
    <section id='home' className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          
          <h1 className='hero-title'>
            Materializa tu futuro digital con <span className="text-gradient">Web Bonding</span>
          </h1>
          
          <p className='hero-subtitle'>
            Desde aplicaciones web de alto impacto hasta sistemas IoT y automatización industrial. 
            Creamos la tecnología que tu negocio necesita para escalar.
          </p>
          
          <div className="hero-actions">
            <div className="cta-wrapper">
              <StepForModal /> 
            </div>
            <a href="#services" className="secondary-btn">Explorar Soluciones</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;