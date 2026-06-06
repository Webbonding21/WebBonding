// =============================================================
// CATÁLOGO DE PRODUCTOS Y SERVICIOS — Web Bonding
// Fuente: hoja "Sistema de Costos Web Bonding" — CATALOGO + CONFIG
// Edita aquí para sincronizar precios cuando cambie la tarifa o
// agregues nuevos productos.
// =============================================================

/** Tarifa por hora calculada en CONFIG (USD).
 *  = (costos fijos / horas facturables + sueldo/horas + margen 30%). */
export const HOURLY_RATE_USD = 25.26;

/** Categorías ordenadas para los filtros del catálogo. */
export const CATEGORIES = [
  { key: 'ALL',    label: 'Todo',           color: '#0E0E11' },
  { key: 'CORE',   label: 'Web · Pilares',  color: '#2E37FF' },
  { key: 'MOBILE', label: 'Apps móviles',   color: '#7B2FBE' },
  { key: 'DATA',   label: 'Datos & BI',     color: '#0E3A2F' },
  { key: 'ERP',    label: 'ERP & Gestión',  color: '#1C1020' },
  { key: 'GOV',    label: 'Gobierno',       color: '#1A1A2E' },
  { key: 'SEC',    label: 'Seguridad',      color: '#3D1B1B' },
  { key: 'INFRA',  label: 'Infraestructura', color: '#1F1F25' },
  { key: 'CLOUD',  label: 'Cloud & DevOps', color: '#0F2A3A' },
];

/** Indicador de inversión → para mostrar al cliente sin asustar con cifras exactas. */
const TIER = {
  XS: { label: 'Muy baja',  bar: 1 },
  S:  { label: 'Baja',      bar: 2 },
  M:  { label: 'Media',     bar: 3 },
  L:  { label: 'Alta',      bar: 4 },
  XL: { label: 'Muy alta',  bar: 5 },
};

/**
 * Productos. Cada item:
 *  - id: slug
 *  - cat: categoría
 *  - name: nombre comercial (lo que ve el cliente)
 *  - hours: horas estimadas de desarrollo (del sheet)
 *  - purpose: valor de negocio en una línea
 *  - benefits: 3 bullets
 *  - stack: tecnologías (mostradas al cliente)
 *  - tier: tamaño de inversión (XS..XL)
 *  - factura: descripción técnica formal (para facturación)
 *  - extras: costos extras planos (USD), p.ej. licencias, dominios
 */
export const PRODUCTS = [
  // ——— CORE / WEB ———
  {
    id: 'landing',
    cat: 'CORE',
    name: 'Landing Page Premium',
    icon: '🚀',
    hours: 10,
    purpose: 'Captación de clientes y conversión. Presencia digital optimizada para generar leads rápido.',
    benefits: ['Alta velocidad de carga', 'Optimización SEO', 'Diseño 100% responsive'],
    stack: ['React', 'Vite'],
    tier: TIER.S,
    factura: 'Desarrollo de interfaz web SPA optimizada para SEO y carga rápida.',
    extras: 0,
  },
  {
    id: 'ecommerce',
    cat: 'CORE',
    name: 'Plataforma E-Commerce',
    icon: '🛒',
    hours: 40,
    purpose: 'Ventas digitales 24/7 con inventario, pasarela de pagos y panel administrativo.',
    benefits: ['Pasarelas de pago integradas', 'Gestión de stock centralizada', 'UX optimizada para conversión'],
    stack: ['Next.js', 'MongoDB'],
    tier: TIER.M,
    factura: 'Plataforma de comercio electrónico con gestión de inventario y pasarela.',
    extras: 0,
  },

  // ——— MOBILE ———
  {
    id: 'app-hibrida',
    cat: 'MOBILE',
    name: 'Aplicación Móvil Híbrida',
    icon: '📱',
    hours: 82.7,
    purpose: 'Una sola app que funciona en iOS y Android, publicada en App Store y Google Play.',
    benefits: ['Multiplataforma iOS + Android', 'Notificaciones push', 'Acceso a cámara, GPS y sensores'],
    stack: ['Capacitor', 'Ionic', 'React'],
    tier: TIER.L,
    factura: 'Desarrollo de aplicación móvil multiplataforma (iOS/Android).',
    // Apple Developer + Google Play developer (licencias anuales/únicas)
    extras: 200,
  },

  // ——— DATA / BI ———
  {
    id: 'dashboard-bi',
    cat: 'DATA',
    name: 'Dashboard de Business Intelligence',
    icon: '📊',
    hours: 30,
    purpose: 'Toma decisiones con datos en vivo: paneles interactivos que vuelven la operación visible.',
    benefits: ['Métricas en tiempo real', 'Visualizaciones personalizadas', 'Detección de tendencias'],
    stack: ['React', 'D3.js'],
    tier: TIER.M,
    factura: 'Implementación de tablero de control de datos en tiempo real.',
    extras: 0,
  },

  // ——— CLOUD / DEVOPS ———
  {
    id: 'config-server',
    cat: 'CLOUD',
    name: 'Configuración Cloud & DevOps',
    icon: '☁️',
    hours: 5,
    purpose: 'Entorno de producción seguro con despliegue automático cada vez que actualizamos código.',
    benefits: ['Alta disponibilidad', 'Despliegue continuo (CI/CD)', 'Entorno escalable con Docker'],
    stack: ['Render', 'Docker'],
    tier: TIER.XS,
    factura: 'Configuración de entorno de producción y despliegue continuo.',
    extras: 0,
  },

  // ——— ERP / GESTIÓN ———
  {
    id: 'modulo-gestion',
    cat: 'ERP',
    name: 'Módulo ERP a medida',
    icon: '🗂️',
    hours: 40,
    purpose: 'Automatiza flujos internos: inventario, facturación, RRHH, ventas — todo en un sistema.',
    benefits: ['Procesos automatizados', 'Reducción de errores', 'Base de datos unificada'],
    stack: ['Node.js', 'Supabase'],
    tier: TIER.M,
    factura: 'Desarrollo de lógica de negocio para gestión administrativa.',
    extras: 0,
  },

  // ——— GOV ———
  {
    id: 'portal-tributario',
    cat: 'GOV',
    name: 'Portal Tributario (Ciudadano)',
    icon: '🏛️',
    hours: 120,
    purpose: 'Interfaz segura para que los contribuyentes declaren, consulten deudas y paguen en línea.',
    benefits: ['Seguridad SSL grado A', 'Proceso de pago simplificado', 'Acceso 24/7'],
    stack: ['React/Vite', 'SSL'],
    tier: TIER.L,
    factura: 'Interfaz web segura para registro de contribuyentes, consulta de deuda y declaración de impuestos.',
    extras: 0,
  },
  {
    id: 'panel-hacienda',
    cat: 'GOV',
    name: 'Panel de Hacienda (Admin)',
    icon: '🛡️',
    hours: 140,
    purpose: 'Dashboard para funcionarios: validar pagos, auditar, emitir solvencias digitales.',
    benefits: ['Reportes en tiempo real', 'Validación de transacciones', 'Solvencias digitales'],
    stack: ['Next.js', 'SSR'],
    tier: TIER.XL,
    factura: 'Dashboard para funcionarios. Validación de pagos, auditoría de transacciones, emisión de solvencias digitales y reportes de recaudación en tiempo real.',
    extras: 0,
  },
  {
    id: 'motor-fiscal',
    cat: 'GOV',
    name: 'Motor de Cálculo Fiscal',
    icon: '🧮',
    hours: 120,
    purpose: 'API que automatiza el cálculo de impuestos según ordenanza, U.T. o anclaje BCV.',
    benefits: ['Cero errores de cálculo', 'Integración vía API REST', 'Adaptable a cambios normativos'],
    stack: ['Node.js', 'Python'],
    tier: TIER.L,
    factura: 'API Backend que calcula impuestos automáticamente basándose en la Ordenanza Municipal, U.T. o anclaje BCV/Petro.',
    extras: 0,
  },
  {
    id: 'pasarela-banca',
    cat: 'GOV',
    name: 'Pasarela de Pagos (Banca)',
    icon: '💳',
    hours: 100,
    purpose: 'Integración con bancos nacionales y conciliación automática de pagos móviles.',
    benefits: ['Integración API con banca nacional', 'Webhooks de notificación', 'Conciliación automática'],
    stack: ['Node.js', 'Webhooks'],
    tier: TIER.L,
    factura: 'Integración con APIs bancarias nacionales (BNC/Banca Amiga) o conciliación automática de Capture de Pago Móvil.',
    extras: 0,
  },

  // ——— SEC ———
  {
    id: 'auditoria-logs',
    cat: 'SEC',
    name: 'Auditoría & Logs',
    icon: '🔐',
    hours: 40,
    purpose: 'Registro inmutable de todas las acciones del sistema, cumple con contraloría.',
    benefits: ['Trazabilidad completa', 'Logs inmutables', 'Facilita auditorías externas'],
    stack: ['Supabase Logs'],
    tier: TIER.M,
    factura: 'Sistema de registro inmutable de todas las acciones (quién entró, quién pagó, quién editó) para cumplir con leyes de contraloría.',
    extras: 0,
  },

  // ——— INFRA ———
  {
    id: 'servidor-datos',
    cat: 'INFRA',
    name: 'Servidor de Datos con encriptación',
    icon: '🗄️',
    hours: 25,
    purpose: 'Base de datos con encriptación, copias de seguridad horarias y alta redundancia.',
    benefits: ['Encriptación de datos sensibles', 'Backups automáticos cada hora', 'Alta redundancia'],
    stack: ['Supabase Pro'],
    tier: TIER.M,
    factura: 'Configuración de Base de Datos Relacional con copias de seguridad cada hora y encriptación de datos sensibles.',
    extras: 0,
  },
];

/** Categorías presentes en los productos (para filtrar). */
export const ACTIVE_CATEGORIES = CATEGORIES.filter(
  (c) => c.key === 'ALL' || PRODUCTS.some((p) => p.cat === c.key)
);

/** Calcula el precio de un item dado (horas + extras) × cantidad. */
export function priceOf(product, qty = 1) {
  const base = product.hours * HOURLY_RATE_USD;
  return (base + product.extras) * qty;
}

/** Formato USD con miles. */
export function fmtUSD(n) {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}
