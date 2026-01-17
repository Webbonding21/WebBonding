import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Importamos iconos para el menú
import '../assets/Navbar.css'; 

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Estado para el menú móvil

  // Lógica de scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false); // Cerramos el menú si el usuario hace scroll hacia abajo
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Función para cerrar el menú al hacer clic en un link
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`navbar ${!isVisible ? 'hidden' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="navbar-content">
        
        {/* LOGO */}
        <div className="navbar-brand">
          <Link to="/" onClick={closeMenu}>
            <img src="/logoenblanco.png" alt="Web Bonding Logo" />
            <span className="brand-text">Web Bonding</span>
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA (Solo visible en móvil) */}
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* ENLACES */}
        <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <li><a href="/#home" onClick={closeMenu}>Inicio</a></li>
          <li><a href="/#about" onClick={closeMenu}>Nosotros</a></li>
          <li><a href="/#services" onClick={closeMenu}>Servicios</a></li>
          <li><a href="/#contact" onClick={closeMenu}>Contacto</a></li>
          <li><Link to="/courses" onClick={closeMenu}>Cursos</Link></li>
          <li className="cta-li">
            <Link to="/registerstudents" className="nav-cta-btn" onClick={closeMenu}>
              Inscribirse
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;