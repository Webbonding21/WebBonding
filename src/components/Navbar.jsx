import React, { useState, useEffect } from 'react';
import '../assets/Navbar.css'; 

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll abajo (y hemos bajado más de 100px) -> Ocultar
        setIsVisible(false);
      } else {
        // Scroll arriba -> Mostrar
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`navbar ${!isVisible ? 'hidden' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-brand">
          <a href="/">
            <img src="/logoenblanco.png" alt="Web Bonding Logo" />
            <span className="brand-text">Web Bonding</span>
          </a>
        </div>
        
        <ul className="navbar-links">
          <li><a href="#home">Inicio</a></li>
          <li><a href="#about">Nosotros</a></li>
          <li><a href="#services">Servicios</a></li>
          <li><a href="#contact">Contacto</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;