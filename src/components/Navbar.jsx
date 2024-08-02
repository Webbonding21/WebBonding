// src/components/Navbar.jsx
import React from 'react';
import { useEffect } from 'react';
import '../assets/Navbar.css'; 

const Navbar = () => {
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scroll hacia abajo
        navbar.classList.add('hidden');
      } else {
        // Scroll hacia arriba
        navbar.classList.remove('hidden');
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="container">
      <div className="navbar">
        <div className="navbar-brand">
          <a href="/">
            <img src="/logoenblanco.png" alt="Logo" />
          </a>
        </div>
        <ul className="navbar-links">
          <li><a href="#home">Inicio</a></li>
          <li><a href="#about">Nosotros</a></li>
          <li><a href="#services">Planes</a></li>
          <li><a href="#contact">Contacto</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
