import React from 'react';
import '../assets/Home.css';

function About() {
  return (
    <section id="about" className="about">
      <div className="about-content">
        <h2>¿Quiénes somos?</h2>
        <p className='aboutTxt'>
          En <strong>Web Bonding</strong> nos dedicamos a crear <strong>experiencias web excepcionales</strong> 
          que cautivan a tus clientes y hacen crecer tu negocio.
        </p>
        <p className='aboutTxt'>
          Descubre cómo podemos llevar tu presencia en línea al siguiente nivel y alcanzar juntos nuevos horizontes digitales.
        </p>
      </div>
      <img src="/logoennegro.png" alt="Web Bonding" className="about-logo" draggable="false"/>
    </section>
  );
}

export default About;
