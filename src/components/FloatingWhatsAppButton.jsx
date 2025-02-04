// src/components/FloatingWhatsAppButton.jsx
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import '../assets/FloatingWhatsAppButton.css';

const FloatingWhatsAppButton = () => {
    const handleClick = () => {
      const phoneNumber = '584121510662';
      const message = 'Hola Web Bonding, estoy interesado en uno de sus servicios, me encantaria saber mas para hacer crecer mi negocio en el mundo digital.';
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');
    };
  
    return (
      <div className="floating-whatsapp" onClick={handleClick}>
        <FaWhatsapp size={30} />
      </div>
    );
  };

export default FloatingWhatsAppButton;
