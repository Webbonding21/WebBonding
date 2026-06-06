import React from 'react';
import { Link } from 'react-router-dom';
import { SiWhatsapp, SiInstagram, SiFacebook } from 'react-icons/si';
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlinePhone } from 'react-icons/hi';
import { FaArrowUp } from 'react-icons/fa';
import '../assets/Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="wb-foot wb-grain">
      <div className="wb-container wb-foot__inner">
        {/* Cabecera del footer */}
        <div className="wb-foot__top">
          <div className="wb-foot__lead">
            <span className="wb-eyebrow wb-eyebrow--accent">// Web Bonding C.A.</span>
            <p>
              Convertimos ideas en <em>ecosistemas digitales</em>: software, apps,
              e-commerce y automatización IoT. Desde Acarigua–Araure para Venezuela
              y toda Latinoamérica.
            </p>
            <a href="#home" className="wb-foot__top-link">
              Volver al inicio <FaArrowUp />
            </a>
          </div>

          <nav className="wb-foot__cols">
            <div className="wb-foot__col">
              <h4>Estudio</h4>
              <a href="/#home">Inicio</a>
              <a href="/#about">Nosotros</a>
              <a href="/#services">Servicios</a>
              <a href="/#work">Proyectos</a>
              <Link to="/cotizador">Cotizador</Link>
              <a href="/#plans">Planes</a>
            </div>

            <div className="wb-foot__col">
              <h4>Soluciones</h4>
              <a href="/#services">Desarrollo Web &amp; Apps</a>
              <a href="/#services">Sistemas &amp; Backend</a>
              <a href="/#services">IoT &amp; Automatización</a>
              <a href="/#work">E-commerce</a>
              <a href="/#process">Consultoría &amp; soporte</a>
            </div>

            <div className="wb-foot__col wb-foot__col--contact">
              <h4>Conectemos</h4>
              <a href="mailto:webbonding21@gmail.com" className="wb-foot__contact">
                <HiOutlineMail /> webbonding21@gmail.com
              </a>
              <a href="https://wa.me/584121510662" target="_blank" rel="noopener noreferrer" className="wb-foot__contact">
                <HiOutlinePhone /> +58 412 151 0662
              </a>
              <span className="wb-foot__contact">
                <HiOutlineLocationMarker /> Acarigua–Araure, Portuguesa, VE
              </span>

              <div className="wb-foot__social">
                <a href="https://wa.me/584121510662" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><SiWhatsapp /></a>
                <a href="https://www.instagram.com/web.bonding" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><SiInstagram /></a>
                <a href="https://www.facebook.com/profile.php?id=61556815558104" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><SiFacebook /></a>
              </div>
            </div>
          </nav>
        </div>

        {/* Wordmark gigante */}
        <div className="wb-foot__wordmark" aria-hidden="true">
          WEB<span>BONDING</span>
        </div>

        {/* Barra inferior */}
        <div className="wb-foot__bottom">
          <p>© {year} Web Bonding. Todos los derechos reservados.</p>
          <p className="wb-foot__credit">Hecho con código y café en Venezuela 🇻🇪</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
