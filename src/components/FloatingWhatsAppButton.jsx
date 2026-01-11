// src/components/FloatingWhatsAppButton.jsx
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import '../assets/FloatingWhatsAppButton.css';

const FloatingWhatsAppButton = () => {
  const handleClick = () => {
    const phoneNumber = '584121510662';
    // Mensaje un poco más directo y profesional
    const message = 'Hola Web Bonding! 👋 Estoy interesado en potenciar mi negocio con sus soluciones digitales. ¿Podrían asesorarme?';
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="floating-whatsapp-container" onClick={handleClick}>
      {/* Texto emergente */}
      <span className="tooltip-text">¡Chatea con nosotros!</span>
      
      {/* Botón Circular */}
      <div className="floating-whatsapp">
        <FaWhatsapp size={32} className="whatsapp-icon" />
      </div>
    </div>
  );
};

export default FloatingWhatsAppButton;