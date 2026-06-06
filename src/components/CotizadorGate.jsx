import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaSignOutAlt } from 'react-icons/fa';
import '../assets/CotizadorGate.css';

const PASSWORD = 'w2105';
const STORAGE_KEY = 'wb_cot_access';
const TOKEN = 'granted_v1';

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
 * Envuelve el cotizador. Si no hay clave válida, muestra el gate.
 * Si está autenticado, renderiza children + un botón de "Salir" flotante.
 */
export default function CotizadorGate({ children }) {
  const [granted, setGranted] = useState(() => hasAccess());
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!granted) inputRef.current?.focus();
  }, [granted]);

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
            href="https://wa.me/584121510662?text=Hola%20Web%20Bonding%2C%20necesito%20acceso%20al%20cotizador%20privado."
            target="_blank"
            rel="noopener noreferrer"
          >
            Solicítala por WhatsApp →
          </a>
        </p>
      </div>
    </section>
  );
}
