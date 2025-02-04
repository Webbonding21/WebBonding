import React from 'react';
import '../assets/Home.css';

function Services() {
  return (
    <section id="services" className='services'>
      <h1 className='bannerTxt2'>Tu experiencia es nuestra <strong>Prioridad</strong></h1>
      <h3 className='Smalltext2'>Tu <strong> transformación digital</strong> será</h3>
      <ul className='caracteristicas'>
        {[
          { img: "/personalizada.png", title: "Personalizada", text: "Nos adaptamos a las necesidades de tu marca" },
          { img: "/documentacion.png", title: "Documentada", text: "Aprenderás a usar todas las herramientas de tu solución digital" },
          { img: "/responsive.png", title: "Responsiva", text: "Ajustable a los diferentes dispositivos: tablets, celulares y PCs" },
          { img: "/segura.png", title: "100% Segura", text: "Tu información estará completamente respaldada y asegurada" }
        ].map((service, index) => (
          <li className='caracteristica' key={index}>
            <div className='img-container'><img src={service.img} alt="" /></div>
            <h1>{service.title}</h1>
            <p>{service.text}</p>
          </li>
        ))}
      </ul>
      
    </section>
  );
}

export default Services;
