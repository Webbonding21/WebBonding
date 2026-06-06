import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { SiWhatsapp } from 'react-icons/si';
import { FaArrowLeft, FaSearch, FaTimes, FaPlus, FaMinus, FaTrash, FaArrowRight } from 'react-icons/fa';
import Reveal from '../components/Reveal';
import {
  PRODUCTS,
  ACTIVE_CATEGORIES,
  HOURLY_RATE_USD,
  priceOf,
  fmtUSD,
} from '../data/catalog';
import '../assets/Cotizador.css';

const PHONE = '584121510662';
const STORAGE_KEY = 'wb_cart_v1';

function buildWhatsAppMessage(cart, customRequest, contact) {
  const lines = [];
  lines.push('🚀 *Nueva cotización — Web Bonding*');
  lines.push('');

  // Contacto
  if (contact.name || contact.email || contact.country) {
    lines.push('👤 *Cliente:*');
    if (contact.name)    lines.push(`• Nombre: ${contact.name}`);
    if (contact.email)   lines.push(`• Correo: ${contact.email}`);
    if (contact.country) lines.push(`• País / ciudad: ${contact.country}`);
    if (contact.business) lines.push(`• Negocio: ${contact.business}`);
    lines.push('');
  }

  // Items del carrito
  if (cart.length > 0) {
    lines.push('🧩 *Productos seleccionados:*');
    let totalHours = 0;
    let total = 0;
    cart.forEach((it) => {
      const subt = priceOf(it.product, it.qty);
      totalHours += it.product.hours * it.qty;
      total += subt;
      const qtyTxt = it.qty > 1 ? ` × ${it.qty}` : '';
      lines.push(`• ${it.product.name}${qtyTxt} — *${fmtUSD(subt)}*`);
    });
    lines.push('');
    lines.push(`⏱️ *Horas totales estimadas:* ${totalHours.toFixed(0)} h`);
    lines.push(`💰 *Total estimado:* ${fmtUSD(total)}`);
    lines.push('');
  }

  // Custom request
  if (customRequest.what || customRequest.details) {
    lines.push('✨ *Necesidad a medida:*');
    if (customRequest.what)     lines.push(`• Tipo: ${customRequest.what}`);
    if (customRequest.details)  lines.push(`• Detalles: ${customRequest.details}`);
    if (customRequest.deadline) lines.push(`• Plazo: ${customRequest.deadline}`);
    if (customRequest.budget)   lines.push(`• Presupuesto: ${customRequest.budget}`);
    lines.push('');
  }

  lines.push('Quiero recibir una propuesta formal. ¡Gracias!');
  return lines.join('\n');
}

function Cotizador() {
  // —— Estado ——
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('ALL');
  const [contact, setContact] = useState({ name: '', email: '', country: '', business: '' });
  const [custom, setCustom] = useState({ what: '', details: '', deadline: '', budget: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hidratar carrito de localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids = JSON.parse(raw);
        const items = ids
          .map((row) => {
            const p = PRODUCTS.find((p) => p.id === row.id);
            return p ? { product: p, qty: row.qty || 1 } : null;
          })
          .filter(Boolean);
        setCart(items);
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Guardar carrito a localStorage
  useEffect(() => {
    const slim = cart.map((it) => ({ id: it.product.id, qty: it.qty }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  }, [cart]);

  // —— Acciones del carrito ——
  const addToCart = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { product, qty: 1 }];
    });
    // En móvil, abrir el drawer
    if (window.innerWidth < 960) setDrawerOpen(true);
  };

  const setQty = (id, qty) => {
    setCart((prev) =>
      prev
        .map((it) => (it.product.id === id ? { ...it, qty: Math.max(0, qty) } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((it) => it.product.id !== id));
  const clearCart = () => setCart([]);

  // —— Derivados ——
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (activeCat !== 'ALL' && p.cat !== activeCat) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.purpose} ${p.stack.join(' ')} ${p.cat}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCat]);

  const totals = useMemo(() => {
    let hours = 0;
    let usd = 0;
    cart.forEach((it) => {
      hours += it.product.hours * it.qty;
      usd += priceOf(it.product, it.qty);
    });
    return { hours, usd, count: cart.reduce((a, b) => a + b.qty, 0) };
  }, [cart]);

  // —— Envío a WhatsApp ——
  const sendToWhatsApp = () => {
    const msg = buildWhatsAppMessage(cart, custom, contact);
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const isValid = cart.length > 0 || (custom.what && custom.details);

  return (
    <>
      <Helmet>
        <title>Cotizador privado · Web Bonding</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta
          name="description"
          content="Cotizador privado de Web Bonding — acceso solo con invitación."
        />
      </Helmet>

      <section className="cot wb-grain">
        <div className="cot__glow" aria-hidden="true" />

        <div className="wb-container">
          {/* —— Header —— */}
          <Reveal as="div" className="cot__head">
            <Link to="/" className="cot__back">
              <FaArrowLeft /> Volver al inicio
            </Link>
            <span className="wb-eyebrow wb-eyebrow--accent cot__eyebrow">
              // Catálogo &amp; cotizador
            </span>
            <h1 className="cot__title">
              Arma <em>tu</em> proyecto.<br />
              Ve cuánto cuesta <em>ahora</em>.
            </h1>
            <p className="cot__sub">
              Selecciona del catálogo lo que necesitas y te damos un estimado en vivo.
              ¿Buscas algo que no está en la lista? Pídelo abajo: <strong>construimos lo que sea</strong>.
            </p>
            <div className="cot__rate">
              <span>Tarifa por hora de desarrollo:</span>
              <strong>{fmtUSD(HOURLY_RATE_USD)} USD/h</strong>
            </div>
          </Reveal>

          {/* —— Layout 2 columnas: catálogo + carrito sticky —— */}
          <div className="cot__layout">
            {/* COLUMNA IZQUIERDA — Catálogo */}
            <div className="cot__main">
              {/* Buscador + filtros */}
              <div className="cot__filters">
                <div className="cot__search">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Buscar: e-commerce, dashboard, app móvil…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="cot__search-clear" aria-label="Limpiar">
                      <FaTimes />
                    </button>
                  )}
                </div>
                <div className="cot__cats">
                  {ACTIVE_CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      className={`cot__cat ${activeCat === c.key ? 'is-active' : ''}`}
                      onClick={() => setActiveCat(c.key)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de productos */}
              {filtered.length === 0 ? (
                <div className="cot__empty">
                  <p>No encontramos nada con esos criterios.</p>
                  <p className="cot__empty-hint">Pero podemos construirlo desde cero — pídelo más abajo. ↓</p>
                </div>
              ) : (
                <div className="cot__grid">
                  {filtered.map((p, i) => {
                    const inCart = cart.some((it) => it.product.id === p.id);
                    return (
                      <Reveal as="article" className="prod-card" key={p.id} delay={`d${(i % 3) + 1}`}>
                        <div className="prod-card__top">
                          <span className="prod-card__icon" aria-hidden="true">{p.icon}</span>
                          <span className="prod-card__cat">{p.cat}</span>
                        </div>
                        <h3 className="prod-card__name">{p.name}</h3>
                        <p className="prod-card__purpose">{p.purpose}</p>

                        <ul className="prod-card__benefits">
                          {p.benefits.map((b, j) => <li key={j}>{b}</li>)}
                        </ul>

                        <div className="prod-card__stack">
                          {p.stack.map((s) => (
                            <span className="prod-card__tag" key={s}>{s}</span>
                          ))}
                        </div>

                        <div className="prod-card__bot">
                          <div className="prod-card__meta">
                            <div className="prod-card__price">
                              <span>desde</span>
                              <strong>{fmtUSD(priceOf(p))}</strong>
                            </div>
                            <div className="prod-card__hours">{p.hours}h aprox.</div>
                          </div>
                          <button
                            className={`prod-card__add ${inCart ? 'is-in' : ''}`}
                            onClick={() => addToCart(p)}
                          >
                            {inCart ? <>✓ Añadido <FaPlus /></> : <>Añadir <FaPlus /></>}
                          </button>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              )}

              {/* ——— Custom request ——— */}
              <Reveal as="section" className="cot__custom" id="custom">
                <div className="cot__custom-head">
                  <span className="wb-eyebrow wb-eyebrow--accent">// Algo a medida</span>
                  <h2>¿No encontraste lo que necesitas?</h2>
                  <p>
                    Cuéntanos qué quieres construir y lo agregamos a tu cotización.
                    No hay límites: software, integraciones, IoT, automatización con IA, lo que sea.
                  </p>
                </div>

                <div className="cot__form-grid">
                  <label className="cot__field">
                    <span>¿Qué quieres construir?</span>
                    <input
                      type="text"
                      placeholder="Ej: App para gestionar mi clínica, integración con un POS, chatbot con IA…"
                      value={custom.what}
                      onChange={(e) => setCustom({ ...custom, what: e.target.value })}
                    />
                  </label>
                  <label className="cot__field cot__field--full">
                    <span>Cuéntanos más (funcionalidades clave, integraciones, usuarios)</span>
                    <textarea
                      rows={5}
                      placeholder="Ej: Necesito una app donde los clientes agenden citas, reciban recordatorios por WhatsApp y paguen anticipado. Yo veo todo desde un panel."
                      value={custom.details}
                      onChange={(e) => setCustom({ ...custom, details: e.target.value })}
                    />
                  </label>
                  <label className="cot__field">
                    <span>Plazo deseado</span>
                    <select
                      value={custom.deadline}
                      onChange={(e) => setCustom({ ...custom, deadline: e.target.value })}
                    >
                      <option value="">Selecciona…</option>
                      <option>Lo antes posible (urgente)</option>
                      <option>1 a 2 meses</option>
                      <option>3 a 4 meses</option>
                      <option>Flexible, sin prisa</option>
                    </select>
                  </label>
                  <label className="cot__field">
                    <span>Presupuesto estimado (USD)</span>
                    <select
                      value={custom.budget}
                      onChange={(e) => setCustom({ ...custom, budget: e.target.value })}
                    >
                      <option value="">Selecciona…</option>
                      <option>Menos de $1.000</option>
                      <option>$1.000 – $3.000</option>
                      <option>$3.000 – $8.000</option>
                      <option>$8.000 – $20.000</option>
                      <option>Más de $20.000</option>
                      <option>Prefiero que me orienten</option>
                    </select>
                  </label>
                </div>
              </Reveal>

              {/* ——— Datos de contacto ——— */}
              <Reveal as="section" className="cot__contact">
                <div className="cot__custom-head">
                  <span className="wb-eyebrow wb-eyebrow--accent">// Tus datos</span>
                  <h2>Para enviarte la propuesta</h2>
                </div>
                <div className="cot__form-grid">
                  <label className="cot__field">
                    <span>Nombre completo</span>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    />
                  </label>
                  <label className="cot__field">
                    <span>Correo</span>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    />
                  </label>
                  <label className="cot__field">
                    <span>País / Ciudad</span>
                    <input
                      type="text"
                      placeholder="Ej: Bogotá, Colombia"
                      value={contact.country}
                      onChange={(e) => setContact({ ...contact, country: e.target.value })}
                    />
                  </label>
                  <label className="cot__field">
                    <span>Negocio o industria</span>
                    <input
                      type="text"
                      placeholder="Ej: Tienda de productos naturales"
                      value={contact.business}
                      onChange={(e) => setContact({ ...contact, business: e.target.value })}
                    />
                  </label>
                </div>
              </Reveal>
            </div>

            {/* COLUMNA DERECHA — Carrito sticky (desktop) */}
            <aside className="cot__cart">
              <div className="cot__cart-inner">
                <header className="cot__cart-head">
                  <h3>Tu proyecto</h3>
                  {cart.length > 0 && (
                    <button className="cot__cart-clear" onClick={clearCart}>Vaciar</button>
                  )}
                </header>

                {cart.length === 0 ? (
                  <div className="cot__cart-empty">
                    <p>Aún no has añadido nada.</p>
                    <p className="cot__cart-hint">
                      Selecciona productos del catálogo o cuéntanos qué quieres construir más abajo.
                    </p>
                  </div>
                ) : (
                  <ul className="cot__cart-list">
                    {cart.map((it) => (
                      <li className="cot__cart-item" key={it.product.id}>
                        <div className="cot__cart-item-info">
                          <strong>{it.product.icon} {it.product.name}</strong>
                          <span>{fmtUSD(priceOf(it.product, it.qty))}</span>
                        </div>
                        <div className="cot__cart-item-qty">
                          <button onClick={() => setQty(it.product.id, it.qty - 1)} aria-label="Restar">
                            <FaMinus />
                          </button>
                          <span>{it.qty}</span>
                          <button onClick={() => setQty(it.product.id, it.qty + 1)} aria-label="Sumar">
                            <FaPlus />
                          </button>
                          <button
                            className="cot__cart-item-trash"
                            onClick={() => removeItem(it.product.id)}
                            aria-label="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <footer className="cot__cart-foot">
                  <div className="cot__cart-totals">
                    <div>
                      <span>Horas estimadas</span>
                      <strong>{totals.hours.toFixed(0)} h</strong>
                    </div>
                    <div className="cot__cart-total">
                      <span>Total estimado</span>
                      <strong>{fmtUSD(totals.usd)}</strong>
                    </div>
                  </div>

                  <button
                    className="cot__cart-send"
                    onClick={sendToWhatsApp}
                    disabled={!isValid}
                    title={!isValid ? 'Añade un producto o describe tu necesidad para continuar' : ''}
                  >
                    <SiWhatsapp /> Enviar cotización por WhatsApp
                  </button>

                  <p className="cot__cart-note">
                    Estimado preliminar. El monto final se ajusta tras un diagnóstico técnico —
                    sin compromiso.
                  </p>
                </footer>
              </div>
            </aside>
          </div>
        </div>

        {/* —— Drawer flotante en móvil —— */}
        {cart.length > 0 && (
          <button
            className="cot__fab"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ver carrito"
          >
            <SiWhatsapp />
            <span>{totals.count}</span>
            <strong>{fmtUSD(totals.usd)}</strong>
          </button>
        )}

        {drawerOpen && (
          <div className="cot__drawer" onClick={() => setDrawerOpen(false)}>
            <div className="cot__drawer-inner" onClick={(e) => e.stopPropagation()}>
              <button className="cot__drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Cerrar">
                <FaTimes />
              </button>
              <h3>Tu proyecto</h3>
              {cart.length === 0 ? (
                <p>Aún no has añadido nada.</p>
              ) : (
                <>
                  <ul className="cot__cart-list">
                    {cart.map((it) => (
                      <li className="cot__cart-item" key={it.product.id}>
                        <div className="cot__cart-item-info">
                          <strong>{it.product.icon} {it.product.name}</strong>
                          <span>{fmtUSD(priceOf(it.product, it.qty))}</span>
                        </div>
                        <div className="cot__cart-item-qty">
                          <button onClick={() => setQty(it.product.id, it.qty - 1)}><FaMinus /></button>
                          <span>{it.qty}</span>
                          <button onClick={() => setQty(it.product.id, it.qty + 1)}><FaPlus /></button>
                          <button className="cot__cart-item-trash" onClick={() => removeItem(it.product.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="cot__cart-totals">
                    <div>
                      <span>Horas estimadas</span>
                      <strong>{totals.hours.toFixed(0)} h</strong>
                    </div>
                    <div className="cot__cart-total">
                      <span>Total estimado</span>
                      <strong>{fmtUSD(totals.usd)}</strong>
                    </div>
                  </div>
                </>
              )}
              <button
                className="cot__cart-send"
                onClick={sendToWhatsApp}
                disabled={!isValid}
              >
                <SiWhatsapp /> Enviar por WhatsApp <FaArrowRight />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Cotizador;
