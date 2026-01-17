import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para navegación interna
import '../assets/Navbar.css'; 

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
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
          <Link to="/">
            <img src="/logoenblanco.png" alt="Web Bonding Logo" />
            <span className="brand-text">Web Bonding</span>
          </Link>
        </div>
        
        <ul className="navbar-links">
          {/* TUS LINKS ORIGINALES */}
          {/* Usamos /# para que funcionen aunque estés en otra página */}
          <li><a href="/#home">Inicio</a></li>
          <li><a href="/#about">Nosotros</a></li>
          <li><a href="/#services">Servicios</a></li>
          <li><a href="/#contact">Contacto</a></li>

          {/* NUEVOS LINKS AGREGADOS */}
          <li><Link to="/courses">Cursos</Link></li>
          
          {/* Botón Destacado */}
          <li>
            <Link to="/registerstudents" className="nav-cta-btn">
              Inscribirse
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;