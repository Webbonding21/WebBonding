import React, { createContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaSignOutAlt } from 'react-icons/fa';
import { supabaseR4 } from './r4/r4Api';
import { ROLES_VENTAS, rolDe } from '../lib/equipo';
import AccesoEquipo from './AccesoEquipo';
import '../assets/CotizadorGate.css';

const PASSWORD = 'w2105';
const STORAGE_KEY = 'wb_cot_access';
const TOKEN = 'granted_v1';

/** Cómo entró la persona: 'cliente' (con la clave de invitación) o 'equipo' (con su usuario de ventas o admin). */
export const ModoCotizador = createContext({ modo: 'cliente' });

/** Verifica si el usuario tiene acceso al cotizador. */
export function hasAccess() {
  try {
    return localStorage.getItem(STORAGE_KEY) === TOKEN;
  } catch (e) {
    return false;
  }
}

/** Cierra la sesión del cotizador (limpia clave + carrito). */
export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('wb_cart_v1');
  } catch (e) { /* ignore */ }
}

/**
 * Envuelve el cotizador. Los clientes entran con la clave de invitación; el equipo de ventas, con su usuario
 * (el mismo de /leads) y además ve la guía de ventas. Sin acceso, muestra el gate.
 */
export default function CotizadorGate({ children }) {
  const [granted, setGranted] = useState(() => hasAccess());
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [equipo, setEquipo] = useState(null); // { email, rol } si entró alguien de ventas o un admin
  const [sinRol, setSinRol] = useState(false); // entró con un usuario que no es de ventas (p. ej. el de solo lectura de R4)
  const [accesoEquipo, setAccesoEquipo] = useState(false);
  const inputRef = useRef(null);

  // La sesión del equipo se revisa aparte, sin frenar la clave de los clientes. Dentro de onAuthStateChange no se
  // llama a Supabase directamente (puede trancarse): se deja para el siguiente ciclo.
  useEffect(() => {
    let vivo = true;
    const revisar = async (sesion) => {
      const rol = await rolDe(sesion).catch(() => null);
      if (!vivo) return;
      setEquipo(sesion && ROLES_VENTAS.includes(rol) ? { email: sesion.user.email, rol } : null);
      setSinRol(Boolean(sesion) && !ROLES_VENTAS.includes(rol));
    };
    supabaseR4.auth.getSession().then(({ data }) => revisar(data.session)).catch(() => {});
    const { data: sub } = supabaseR4.auth.onAuthStateChange((_e, s) => { setTimeout(() => revisar(s), 0); });
    return () => { vivo = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!granted && !accesoEquipo) inputRef.current?.focus();
  }, [granted, accesoEquipo]);

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    // Pequeña pausa para que se sienta seguro
    setTimeout(() => {
      if (pwd.trim() === PASSWORD) {
        try { localStorage.setItem(STORAGE_KEY, TOKEN); } catch (_) {}
        setGranted(true);
        setPwd('');
      } else {
        setErr('Clave incorrecta. Solicítala a tu contacto de Web Bonding.');
      }
      setLoading(false);
    }, 350);
  };

  const handleLogout = () => {
    logout();
    setGranted(false);
  };

  if (equipo) {
    return <ModoCotizador.Provider value={{ modo: 'equipo', ...equipo }}>{children}</ModoCotizador.Provider>;
  }

  if (granted) {
    return (
      <>
        {children}
        <button className="cot-gate__logout" onClick={handleLogout} title="Cerrar sesión del cotizador">
          <FaSignOutAlt /> Salir
        </button>
      </>
    );
  }

  if (accesoEquipo) {
    return (
      <div className="ld">
        <AccesoEquipo titulo="Cotizador del equipo"
          texto="Entra con tu usuario de Web Bonding, el mismo de /leads. Aquí están el cotizador y la guía de ventas."
          aviso={sinRol ? 'Tu usuario no tiene el rol de ventas. Pídeselo a Williams o entra con otro usuario.' : ''}
          volver={{ texto: 'Volver al acceso de clientes', onClick: () => setAccesoEquipo(false) }} />
      </div>
    );
  }

  return (
    <section className="cot-gate wb-grain">
      <div className="cot-gate__glow" aria-hidden="true" />
      <div className="cot-gate__inner">
        <Link to="/" className="cot-gate__back">
          <FaArrowLeft /> Volver al sitio
        </Link>

        <div className="cot-gate__icon" aria-hidden="true">
          <FaLock />
        </div>

        <span className="wb-eyebrow wb-eyebrow--accent cot-gate__eyebrow">
          // Área privada
        </span>

        <h1 className="cot-gate__title">
          Cotizador <em>privado</em>
        </h1>
        <p className="cot-gate__sub">
          Este espacio es para clientes con invitación. Ingresa la clave que recibiste
          de tu contacto de Web Bonding para continuar.
        </p>

        <form onSubmit={submit} className="cot-gate__form" autoComplete="off">
          <label className="cot-gate__field">
            <span>Clave de acceso</span>
            <input
              ref={inputRef}
              type="password"
              placeholder="••••••"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="off"
              spellCheck="false"
              aria-invalid={!!err}
            />
          </label>
          {err && <p className="cot-gate__err">{err}</p>}
          <button type="submit" className="cot-gate__submit" disabled={loading || !pwd.trim()}>
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>

        <p className="cot-gate__note">
          ¿No tienes la clave?{' '}
          <a
            href="https://wa.me/584220579731?text=Hola%20Web%20Bonding%2C%20necesito%20acceso%20al%20cotizador%20privado."
            target="_blank"
            rel="noopener noreferrer"
          >
            Solicítala por WhatsApp →
          </a>
        </p>
        <p className="cot-gate__note cot-gate__equipo">
          <button type="button" onClick={() => setAccesoEquipo(true)}>¿Eres del equipo de Web Bonding? Entra con tu correo</button>
        </p>
      </div>
    </section>
  );
}
