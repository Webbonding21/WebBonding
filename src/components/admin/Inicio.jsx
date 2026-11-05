/* eslint-disable react/prop-types */
// El resumen del panel /admin: los números del día (leads nuevos y los que van tarde, clientes, lo que hay en la web), los
// últimos leads y cada sección de la web con lo que tiene. Todo lleva a donde se cambia.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { CLAVES, ESTADOS, INICIALES, consultar, contar, hace, tipoCorto } from '../leads/datos';
import { SECCIONES } from './secciones';

const numero = (n) => (n ?? 0).toLocaleString('es-VE');
const ocultos = (n) => (n > 0 ? `${numero(n)} ${n === 1 ? 'oculto' : 'ocultos'}` : '');

export default function Inicio({ rol, resumen, aqui }) {
  const venta = rol === 'admin' || rol === 'ventas';
  const [cuenta, setCuenta] = useState(null);
  const [ultimos, setUltimos] = useState(null);
  const [ahora] = useState(() => Date.now());

  useEffect(() => {
    if (!venta) return undefined;
    let vivo = true;
    contar(INICIALES).then((c) => vivo && setCuenta(c)).catch(() => vivo && setCuenta({}));
    consultar(INICIALES, 0).then((r) => vivo && setUltimos(r.filas.slice(0, 6))).catch(() => vivo && setUltimos([]));
    return () => { vivo = false; };
  }, [venta]);

  const web = SECCIONES.filter((s) => s.grupo === 'web' && s.roles.includes(rol));
  const hoy = new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="ad-inicio">
      <div className="ad-cab">
        <div>
          <h1>Resumen</h1>
          <p>{hoy.charAt(0).toUpperCase() + hoy.slice(1)}. Lo que hay hoy en Web Bonding, y cada cosa lleva a donde se cambia.</p>
        </div>
      </div>

      {!venta && (
        <p className="ad-nota">Tu usuario es de solo lectura: tienes las <a href="/r4apertura">Cuentas R4</a>. Para más, pídele el rol a Williams.</p>
      )}

      {venta && (
        <div className="ad-kpis">
          <Link to={aqui('/admin/leads?estado=nuevo')} className={`ad-kpi${cuenta?.nuevo ? ' ad-kpi--coral' : ''}`}>
            <span>Leads nuevos</span>
            <b>{cuenta ? numero(cuenta.nuevo) : '…'}</b>
            <small>{cuenta?.urgentes ? <><FiAlertCircle aria-hidden="true" /> {numero(cuenta.urgentes)} sin contactar hace más de 1 h</> : 'Ninguno va tarde'}</small>
          </Link>
          <Link to={aqui('/admin/leads?estado=propuesta')} className="ad-kpi">
            <span>Con propuesta</span>
            <b>{cuenta ? numero(cuenta.propuesta) : '…'}</b>
            <small>{cuenta ? `${numero(cuenta.contactado)} contactados` : ''}</small>
          </Link>
          <Link to={aqui('/admin/leads?estado=cliente')} className="ad-kpi">
            <span>Clientes</span>
            <b>{cuenta ? numero(cuenta.cliente) : '…'}</b>
            <small>{cuenta ? `de ${numero(cuenta.todos)} leads` : ''}</small>
          </Link>
          {rol === 'admin' && (
            <Link to={aqui('/admin/portafolio')} className="ad-kpi">
              <span>Videos en el portafolio</span>
              <b>{resumen?.portafolio ? numero(resumen.portafolio.visibles) : '…'}</b>
              <small>{resumen?.portafolio ? ocultos(resumen.portafolio.total - resumen.portafolio.visibles) || 'Ninguno oculto' : ''}</small>
            </Link>
          )}
        </div>
      )}

      {venta && cuenta && (
        <div className="ad-embudo" aria-label="Leads por estado">
          {CLAVES.map((e) => (
            <Link key={e} to={aqui(`/admin/leads?estado=${e}`)} className={`ld-c--${e}`} style={{ flexGrow: Math.max(1, cuenta[e] ?? 0) }}
              title={`${ESTADOS[e]}: ${numero(cuenta[e])}`}>
              <i aria-hidden="true" /> {ESTADOS[e]} <b>{numero(cuenta[e])}</b>
            </Link>
          ))}
        </div>
      )}

      <div className="ad-inicio__grid">
        {venta && (
          <section className="ad-bloque">
            <div className="ad-bloque__cab">
              <h2>Últimos leads</h2>
              <Link to={aqui('/admin/leads')}>Ver todos <FiArrowRight aria-hidden="true" /></Link>
            </div>
            {ultimos === null ? <p className="ad-nota">Cargando…</p> : !ultimos.length ? <p className="ad-nota">Todavía no ha llegado ningún lead.</p> : (
              <ul className="ad-ultimos">
                {ultimos.map((l) => (
                  <li key={l.id}>
                    <Link to={aqui(`/admin/leads?q=${encodeURIComponent(l.telefono)}`)}>
                      <span><b>{l.nombre}</b><em>{tipoCorto(l.tipo)} · {hace(l.created_at, ahora)}</em></span>
                      <i className={`ld-pill ld-c--${l.estado}`}><i aria-hidden="true" />{ESTADOS[l.estado]}</i>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {rol === 'admin' && (
          <section className="ad-bloque">
            <div className="ad-bloque__cab">
              <h2>La web</h2>
              <a href="/" target="_blank" rel="noopener noreferrer">Abrir webbonding.net <FiArrowUpRight aria-hidden="true" /></a>
            </div>
            <ul className="ad-secciones">
              {web.map(({ id, nombre, icono: Icono, donde }) => {
                const r = resumen?.[id];
                return (
                  <li key={id}>
                    <Link to={aqui(`/admin/${id}`)}>
                      <Icono aria-hidden="true" />
                      <b>{nombre}</b>
                      <span>{r ? `${numero(r.visibles)} en la web${r.total > r.visibles ? ` · ${ocultos(r.total - r.visibles)}` : ''}` : '…'}</span>
                    </Link>
                    {donde && <a href={donde} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${nombre} en la web`}><FiArrowUpRight aria-hidden="true" /></a>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
