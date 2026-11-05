/* eslint-disable react/prop-types */
// La portada 9:16 de un video del portafolio, que abre el reproductor. Sin portada sale su título sobre tinta. La usan
// /portafolio y la vista previa de /admin/portafolio (estilos en assets/Portafolio.css); «imagen» deja mostrar una portada
// que todavía no se subió.
import { FiPlay } from 'react-icons/fi';
import { SiInstagram } from 'react-icons/si';

export default function PortadaVideo({ v, onVer, imagen = v.portada }) {
  return (
    <button type="button" className={`pf-portada${imagen ? '' : ' pf-portada--sin'}`} onClick={onVer} aria-label={`Ver el video: ${v.titulo}`}>
      {imagen
        ? <img src={imagen} alt="" width="540" height="960" loading="lazy" />
        : <span className="pf-portada__sin"><SiInstagram aria-hidden="true" /><b>{v.titulo}</b></span>}
      <span className="pf-portada__play"><FiPlay aria-hidden="true" /> {v.duracion || 'Ver'}</span>
    </button>
  );
}
