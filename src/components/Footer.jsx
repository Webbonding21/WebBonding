// src/components/Footer.jsx
import React from 'react';
import '../assets/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src="/logoenblanco.png" alt="Web Bonding Logo" draggable="false" />
          <h2>Web Bonding</h2>
        </div>
        <div className="footer-links">
          <a href="/">Inicio</a>
          <a href="/">Planes</a>
          <a href="/">Solicitar asesoría</a>
          <a href="/">Servicio técnico</a>
          <a href="/">Sobre nosotros</a>
        </div>
        <div className="footer-contact">
          <p>Experiencias Web que Impulsan tu Éxito</p>
          <h2>Web Bonding 2024</h2>
        </div>
        <div className="footer-social">
          <a href="https://wa.me/584121510662" target="_blank" rel="noopener noreferrer">
            <img className="iconos" src="/W.png" alt="WhatsApp" draggable="false" />
          </a>
          <a href="https://www.instagram.com/web.bonding?igsh=OXBjZmZ1emhza2M2" target="_blank" rel="noopener noreferrer">
            <img className="iconos" src="/I.png" alt="Instagram" draggable="false" />
          </a>
          <a href="https://www.facebook.com/profile.php?id=61556815558104&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer">
            <img className="iconos" src="/F.png" alt="Facebook" draggable="false" />
          </a>
          {/*<a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <img className="iconos" src="/X.png" alt="X" draggable="false" />
          </a>*/}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
