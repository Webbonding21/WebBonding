// src/App.jsx
import React from 'react';
import '../assets/Home.css';
import StepForModal from '../components/StepForModal';

function Home() {
  return (
    <main>
      <section id='home' className="hero">
        <div className="hero-content">
          <h1 className='bannerTxt'>Haz tu página web o software en línea con <strong><h1>Web Bonding</h1></strong></h1>
          <p className='portadaSmalltext'>Experiencias Web que Impulsan tu Éxito</p>
          {/*<button className="cta-button">Crea tu transformación digital</button>}*/}
          <StepForModal />
          <img src="/imagenHome.svg" alt="Digital Transformation" className="hero-image" draggable="false"/>
        </div>
      </section>
      
      <section id="about" className="about">
        <div className="about-content">
          <h2>¿Quiénes somos?</h2>
          <p className='aboutTxt'>En <strong>Web Bonding</strong> nos dedicamos a crear <strong>experiencias web excepcionales</strong> que cautivan a tus clientes y hacen crecer tu negocio. Desde diseños web profesionales hasta poderosas soluciones de e-commerce y sistemas administrativos personalizados, nuestra pasión y experiencia se reflejan en cada solución digital.</p>
          <p className='aboutTxt'>Descubre cómo podemos llevar tu presencia en línea al siguiente nivel y alcanzar juntos nuevos horizontes digitales.</p>
        </div>
        <img src="/logoennegro.png" alt="Web Bonding" className="about-logo" draggable="false"/>
      </section>

      <section id="services" className='services'>
        <h1 className='bannerTxt2'>Tu experiencia es nuestra <strong>Prioridad</strong></h1>
        <h3 className='Smalltext2'>Tu <strong> transformacion digital</strong> será</h3>
        <ul className='caracteristicas'>
          <li className='caracteristica'>
            <div className='img-container'><img src="/personalizada.png" alt="" /></div>
            <h1>Personalizada</h1>
            <p>Nos adaptamos a las necesidades de tu marca</p>
          </li>
          <li className='caracteristica'>
            <div className='img-container'><img src="/documentacion.png" alt="" /></div>
            <h1>Documentada</h1>
            <p>Aprenderás a usar todas las herramientas de tu solución digital</p>
          </li>
          <li className='caracteristica'>
            <div className='img-container'><img src="/responsive.png" alt="" /></div>
            <h1>Responsiva</h1>
            <p>Ajustable a los diferentes dispositivos: tablets, celulares y PCs</p>
          </li>
          <li className='caracteristica'>
            <div className='img-container'><img src="/segura.png" alt="" /></div>
            <h1>100% Segura</h1>
            <p>Tu información estará completamente respaldada y asegurada</p>
          </li>
          <h1 className="PreciosTxt">Conoce nuestros planes</h1>
        </ul>
        
      </section>
      <section className="plans-section">
  <div className="plans-container">
    <div className="plan-card simple">
      <h2>Plan Emprendedor</h2>
      {/* <p>Precios desde</p> */}
      {/* <p className="price">150$ - 350$</p> */}
      <p>Pequeñas empresas y emprendedores individuales</p>
      {/* <p><strong>Pago único o en cuotas.</strong></p> */}
      <ul>
        <li>Landing page personalizada</li>
        <li>Sitios web de hasta 5 páginas</li>
        <li>Blog o sitio de portafolio</li>
        <li>Pequeña tienda en línea</li>
      </ul>
      <button className='obtenerServicio'>Obtener Servicio</button>
    </div>
    <div className="plan-card pro">
      <h2>Plan Profesional</h2>
      {/* <p>Precios desde</p> */}
      {/* <p className="price">400$ - 650$</p> */}
      <p>Empresas medianas y negocios en crecimiento</p>
      {/* <p><strong>Pago único o en cuotas.</strong></p> */}
      <ul>
        <li>Sitio web de hasta 10 páginas</li>
        <li>Tienda virtual avanzada</li>
        <li>Portales de membresía/sitios de afiliación</li>
        <li>Desarrollo de aplicación web básica</li>
        <li>Sistema administrativo</li>
      </ul>
      <button className='obtenerServicio'>Obtener Servicio</button>
    </div>
    <div className="plan-card master">
      <h2>Plan Master</h2>
      {/* <p>Precios desde</p> */}
      {/* <p className="price">700$ - 1500$</p> */}
      <p>Empresas de alto alcance y organizaciones que requieren de soluciones digitales personalizadas</p>
      {/* <p><strong>Pago único o en cuotas.</strong></p> */}
      <ul>
        <li>Sitio web sin límite de páginas</li>
        <li>Tienda en línea profesional</li>
        <li>Plataforma de e-learning</li>
        <li>Desarrollo de aplicación web compleja y personalizada</li>
        <li>Soluciones de software empresarial</li>
      </ul>
      <button className='obtenerServicio'>Obtener Servicio</button>
    </div>
  </div>
</section>

<section id="technologies" className="technologies">
  <h2 className='TecnologiasTxt'>Tecnologías que Usamos</h2>
  <div className="tech-list">
    <div className="tech-item">
      <img src="/html.webp" alt="HTML" className="tech-logo" />
      <h3>HTML</h3>
    </div>
    <div className="tech-item">
      <img src="/css.png" alt="CSS" className="tech-logo" />
      <h3>CSS</h3>
    </div>
    <div className="tech-item">
      <img src="/tailwind.webp" alt="Tailwind CSS" className="tech-logo" />
      <h3>Tailwind CSS</h3>
    </div>
    <div className="tech-item">
      <img src="/sass.png" alt="Sass" className="tech-logo" />
      <h3>Sass</h3>
    </div>
    <div className="tech-item">
      <img src="/javascript.png" alt="JavaScript" className="tech-logo" />
      <h3>JavaScript</h3>
    </div>
    <div className="tech-item">
      <img src="/sql.png" alt="SQL" className="tech-logo" />
      <h3>SQL</h3>
    </div>
    <div className="tech-item">
      <img src="/react.png" alt="React" className="tech-logo" />
      <h3>React</h3>
    </div>
    <div className="tech-item">
      <img src="/nodejs.png" alt="Node.js" className="tech-logo" />
      <h3>Node.js</h3>
    </div>
    <div className="tech-item">
      <img src="/express.png" alt="Express" className="tech-logo" />
      <h3>Express</h3>
    </div>
    <div className="tech-item">
      <img src="/mongodb.png" alt="MongoDB" className="tech-logo" />
      <h3>MongoDB</h3>
    </div>
    <div className="tech-item">
      <img src="/php.svg" alt="PHP" className="tech-logo" />
      <h3>PHP</h3>
    </div>
    <div className="tech-item">
      <img src="/flask.webp" alt="Flask" className="tech-logo" />
      <h3>Flask</h3>
    </div>
    <div className="tech-item">
      <img src="/python.png" alt="Python" className="tech-logo" />
      <h3>Python</h3>
    </div>
    <div className="tech-item">
      <img src="/typescript.png" alt="TypeScript" className="tech-logo" />
      <h3>TypeScript</h3>
    </div>
    <div className="tech-item">
      <img src="/wordpress.jpg" alt="WordPress" className="tech-logo" />
      <h3>WordPress</h3>
    </div>
    <div className="tech-item">
      <img src="/vite.png" alt="Vite" className="tech-logo" />
      <h3>Vite</h3>
    </div>
  </div>
</section>
    </main>
  );
}

export default Home;
