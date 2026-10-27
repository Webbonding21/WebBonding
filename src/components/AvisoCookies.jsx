// src/components/AvisoCookies.jsx
// Aviso de cookies: sale hasta que la persona elige, y vuelve si cambia la política o si lo pide desde /privacidad.
// «Solo las necesarias» pesa lo mismo que «Aceptar»: rechazar tiene que ser igual de fácil.
import React, { useEffect, useState } from 'react';
import { eleccionCookies, guardarEleccionCookies } from '../lib/privacidad';
import '../assets/AvisoCookies.css';

function AvisoCookies() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setAbierto(!eleccionCookies());
    const abrir = () => setAbierto(true);
    window.addEventListener('wb:cookies-abrir', abrir);
    return () => window.removeEventListener('wb:cookies-abrir', abrir);
  }, []);

  if (!abierto) return null;

  const elegir = (eleccion) => {
    guardarEleccionCookies(eleccion);
    setAbierto(false);
  };

  return (
    <section className="wb-cookies" aria-label="Aviso de cookies">
      <p className="wb-cookies__t">
        Este sitio guarda en tu navegador solo lo necesario para funcionar. Si aceptas, también usaremos cookies para
        medir las visitas y nuestros anuncios. <a href="/privacidad">Política de privacidad</a>
      </p>
      <div className="wb-cookies__botones">
        <button type="button" className="wb-cookies__btn" onClick={() => elegir('rechazadas')}>Solo las necesarias</button>
        <button type="button" className="wb-cookies__btn wb-cookies__btn--si" onClick={() => elegir('aceptadas')}>Aceptar</button>
      </div>
    </section>
  );
}

export default AvisoCookies;
