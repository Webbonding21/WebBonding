import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaArrowRight } from 'react-icons/fa';
import '../assets/Navbar.css';

const NAV = [
  { label: 'Inicio', href: '/#home' },
  { label: 'Estudio', href: '/#about' },
  { label: 'Servicios', href: '/#services' },
  { label: 'Proyectos', href: '/#work' },
  { label: 'Planes', href: '/#plans' },
  { label: 'Contacto', href: '/#contact' },
];

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Scroll: ocultar al bajar, sólido al separarse del top
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > lastScrollY && y > 160) {
        setIsVisible(false);
        setIsOpen(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      className={`wb-nav ${!isVisible ? 'wb-nav--hidden' : ''} ${scrolled ? 'wb-nav--solid' : ''} ${isOpen ? 'wb-nav--open' : ''}`}
    >
      <div className="wb-nav__inner">
        {/* Marca */}
        <Link to="/" className="wb-nav__brand" onClick={closeMenu}>
          <span className="wb-nav__logo">
            <img src="/logoenblanco.png" alt="Web Bonding" draggable="false" />
          </span>
          <span className="wb-nav__brandtext">
            Web&nbsp;Bonding
            <i>Software&nbsp;Studio</i>
          </span>
        </Link>

        {/* Enlaces */}
        <ul className="wb-nav__links">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} onClick={closeMenu}>{n.label}</a>
            </li>
          ))}
        </ul>

        {/* Acciones */}
        <div className="wb-nav__actions">
          <a href="/#contact" className="wb-nav__cta" onClick={closeMenu}>
            Iniciar proyecto <FaArrowRight />
          </a>
          <button
            className="wb-nav__toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
