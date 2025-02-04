import React from 'react';
import StepForModal from './StepForModal';
import '../assets/Home.css';

function Hero() {
  return (
    <section id='home' className="hero">
      <div className="hero-content">
        <h1 className='bannerTxt'>
          Haz tu página web o software en línea con <strong>Web Bonding</strong>
        </h1>
        <p className='portadaSmalltext'>Experiencias Web que Impulsan tu Éxito</p>
        <StepForModal />
        <img src="/imagenHome.svg" alt="Digital Transformation" className="hero-image" draggable="false"/>
      </div>
    </section>
  );
}

export default Hero;
