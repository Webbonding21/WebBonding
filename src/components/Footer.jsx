import React from 'react';
import { SiWhatsapp, SiInstagram, SiFacebook } from "react-icons/si"; // Iconos de marca
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi"; // Iconos generales
import '../assets/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* Columna 1: Marca y Misión */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <img src="/logoenblanco.png" alt="Web Bonding" draggable="false" />
            <span>Web Bonding</span>
          </div>
          <p className="footer-desc">
            Transformamos ideas en ecosistemas digitales. Desde el diseño web hasta la automatización industrial (IoT).
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="footer-col">
          <h3>Navegación</h3>
          <ul className="footer-links">
            <li><a href="#home">Inicio</a></li>
            <li><a href="#about">Nosotros</a></li>
            <li><a href="#services">Servicios</a></li>
            <li><a href="#plans">Planes</a></li>
          </ul>
        </div>

        {/* Columna 3: Servicios (SEO fuerte) */}
        <div className="footer-col">
          <h3>Soluciones</h3>
          <ul className="footer-links">
            <li><a href="#">Desarrollo Web & Apps</a></li>
            <li><a href="#">Sistemas IoT</a></li>
            <li><a href="#">E-commerce</a></li>
            <li><a href="#">Consultoría TI</a></li>
          </ul>
        </div>

        {/* Columna 4: Contacto y Redes */}
        <div className="footer-col contact-col">
          <h3>Conectemos</h3>
          <div className="contact-item">
            <HiOutlineMail className="contact-icon" />
            <span>webbonding21@gmail.com</span>
          </div>
          <div className="contact-item">
            <HiOutlineLocationMarker className="contact-icon" />
            <span>Venezuela, Acarigua-Araure</span>
          </div>
          
          <div className="social-icons">
            <a href="https://wa.me/584121510662" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <SiWhatsapp />
            </a>
            <a href="https://www.instagram.com/web.bonding" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <SiInstagram />
            </a>
          </div>
        </div>

      </div>

      {/* Barra Inferior */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} Web Bonding. Todos los derechos reservados.</p>
        <p className="made-with">Diseñado para el futuro 🚀</p>
      </div>
    </footer>
  );
};

export default Footer;