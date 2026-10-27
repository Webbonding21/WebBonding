/* eslint-disable react/prop-types */
// Menú desplegable del panel de leads. Los <select> del navegador no dejan poner colores, y dentro de la lista se
// cortarían; este se abre en un portal, pegado a su botón (hacia arriba si abajo no cabe). Esc lo cierra sin cerrar
// la ficha que esté abierta detrás.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Menu({ boton, botonClase = '', etiqueta, alinear = 'izq', children }) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState(null);
  const refBoton = useRef(null);
  const refLista = useRef(null);
  const cerrar = () => { setAbierto(false); setPos(null); };

  useLayoutEffect(() => {
    if (!abierto || !refLista.current) return;
    const b = refBoton.current.getBoundingClientRect();
    const l = refLista.current.getBoundingClientRect();
    const cabeAbajo = b.bottom + 6 + l.height <= window.innerHeight - 8;
    const top = cabeAbajo ? b.bottom + 6 : Math.max(8, b.top - 6 - l.height);
    const left = Math.min(Math.max(8, alinear === 'der' ? b.right - l.width : b.left), window.innerWidth - l.width - 8);
    setPos({ top, left });
  }, [abierto, alinear]);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (!refBoton.current?.contains(e.target) && !refLista.current?.contains(e.target)) cerrar(); };
    const tecla = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      cerrar();
      refBoton.current?.focus();
    };
    const alMover = (e) => { if (!refLista.current?.contains(e.target)) cerrar(); };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', tecla, true);
    window.addEventListener('resize', cerrar);
    window.addEventListener('scroll', alMover, true);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', tecla, true);
      window.removeEventListener('resize', cerrar);
      window.removeEventListener('scroll', alMover, true);
    };
  }, [abierto]);

  return (
    <>
      <button ref={refBoton} type="button" className={botonClase} aria-haspopup="menu" aria-expanded={abierto} aria-label={etiqueta}
        onClick={(e) => { e.stopPropagation(); if (abierto) cerrar(); else setAbierto(true); }}>
        {boton}
      </button>
      {abierto && createPortal(
        <div ref={refLista} className="ld-menu" role="menu" aria-label={etiqueta}
          style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: 'hidden' }}
          onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          {children(cerrar)}
        </div>,
        document.body,
      )}
    </>
  );
}
