/* eslint-disable react/prop-types */
// La ficha de un lead, al lado de la lista (a pantalla completa en el teléfono). El estado se cambia con un toque o con
// las teclas 1 a 5; ↑ ↓ pasan al lead anterior o siguiente sin cerrar; las notas se guardan solas al dejar de escribir,
// y también al cambiar de lead o cerrar.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPhone, FiMail, FiCopy, FiChevronUp, FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
import Menu from './Menu';
import { Embudo } from './Estado';
import { CLAVES, PLANTILLAS, enlaceWhatsApp, fecha, hace, internacional, origenDe, tipoCorto } from './datos';

export default function Ficha({ lead, ahora, posicion, total, onAnterior, onSiguiente, onCerrar, onGuardar, onAvisar }) {
  const [notas, setNotas] = useState(lead.notas ?? '');
  const [guardado, setGuardado] = useState(''); // '' · 'guardando' · 'guardado'
  const pendiente = useRef(null); // notas escritas que todavía no se guardan

  const guardarNotas = () => {
    const p = pendiente.current;
    if (!p) return;
    pendiente.current = null;
    onGuardar(p.id, { notas: p.notas || null }, { silencioso: true });
  };

  // al cambiar de lead (o cerrar), lo que estaba escrito se guarda antes de irse
  useEffect(() => {
    setNotas(lead.notas ?? '');
    setGuardado('');
    return guardarNotas;
  }, [lead.id]); // eslint-disable-line react-hooks/exhaustive-deps -- solo al cambiar de lead

  useEffect(() => {
    const limpio = notas.trim();
    if (limpio === (lead.notas ?? '').trim()) { pendiente.current = null; return undefined; }
    pendiente.current = { id: lead.id, notas: limpio };
    setGuardado('guardando');
    const t = setTimeout(() => { guardarNotas(); setGuardado('guardado'); }, 900);
    return () => clearTimeout(t);
  }, [notas]); // eslint-disable-line react-hooks/exhaustive-deps -- solo cuando cambia lo escrito

  // escribirle o llamarle a un lead nuevo lo pasa a «Contactado»
  const contactar = () => { if (lead.estado === 'nuevo') onGuardar(lead.id, { estado: 'contactado' }); };

  const copiar = async (texto, que) => {
    try {
      await navigator.clipboard.writeText(texto);
      onAvisar(`${que} copiado`);
    } catch { onAvisar(`No se pudo copiar el ${que.toLowerCase()}`); }
  };

  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') { onCerrar(); return; }
      const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '');
      if (escribiendo || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === 'ArrowDown' || e.key === 'j') && onSiguiente) { e.preventDefault(); onSiguiente(); }
      else if ((e.key === 'ArrowUp' || e.key === 'k') && onAnterior) { e.preventDefault(); onAnterior(); }
      else if (/^[1-5]$/.test(e.key)) {
        const estado = CLAVES[Number(e.key) - 1];
        if (estado !== lead.estado) onGuardar(lead.id, { estado });
      } else if (e.key === 'w') {
        window.open(enlaceWhatsApp(lead), '_blank', 'noopener');
        if (lead.estado === 'nuevo') onGuardar(lead.id, { estado: 'contactado' });
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [lead, onCerrar, onAnterior, onSiguiente, onGuardar]);

  const campana = [lead.utm_medium, lead.utm_campaign, lead.utm_content].filter(Boolean).join(' · ');

  return createPortal(
    <div className="ld-ficha-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <aside className={`ld-ficha ld-c--${lead.estado}`} role="dialog" aria-modal="true" aria-label={`Lead: ${lead.nombre}`}>
        <div className="ld-ficha__barra">
          <div className="ld-ficha__nav">
            <button type="button" onClick={onAnterior} disabled={!onAnterior} aria-label="Lead anterior"><FiChevronUp aria-hidden="true" /></button>
            <button type="button" onClick={onSiguiente} disabled={!onSiguiente} aria-label="Lead siguiente"><FiChevronDown aria-hidden="true" /></button>
            <span>{posicion} de {total}</span>
          </div>
          <button type="button" className="ld-ficha__cerrar" onClick={onCerrar} aria-label="Cerrar"><FiX aria-hidden="true" /></button>
        </div>

        <h2 className="ld-ficha__nombre">{lead.nombre}</h2>
        <p className="ld-ficha__sub">
          <span className="ld-tipo">{tipoCorto(lead.tipo)}</span>
          <span title={fecha(lead.created_at)}>Llegó {hace(lead.created_at, ahora)}</span>
          <span>· {origenDe(lead)}</span>
        </p>

        <Embudo estado={lead.estado} onCambiar={(estado) => onGuardar(lead.id, { estado })} />

        <div className="ld-ficha__contacto">
          <div className="ld-partido">
            <a className="ld-btn ld-btn--wa" href={enlaceWhatsApp(lead)} target="_blank" rel="noopener noreferrer" onClick={contactar}>
              <SiWhatsapp aria-hidden="true" /> WhatsApp
            </a>
            <Menu etiqueta="Elegir el mensaje de WhatsApp" botonClase="ld-btn ld-btn--wa ld-partido__mas" boton={<FiChevronDown aria-hidden="true" />}>
              {(cerrar) => (
                <>
                  <p className="ld-menu__titulo">Escribirle con…</p>
                  {PLANTILLAS.map((p) => (
                    <button key={p.id} type="button" role="menuitem" className="ld-menu__op"
                      onClick={() => { cerrar(); window.open(enlaceWhatsApp(lead, p), '_blank', 'noopener'); contactar(); }}>
                      <FiMessageCircle aria-hidden="true" /> {p.t}
                    </button>
                  ))}
                </>
              )}
            </Menu>
          </div>
          <a className="ld-btn" href={`tel:+${internacional(lead.telefono)}`} onClick={contactar}><FiPhone aria-hidden="true" /> Llamar</a>
          <a className="ld-btn" href={`mailto:${lead.correo}`}><FiMail aria-hidden="true" /> Correo</a>
        </div>

        <dl className="ld-datos">
          <div>
            <dt>Teléfono</dt>
            <dd>{lead.telefono}<button type="button" className="ld-copiar" onClick={() => copiar(lead.telefono, 'Teléfono')} aria-label="Copiar el teléfono"><FiCopy aria-hidden="true" /></button></dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{lead.correo}<button type="button" className="ld-copiar" onClick={() => copiar(lead.correo, 'Correo')} aria-label="Copiar el correo"><FiCopy aria-hidden="true" /></button></dd>
          </div>
          <div><dt>Novedades</dt><dd>{lead.acepta_novedades ? 'Sí quiere recibir ofertas' : 'No'}</dd></div>
          <div><dt>Campaña</dt><dd>{campana || 'Sin campaña'}</dd></div>
        </dl>

        {lead.adicional && (
          <figure className="ld-adicional">
            <figcaption>Lo que escribió</figcaption>
            <blockquote>{lead.adicional}</blockquote>
          </figure>
        )}

        <label className="ld-notas">
          <span>Notas del equipo
            <em aria-live="polite">{guardado === 'guardando' ? 'Guardando…' : guardado === 'guardado' ? 'Guardado ✓' : ''}</em>
          </span>
          <textarea rows="5" value={notas} placeholder="Qué hablaron, qué le interesa, cuándo volver a escribirle…" onChange={(e) => setNotas(e.target.value)} />
        </label>

        <p className="ld-ficha__atajos">
          <kbd>↑</kbd> <kbd>↓</kbd> otro lead · <kbd>1</kbd>–<kbd>5</kbd> estado · <kbd>W</kbd> WhatsApp · <kbd>Esc</kbd> cerrar
        </p>
      </aside>
    </div>,
    document.body,
  );
}
