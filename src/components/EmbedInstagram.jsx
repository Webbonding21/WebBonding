/* eslint-disable react/prop-types */
// Una publicación de Instagram embebida, en español (/p/<código>/embed/ sirve para reels y publicaciones). Se reproduce
// desde Instagram. Instagram avisa el alto de su tarjeta (MEASURE) al cargar y cada vez que cambia el ancho, y el marco
// toma ese alto; mientras no avisa, vale el del CSS. La usan el reproductor de /portafolio y el gestor de /admin/portafolio.
import { useEffect, useRef, useState } from 'react';

export const IG = 'https://www.instagram.com';

export default function EmbedInstagram({ codigo, titulo, className }) {
  const marco = useRef(null);
  const [alto, setAlto] = useState(null);
  useEffect(() => {
    const medir = (e) => {
      if (e.origin !== IG || e.source !== marco.current?.contentWindow) return;
      try {
        const aviso = JSON.parse(e.data);
        if (aviso.type === 'MEASURE' && aviso.details?.height) setAlto(aviso.details.height);
      } catch {
        // los demás avisos de Instagram no son JSON
      }
    };
    window.addEventListener('message', medir);
    return () => window.removeEventListener('message', medir);
  }, []);
  return (
    <div className={className} style={alto ? { height: alto } : undefined}>
      <iframe key={codigo} ref={marco} src={`${IG}/p/${codigo}/embed/?hl=es`} title={`Video de Instagram: ${titulo}`}
        allow="autoplay; encrypted-media; picture-in-picture; clipboard-write" allowFullScreen scrolling="no" />
    </div>
  );
}
