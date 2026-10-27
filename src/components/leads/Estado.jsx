/* eslint-disable react/prop-types */
// El estado de un lead: la pastilla de color de la lista (se toca y se elige) y el embudo de la ficha, donde se cambia
// con un toque o con las teclas 1 a 5.
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import Menu from './Menu';
import { CLAVES, ESTADOS } from './datos';

export function PastillaEstado({ estado, nombre, onCambiar }) {
  return (
    <Menu alinear="der" etiqueta={`Estado de ${nombre}: ${ESTADOS[estado]}`} botonClase={`ld-pill ld-c--${estado}`}
      boton={<><i aria-hidden="true" />{ESTADOS[estado]}<FiChevronDown aria-hidden="true" /></>}>
      {(cerrar) => (
        <>
          <p className="ld-menu__titulo">Cambiar estado</p>
          {CLAVES.map((e, k) => (
            <button key={e} type="button" role="menuitemradio" aria-checked={e === estado} className={`ld-menu__op ld-c--${e}`}
              onClick={() => { cerrar(); if (e !== estado) onCambiar(e); }}>
              <i aria-hidden="true" /> {ESTADOS[e]}
              {e === estado ? <FiCheck className="ld-menu__marca" aria-hidden="true" /> : <kbd className="ld-menu__tecla">{k + 1}</kbd>}
            </button>
          ))}
        </>
      )}
    </Menu>
  );
}

export function Embudo({ estado, onCambiar }) {
  return (
    <div className="ld-embudo" role="radiogroup" aria-label="Estado del lead">
      {CLAVES.map((e, k) => (
        <button key={e} type="button" role="radio" aria-checked={e === estado} className={`ld-embudo__paso ld-c--${e}`}
          title={`${ESTADOS[e]} · tecla ${k + 1}`} onClick={() => { if (e !== estado) onCambiar(e); }}>
          <i aria-hidden="true" /> {ESTADOS[e]}
        </button>
      ))}
    </div>
  );
}
