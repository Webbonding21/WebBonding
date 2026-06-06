// =============================================================
// CATÁLOGO DE PRODUCTOS Y SERVICIOS — Web Bonding
// Fuente base: hoja "Sistema de Costos Web Bonding" — CATALOGO + CONFIG
// Tarifa base del sheet: $25.26  +20% margen comercial → $30.31 USD/h
// =============================================================

/** Tarifa por hora final aplicada al cliente (USD).
 *  Cálculo: ($25.26 base × 1.20) = $30.31 USD/h */
export const HOURLY_RATE_USD = 30.31;

/** Categorías ordenadas para los filtros del catálogo. */
export const CATEGORIES = [
  { key: 'ALL',      label: 'Todo' },
  { key: 'WEB',      label: 'Web & Sitios' },
  { key: 'ECOM',     label: 'E-commerce' },
  { key: 'MOBILE',   label: 'Apps móviles' },
  { key: 'DATA',     label: 'Datos & BI' },
  { key: 'AI',       label: 'IA & Automatización' },
  { key: 'ERP',      label: 'ERP & Gestión' },
  { key: 'INT',      label: 'Integraciones' },
  { key: 'IOT',      label: 'IoT & Hardware' },
  { key: 'GOV',      label: 'Gobierno' },
  { key: 'SEC',      label: 'Seguridad' },
  { key: 'CLOUD',    label: 'Cloud & DevOps' },
  { key: 'INFRA',    label: 'Infraestructura' },
  { key: 'MKT',      label: 'Marketing & Growth' },
  { key: 'EDU',      label: 'Educación / LMS' },
  { key: 'HEALTH',   label: 'Salud' },
  { key: 'LOG',      label: 'Logística' },
  { key: 'SUPPORT',  label: 'Soporte & Mantenimiento' },
];

const TIER = {
  XS: { label: 'Muy baja',  bar: 1 },
  S:  { label: 'Baja',      bar: 2 },
  M:  { label: 'Media',     bar: 3 },
  L:  { label: 'Alta',      bar: 4 },
  XL: { label: 'Muy alta',  bar: 5 },
};

/** Catálogo completo de servicios.
 *  id · cat · name · icon · hours · purpose · benefits · stack · tier · factura · extras */
export const PRODUCTS = [
  // ╔══════════════════════════════════════════════════════════╗
  // ║  WEB & SITIOS                                            ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'landing', cat: 'WEB', name: 'Landing Page Premium', icon: '🚀', hours: 10, tier: TIER.S, extras: 0,
    purpose: 'Captación de clientes y conversión. Presencia digital optimizada para generar leads rápido.',
    benefits: ['Alta velocidad de carga', 'Optimización SEO técnica', 'Diseño 100% responsive'],
    stack: ['React', 'Vite'],
    factura: 'Desarrollo de interfaz web SPA optimizada para SEO y carga rápida.',
  },
  {
    id: 'sitio-corporativo', cat: 'WEB', name: 'Sitio Corporativo (multi-página)', icon: '🏢', hours: 30, tier: TIER.M, extras: 0,
    purpose: 'Presencia institucional completa: nosotros, servicios, blog, contacto, casos de éxito.',
    benefits: ['Hasta 10 páginas', 'CMS para autogestión', 'SEO técnico avanzado'],
    stack: ['Next.js', 'Sanity CMS'],
    factura: 'Desarrollo de sitio corporativo multi-página con CMS.',
  },
  {
    id: 'blog-magazine', cat: 'WEB', name: 'Blog / Magazine con CMS', icon: '📰', hours: 24, tier: TIER.M, extras: 0,
    purpose: 'Publica contenidos sin depender de un programador. SEO listo, comentarios y categorías.',
    benefits: ['Editor visual fácil', 'Categorías y etiquetas', 'RSS y compartir social'],
    stack: ['Next.js', 'Sanity / Strapi'],
    factura: 'Plataforma de publicación de contenidos con CMS y SEO.',
  },
  {
    id: 'portal-membresia', cat: 'WEB', name: 'Portal de membresía / SaaS Starter', icon: '🔑', hours: 60, tier: TIER.L, extras: 0,
    purpose: 'Plataforma con login, planes pagos y contenido restringido. Base para tu SaaS.',
    benefits: ['Auth con email/Google', 'Planes y cobros recurrentes', 'Panel del usuario'],
    stack: ['Next.js', 'Supabase', 'Stripe'],
    factura: 'Plataforma de membresía con autenticación, planes y suscripciones recurrentes.',
  },
  {
    id: 'reservas-online', cat: 'WEB', name: 'Sistema de reservas online', icon: '📅', hours: 45, tier: TIER.M, extras: 0,
    purpose: 'Tus clientes reservan tu servicio (hotel, restaurante, salón, cancha) sin llamarte.',
    benefits: ['Calendario en tiempo real', 'Pagos al reservar', 'Recordatorios automáticos'],
    stack: ['React', 'Node.js'],
    factura: 'Sistema de reservas con calendario, pagos y notificaciones automáticas.',
  },
  {
    id: 'citas-agendamiento', cat: 'WEB', name: 'Agendamiento de citas (Calendly-like)', icon: '🗓️', hours: 35, tier: TIER.M, extras: 0,
    purpose: 'Agenda tus citas profesionales con disponibilidad por especialista y zona horaria.',
    benefits: ['Disponibilidad por agente', 'Recordatorios WhatsApp/email', 'Integración Google Calendar'],
    stack: ['Next.js', 'Supabase'],
    factura: 'Plataforma de agendamiento de citas con sincronización de calendarios.',
  },
  {
    id: 'intranet', cat: 'WEB', name: 'Intranet / Portal de empleados', icon: '👥', hours: 80, tier: TIER.L, extras: 0,
    purpose: 'Espacio interno para tu equipo: documentos, anuncios, vacaciones, nómina.',
    benefits: ['Login centralizado', 'Roles y permisos', 'Comunicación interna'],
    stack: ['Next.js', 'Supabase'],
    factura: 'Intranet corporativa con gestión de documentos, anuncios y trámites internos.',
  },
  {
    id: 'directorio', cat: 'WEB', name: 'Directorio / Marketplace de servicios', icon: '📒', hours: 70, tier: TIER.L, extras: 0,
    purpose: 'Plataforma estilo TripAdvisor: anunciantes, reseñas, búsqueda por categoría y mapa.',
    benefits: ['Búsqueda geográfica', 'Reseñas verificadas', 'Anunciantes con perfil propio'],
    stack: ['Next.js', 'Mapbox', 'Supabase'],
    factura: 'Directorio digital con búsqueda geográfica y sistema de reseñas.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  E-COMMERCE                                              ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'ecommerce', cat: 'ECOM', name: 'Plataforma E-Commerce', icon: '🛒', hours: 40, tier: TIER.M, extras: 0,
    purpose: 'Ventas digitales 24/7 con inventario, pasarela de pagos y panel administrativo.',
    benefits: ['Pasarelas de pago integradas', 'Gestión de stock centralizada', 'UX optimizada para conversión'],
    stack: ['Next.js', 'MongoDB'],
    factura: 'Plataforma de comercio electrónico con gestión de inventario y pasarela.',
  },
  {
    id: 'marketplace', cat: 'ECOM', name: 'Marketplace multi-vendedor', icon: '🏬', hours: 120, tier: TIER.XL, extras: 0,
    purpose: 'Una plataforma donde muchos vendedores publican y tú cobras comisión.',
    benefits: ['Paneles separados por vendedor', 'Comisiones automáticas', 'Pagos divididos (split)'],
    stack: ['Next.js', 'Stripe Connect'],
    factura: 'Marketplace multi-vendedor con comisiones y división automática de pagos.',
  },
  {
    id: 'pos', cat: 'ECOM', name: 'Punto de venta (POS) web/tablet', icon: '🧾', hours: 50, tier: TIER.M, extras: 0,
    purpose: 'Cobra en tu local desde una tablet o PC. Funciona offline y sincroniza al volver.',
    benefits: ['Operación offline', 'Impresión de tickets', 'Reportes diarios'],
    stack: ['React + PWA', 'IndexedDB'],
    factura: 'Sistema punto de venta web con operación offline y sincronización.',
  },
  {
    id: 'fidelizacion', cat: 'ECOM', name: 'Programa de fidelización y puntos', icon: '⭐', hours: 28, tier: TIER.M, extras: 0,
    purpose: 'Premia a clientes recurrentes con puntos canjeables y niveles VIP.',
    benefits: ['Acumulación automática', 'Canjes y cupones', 'Niveles configurables'],
    stack: ['Node.js'],
    factura: 'Módulo de fidelización con sistema de puntos y niveles de cliente.',
  },
  {
    id: 'cupones', cat: 'ECOM', name: 'Sistema de cupones y descuentos', icon: '🏷️', hours: 14, tier: TIER.S, extras: 0,
    purpose: 'Crea cupones por porcentaje, monto, primera compra, segmentos.',
    benefits: ['Códigos automáticos', 'Reglas por carrito/usuario', 'Validez por fechas'],
    stack: ['Node.js'],
    factura: 'Módulo de cupones y reglas de descuento configurables.',
  },
  {
    id: 'carrito-abandonado', cat: 'ECOM', name: 'Recuperación de carritos abandonados', icon: '🛍️', hours: 18, tier: TIER.S, extras: 0,
    purpose: 'Email/WhatsApp automático al cliente que dejó cosas en el carrito sin pagar.',
    benefits: ['Trigger automático', 'Plantillas editables', 'Métricas de recuperación'],
    stack: ['Node.js', 'WhatsApp API'],
    factura: 'Automatización de recuperación de carritos abandonados.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  MOBILE                                                  ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'app-hibrida', cat: 'MOBILE', name: 'Aplicación móvil híbrida', icon: '📱', hours: 82.7, tier: TIER.L, extras: 200,
    purpose: 'Una sola app que funciona en iOS y Android, publicada en App Store y Google Play.',
    benefits: ['Multiplataforma iOS + Android', 'Notificaciones push', 'Acceso a cámara, GPS y sensores'],
    stack: ['Capacitor', 'Ionic', 'React'],
    factura: 'Desarrollo de aplicación móvil multiplataforma (iOS/Android).',
  },
  {
    id: 'pwa', cat: 'MOBILE', name: 'PWA (Progressive Web App)', icon: '⚡', hours: 22, tier: TIER.S, extras: 0,
    purpose: 'App que se instala desde el navegador, sin App Store. Ideal para empezar barato.',
    benefits: ['Instalable sin tienda', 'Funciona offline', 'Notificaciones push (Android)'],
    stack: ['React', 'Service Workers'],
    factura: 'Aplicación web progresiva instalable con soporte offline.',
  },
  {
    id: 'app-delivery', cat: 'MOBILE', name: 'App de delivery (cliente + repartidor)', icon: '🛵', hours: 160, tier: TIER.XL, extras: 200,
    purpose: 'Marketplace de comida o productos: app del cliente, app del repartidor y panel del comercio.',
    benefits: ['Tracking en vivo', 'Pagos integrados', 'Asignación automática de pedidos'],
    stack: ['React Native', 'Sockets', 'Maps'],
    factura: 'Ecosistema de delivery con apps de cliente y repartidor + panel de gestión.',
  },
  {
    id: 'app-transporte', cat: 'MOBILE', name: 'App de transporte (Uber-like)', icon: '🚗', hours: 180, tier: TIER.XL, extras: 200,
    purpose: 'Apps de pasajero y conductor con despacho en tiempo real, ruta y pago.',
    benefits: ['Geolocalización en vivo', 'Despacho automático', 'Cobros con tarjeta'],
    stack: ['React Native', 'Sockets', 'Mapbox'],
    factura: 'Plataforma de ride-hailing con apps de pasajero y conductor.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  DATA / BI                                               ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'dashboard-bi', cat: 'DATA', name: 'Dashboard de Business Intelligence', icon: '📊', hours: 30, tier: TIER.M, extras: 0,
    purpose: 'Toma decisiones con datos en vivo: paneles interactivos que vuelven la operación visible.',
    benefits: ['Métricas en tiempo real', 'Visualizaciones personalizadas', 'Detección de tendencias'],
    stack: ['React', 'D3.js'],
    factura: 'Implementación de tablero de control de datos en tiempo real.',
  },
  {
    id: 'reporteria', cat: 'DATA', name: 'Reportería ejecutiva (PDF / Excel)', icon: '📑', hours: 20, tier: TIER.S, extras: 0,
    purpose: 'Genera reportes profesionales en un clic: ventas, inventario, clientes, lo que necesites.',
    benefits: ['PDF y Excel', 'Programación de envíos', 'Filtros configurables'],
    stack: ['Node.js', 'jsPDF'],
    factura: 'Generación automatizada de reportes ejecutivos en PDF y Excel.',
  },
  {
    id: 'etl', cat: 'DATA', name: 'ETL & pipelines de datos', icon: '🔄', hours: 40, tier: TIER.M, extras: 0,
    purpose: 'Mueve datos entre sistemas, los limpia y los deja listos para analizar.',
    benefits: ['Sincronización programada', 'Transformaciones a medida', 'Logs de ejecución'],
    stack: ['Python', 'Airbyte / n8n'],
    factura: 'Pipelines ETL para integración y transformación de datos.',
  },
  {
    id: 'data-warehouse', cat: 'DATA', name: 'Data Warehouse setup', icon: '🗃️', hours: 55, tier: TIER.L, extras: 0,
    purpose: 'Centraliza datos de todas tus fuentes para analizarlos juntos.',
    benefits: ['Modelo dimensional', 'Conexión a BI', 'Histórico de datos'],
    stack: ['BigQuery / Postgres'],
    factura: 'Configuración de data warehouse con modelado dimensional.',
  },
  {
    id: 'ml-predictivo', cat: 'DATA', name: 'Análisis predictivo (ML)', icon: '🔮', hours: 60, tier: TIER.L, extras: 0,
    purpose: 'Modelos que predicen: churn, ventas, riesgo, demanda. Datos antes de que ocurran.',
    benefits: ['Modelo personalizado', 'API de predicción', 'Reentreno periódico'],
    stack: ['Python', 'scikit-learn'],
    factura: 'Desarrollo de modelo predictivo con API de inferencia.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  IA & AUTOMATIZACIÓN                                     ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'chatbot-wa', cat: 'AI', name: 'Chatbot WhatsApp con IA', icon: '💬', hours: 40, tier: TIER.M, extras: 0,
    purpose: 'Atiende clientes 24/7 por WhatsApp con un agente que entiende lenguaje natural.',
    benefits: ['Responde 24/7', 'Aprende de tu negocio', 'Pasa a humano cuando hace falta'],
    stack: ['OpenAI', 'WhatsApp Business API'],
    factura: 'Agente IA conversacional integrado a WhatsApp Business.',
  },
  {
    id: 'agente-soporte', cat: 'AI', name: 'Agente IA de atención al cliente', icon: '🤖', hours: 50, tier: TIER.M, extras: 0,
    purpose: 'Bot embebido en tu web que responde dudas con conocimiento de tu negocio (RAG).',
    benefits: ['Respuestas basadas en tus docs', 'Multilenguaje', 'Métricas de uso'],
    stack: ['OpenAI', 'Pinecone'],
    factura: 'Asistente conversacional con base de conocimiento (RAG).',
  },
  {
    id: 'agente-voz', cat: 'AI', name: 'Asistente IA por voz (call center)', icon: '🎙️', hours: 70, tier: TIER.L, extras: 0,
    purpose: 'Voz natural que contesta llamadas: agenda, califica, escala — sin teleoperadores.',
    benefits: ['Voz natural', 'Integración con telefonía', 'Resumen de cada llamada'],
    stack: ['OpenAI Realtime', 'Twilio'],
    factura: 'Sistema de voz IA con integración telefónica.',
  },
  {
    id: 'ia-imagenes', cat: 'AI', name: 'Análisis de imágenes con IA', icon: '👁️', hours: 35, tier: TIER.M, extras: 0,
    purpose: 'Detecta objetos, lee texto, clasifica calidad, reconoce rostros — visión por computadora.',
    benefits: ['Modelo entrenado a tus datos', 'API de inferencia', 'Tiempo real'],
    stack: ['OpenAI Vision', 'YOLO'],
    factura: 'Desarrollo de modelo de visión por computadora con API.',
  },
  {
    id: 'ia-contenido', cat: 'AI', name: 'Generador de contenido IA', icon: '✍️', hours: 25, tier: TIER.M, extras: 0,
    purpose: 'Crea descripciones de producto, posts, emails y artículos con tu tono de marca.',
    benefits: ['Tono y estilo a medida', 'Generación masiva', 'Revisión humana opcional'],
    stack: ['OpenAI', 'Claude API'],
    factura: 'Plataforma de generación de contenido con LLM.',
  },
  {
    id: 'ocr', cat: 'AI', name: 'OCR / extracción de documentos', icon: '📄', hours: 30, tier: TIER.M, extras: 0,
    purpose: 'Lee facturas, cédulas, contratos en PDF/imagen y extrae los datos a tu sistema.',
    benefits: ['Reconocimiento alta precisión', 'Validación humana', 'Integración a BD'],
    stack: ['Tesseract', 'OpenAI Vision'],
    factura: 'Extracción automatizada de datos desde documentos PDF/imagen.',
  },
  {
    id: 'rag-interno', cat: 'AI', name: 'Asistente IA interno (RAG con tus docs)', icon: '📚', hours: 50, tier: TIER.M, extras: 0,
    purpose: 'Sube tus manuales, contratos, políticas — y consulta a la IA como si fuera un colega experto.',
    benefits: ['Búsqueda semántica', 'Referencias a fuentes', 'Roles y permisos'],
    stack: ['OpenAI', 'Pinecone / pgvector'],
    factura: 'Asistente IA empresarial con búsqueda semántica de documentos.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  ERP / GESTIÓN                                           ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'modulo-gestion', cat: 'ERP', name: 'Módulo ERP a medida', icon: '🗂️', hours: 40, tier: TIER.M, extras: 0,
    purpose: 'Automatiza flujos internos: inventario, facturación, RRHH, ventas — todo en un sistema.',
    benefits: ['Procesos automatizados', 'Reducción de errores', 'Base de datos unificada'],
    stack: ['Node.js', 'Supabase'],
    factura: 'Desarrollo de lógica de negocio para gestión administrativa.',
  },
  {
    id: 'crm', cat: 'ERP', name: 'CRM a medida', icon: '🤝', hours: 50, tier: TIER.M, extras: 0,
    purpose: 'Pipeline de ventas, historial de clientes, recordatorios, automatizaciones.',
    benefits: ['Pipeline visual (Kanban)', 'Recordatorios y tareas', 'Reportes de equipo'],
    stack: ['Next.js', 'Supabase'],
    factura: 'CRM con pipeline de ventas y gestión de clientes.',
  },
  {
    id: 'facturacion', cat: 'ERP', name: 'Facturación electrónica', icon: '🧮', hours: 45, tier: TIER.M, extras: 0,
    purpose: 'Emite facturas legales, conecta con el ente recaudador (DIAN, SAT, SENIAT) y envía por email.',
    benefits: ['Firma digital', 'Integración tributaria', 'Reportes fiscales'],
    stack: ['Node.js'],
    factura: 'Sistema de facturación electrónica con conexión al ente tributario.',
  },
  {
    id: 'inventario', cat: 'ERP', name: 'Inventario multi-almacén', icon: '📦', hours: 38, tier: TIER.M, extras: 0,
    purpose: 'Controla stock por bodega, lotes, vencimientos, movimientos y kardex.',
    benefits: ['Multi-bodega', 'Alertas de stock bajo', 'Kardex completo'],
    stack: ['Node.js'],
    factura: 'Sistema de control de inventario multi-almacén con kardex.',
  },
  {
    id: 'rrhh-nomina', cat: 'ERP', name: 'RRHH & Nómina', icon: '👔', hours: 70, tier: TIER.L, extras: 0,
    purpose: 'Gestiona empleados, contratos, vacaciones, asistencia y cálculo de nómina.',
    benefits: ['Cálculo de nómina automático', 'Vacaciones y permisos', 'Recibos digitales'],
    stack: ['Next.js'],
    factura: 'Sistema de RRHH con módulo de nómina y prestaciones.',
  },
  {
    id: 'proyectos', cat: 'ERP', name: 'Gestor de proyectos (Kanban/Gantt)', icon: '📌', hours: 45, tier: TIER.M, extras: 0,
    purpose: 'Organiza proyectos, asigna tareas, controla tiempos y mide productividad.',
    benefits: ['Tableros Kanban', 'Diagrama de Gantt', 'Reportes por equipo'],
    stack: ['React'],
    factura: 'Gestor de proyectos con tableros y vista de cronograma.',
  },
  {
    id: 'contabilidad', cat: 'ERP', name: 'Contabilidad básica', icon: '📒', hours: 60, tier: TIER.L, extras: 0,
    purpose: 'Asientos, libros, balances y reportes. Para que tu contador trabaje en línea.',
    benefits: ['Libros diario y mayor', 'Balance general / P&G', 'Exportación a Excel'],
    stack: ['Node.js'],
    factura: 'Módulo contable con libros y reportes financieros.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  INTEGRACIONES                                           ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'pasarela-stripe', cat: 'INT', name: 'Pasarela de pagos (Stripe / MercadoPago)', icon: '💳', hours: 16, tier: TIER.S, extras: 0,
    purpose: 'Acepta pagos con tarjeta, PSE, transferencias en línea — global o local.',
    benefits: ['Múltiples métodos', 'Webhook de notificación', 'Modo prueba y producción'],
    stack: ['Stripe', 'MercadoPago'],
    factura: 'Integración con pasarela de pagos internacional o regional.',
  },
  {
    id: 'wa-business-api', cat: 'INT', name: 'WhatsApp Business API', icon: '🟢', hours: 20, tier: TIER.S, extras: 0,
    purpose: 'Envía notificaciones, recibos, recordatorios desde tu sistema al WhatsApp del cliente.',
    benefits: ['Envíos masivos verificados', 'Plantillas aprobadas', 'Recepción de respuestas'],
    stack: ['WhatsApp Cloud API'],
    factura: 'Integración con WhatsApp Business API para mensajería.',
  },
  {
    id: 'email-marketing', cat: 'INT', name: 'Email marketing (Mailchimp / Brevo)', icon: '✉️', hours: 12, tier: TIER.S, extras: 0,
    purpose: 'Sincroniza contactos y dispara campañas desde tu sitio o ERP.',
    benefits: ['Sync automática de contactos', 'Triggers de campañas', 'Métricas de apertura'],
    stack: ['Mailchimp API', 'Brevo'],
    factura: 'Integración con plataforma de email marketing.',
  },
  {
    id: 'api-medida', cat: 'INT', name: 'API REST a medida', icon: '🧩', hours: 30, tier: TIER.M, extras: 0,
    purpose: 'Expone tus datos para que apps móviles, partners o sistemas externos se conecten.',
    benefits: ['Auth con API keys / OAuth', 'Documentación Swagger', 'Rate limiting'],
    stack: ['Node.js', 'Fastify'],
    factura: 'Desarrollo de API REST documentada con autenticación.',
  },
  {
    id: 'webhooks', cat: 'INT', name: 'Webhooks & sincronización entre sistemas', icon: '🔗', hours: 18, tier: TIER.S, extras: 0,
    purpose: 'Conecta dos plataformas para que se hablen entre sí en tiempo real.',
    benefits: ['Eventos en tiempo real', 'Reintentos automáticos', 'Logs de eventos'],
    stack: ['Node.js'],
    factura: 'Implementación de webhooks para sincronización entre sistemas.',
  },
  {
    id: 'sso', cat: 'INT', name: 'SSO (Google / Apple / Microsoft)', icon: '🔓', hours: 10, tier: TIER.S, extras: 0,
    purpose: 'Que tus usuarios entren con un clic usando su cuenta de Google, Apple o Microsoft.',
    benefits: ['Menos fricción al registrarse', 'Más seguro', 'Estándar OAuth 2.0'],
    stack: ['OAuth 2.0'],
    factura: 'Integración de inicio de sesión único con proveedores OAuth.',
  },
  {
    id: 'zapier', cat: 'INT', name: 'Conectores Zapier / Make (n8n)', icon: '🔀', hours: 15, tier: TIER.S, extras: 0,
    purpose: 'Conecta tu sistema con 5.000+ apps sin código adicional.',
    benefits: ['Acceso a miles de apps', 'Sin código nuevo', 'Mantenimiento bajo'],
    stack: ['Zapier', 'Make.com', 'n8n'],
    factura: 'Desarrollo de conectores para plataformas de automatización.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  IOT / HARDWARE                                          ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'iot-sensores', cat: 'IOT', name: 'Sensores y monitoreo remoto', icon: '📡', hours: 50, tier: TIER.M, extras: 150,
    purpose: 'Mide temperatura, humedad, presión, vibración — desde cualquier parte del mundo.',
    benefits: ['Alertas en tiempo real', 'Histórico de datos', 'Dashboard web'],
    stack: ['Arduino / ESP32', 'MQTT'],
    factura: 'Implementación de red de sensores IoT con dashboard de monitoreo.',
  },
  {
    id: 'control-acceso', cat: 'IOT', name: 'Control de acceso (RFID / QR)', icon: '🚪', hours: 45, tier: TIER.M, extras: 200,
    purpose: 'Quién entra y cuándo: por tarjeta, QR o huella, con registro auditado.',
    benefits: ['Registros con timestamp', 'Roles por horario', 'Alertas de intrusos'],
    stack: ['Arduino', 'React'],
    factura: 'Sistema de control de acceso con identificación RFID/QR.',
  },
  {
    id: 'telemetria', cat: 'IOT', name: 'Telemetría industrial', icon: '🏭', hours: 80, tier: TIER.L, extras: 0,
    purpose: 'Monitorea máquinas y procesos industriales 24/7. Para mantenimiento predictivo.',
    benefits: ['Datos de cada máquina', 'Alertas anticipadas', 'Reportes OEE'],
    stack: ['MQTT', 'InfluxDB', 'Grafana'],
    factura: 'Sistema de telemetría para monitoreo industrial.',
  },
  {
    id: 'domotica', cat: 'IOT', name: 'Domótica / smart home', icon: '🏠', hours: 60, tier: TIER.L, extras: 250,
    purpose: 'Controla luces, AC, cámaras y cerraduras desde tu celular.',
    benefits: ['Control por voz', 'Programación de escenas', 'Integración con Alexa/Google'],
    stack: ['Home Assistant', 'ESP32'],
    factura: 'Implementación de sistema domótico con control móvil.',
  },
  {
    id: 'gps-flotas', cat: 'IOT', name: 'GPS y trackeo de flotas', icon: '🛰️', hours: 55, tier: TIER.M, extras: 200,
    purpose: 'Sabe en tiempo real dónde están tus vehículos, conductores, rutas y consumo.',
    benefits: ['Mapa en vivo', 'Histórico de rutas', 'Geocercas y alertas'],
    stack: ['Mapbox', 'GPS Tracker'],
    factura: 'Plataforma de trackeo GPS con geocercas y reportes.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  GOBIERNO                                                ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'portal-tributario', cat: 'GOV', name: 'Portal Tributario (Ciudadano)', icon: '🏛️', hours: 120, tier: TIER.L, extras: 0,
    purpose: 'Interfaz segura para que los contribuyentes declaren, consulten deudas y paguen en línea.',
    benefits: ['Seguridad SSL grado A', 'Proceso de pago simplificado', 'Acceso 24/7'],
    stack: ['React/Vite', 'SSL'],
    factura: 'Interfaz web segura para registro de contribuyentes y declaración de impuestos.',
  },
  {
    id: 'panel-hacienda', cat: 'GOV', name: 'Panel de Hacienda (Admin)', icon: '🛡️', hours: 140, tier: TIER.XL, extras: 0,
    purpose: 'Dashboard para funcionarios: validar pagos, auditar, emitir solvencias digitales.',
    benefits: ['Reportes en tiempo real', 'Validación de transacciones', 'Solvencias digitales'],
    stack: ['Next.js', 'SSR'],
    factura: 'Dashboard administrativo para validación de pagos y reportes de recaudación.',
  },
  {
    id: 'motor-fiscal', cat: 'GOV', name: 'Motor de Cálculo Fiscal', icon: '🧮', hours: 120, tier: TIER.L, extras: 0,
    purpose: 'API que automatiza el cálculo de impuestos según ordenanza, U.T. o anclaje BCV.',
    benefits: ['Cero errores de cálculo', 'Integración vía API REST', 'Adaptable a normativas'],
    stack: ['Node.js', 'Python'],
    factura: 'API Backend para cálculo automatizado de impuestos.',
  },
  {
    id: 'pasarela-banca', cat: 'GOV', name: 'Pasarela bancaria nacional', icon: '🏦', hours: 100, tier: TIER.L, extras: 0,
    purpose: 'Integración con bancos nacionales y conciliación automática de pagos móviles.',
    benefits: ['Integración API banca nacional', 'Webhooks de notificación', 'Conciliación automática'],
    stack: ['Node.js', 'Webhooks'],
    factura: 'Integración con APIs bancarias y conciliación de pagos.',
  },
  {
    id: 'licitaciones', cat: 'GOV', name: 'Portal de licitaciones / contrataciones', icon: '📋', hours: 90, tier: TIER.L, extras: 0,
    purpose: 'Publicación y gestión transparente de procesos de contratación pública.',
    benefits: ['Publicación abierta', 'Pliegos descargables', 'Trazabilidad completa'],
    stack: ['Next.js'],
    factura: 'Portal de transparencia para licitaciones públicas.',
  },
  {
    id: 'denuncias', cat: 'GOV', name: 'Sistema de denuncias ciudadanas', icon: '📢', hours: 40, tier: TIER.M, extras: 0,
    purpose: 'Canal para que la ciudadanía reporte hechos con seguimiento y anonimato opcional.',
    benefits: ['Denuncia anónima', 'Seguimiento por código', 'Panel para autoridades'],
    stack: ['Next.js'],
    factura: 'Plataforma de denuncias ciudadanas con seguimiento.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  SEGURIDAD                                               ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'auditoria-logs', cat: 'SEC', name: 'Auditoría & Logs inmutables', icon: '🔐', hours: 40, tier: TIER.M, extras: 0,
    purpose: 'Registro inmutable de todas las acciones del sistema, cumple con contraloría.',
    benefits: ['Trazabilidad completa', 'Logs inmutables', 'Facilita auditorías externas'],
    stack: ['Supabase Logs'],
    factura: 'Sistema de registro inmutable para cumplimiento de contraloría.',
  },
  {
    id: '2fa', cat: 'SEC', name: '2FA / MFA (doble factor)', icon: '🔑', hours: 12, tier: TIER.S, extras: 0,
    purpose: 'Suma seguridad al login: código por SMS, app autenticadora o biométrico.',
    benefits: ['SMS, TOTP o biométrico', 'Recuperación segura', 'Estándar TOTP'],
    stack: ['Authenticator', 'WebAuthn'],
    factura: 'Implementación de autenticación de doble factor.',
  },
  {
    id: 'pentest', cat: 'SEC', name: 'Auditoría de seguridad (pentest)', icon: '🛡️', hours: 35, tier: TIER.M, extras: 0,
    purpose: 'Detectamos vulnerabilidades antes que los atacantes. Informe ejecutivo y técnico.',
    benefits: ['Análisis OWASP Top 10', 'Reporte ejecutivo + técnico', 'Plan de remediación'],
    stack: ['OWASP'],
    factura: 'Auditoría de seguridad y pruebas de penetración.',
  },
  {
    id: 'gdpr', cat: 'SEC', name: 'Cumplimiento GDPR / Habeas Data', icon: '📜', hours: 25, tier: TIER.M, extras: 0,
    purpose: 'Cumple la ley de protección de datos: políticas, consentimientos, derechos.',
    benefits: ['Consentimientos', 'Derecho al olvido', 'Política de privacidad'],
    stack: ['GDPR Toolkit'],
    factura: 'Adecuación de plataforma a normativas de protección de datos.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  CLOUD / DEVOPS                                          ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'config-server', cat: 'CLOUD', name: 'Configuración Cloud & DevOps', icon: '☁️', hours: 5, tier: TIER.XS, extras: 0,
    purpose: 'Entorno de producción seguro con despliegue automático cada vez que actualizamos código.',
    benefits: ['Alta disponibilidad', 'Despliegue continuo (CI/CD)', 'Entorno escalable con Docker'],
    stack: ['Render', 'Docker'],
    factura: 'Configuración de entorno de producción y despliegue continuo.',
  },
  {
    id: 'migracion-cloud', cat: 'CLOUD', name: 'Migración a la nube (AWS/GCP/Azure)', icon: '🚛', hours: 60, tier: TIER.L, extras: 0,
    purpose: 'Llevamos tu infraestructura on-premise a la nube — seguro, sin downtime.',
    benefits: ['Zero downtime', 'Backups antes y después', 'Costos optimizados'],
    stack: ['AWS', 'GCP', 'Azure'],
    factura: 'Migración de infraestructura a proveedor cloud.',
  },
  {
    id: 'monitoreo', cat: 'CLOUD', name: 'Monitoreo & alertas', icon: '🔔', hours: 20, tier: TIER.S, extras: 0,
    purpose: 'Te avisamos cuando algo se cae, se lentifica o tiene errores. Antes que el cliente.',
    benefits: ['Alertas por email/Slack', 'Dashboards públicos', 'Histórico de uptime'],
    stack: ['Grafana', 'UptimeRobot'],
    factura: 'Implementación de monitoreo y sistema de alertas.',
  },
  {
    id: 'optimizacion-cloud', cat: 'CLOUD', name: 'Optimización de costos cloud', icon: '💰', hours: 18, tier: TIER.S, extras: 0,
    purpose: 'Auditamos tu factura cloud y bajamos costos sin sacrificar performance.',
    benefits: ['Auditoría de uso', 'Recomendaciones aplicables', 'Reducción típica 30-60%'],
    stack: ['AWS Cost Explorer'],
    factura: 'Auditoría y optimización de costos en proveedor cloud.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  INFRAESTRUCTURA                                         ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'servidor-datos', cat: 'INFRA', name: 'Servidor de datos con encriptación', icon: '🗄️', hours: 25, tier: TIER.M, extras: 0,
    purpose: 'Base de datos con encriptación, copias de seguridad horarias y alta redundancia.',
    benefits: ['Encriptación de datos sensibles', 'Backups automáticos cada hora', 'Alta redundancia'],
    stack: ['Supabase Pro'],
    factura: 'Base de datos relacional con encriptación y backups horarios.',
  },
  {
    id: 'cdn', cat: 'INFRA', name: 'CDN setup (rendimiento global)', icon: '🌐', hours: 8, tier: TIER.XS, extras: 0,
    purpose: 'Tu sitio carga rápido en todo el mundo, no solo donde está tu servidor.',
    benefits: ['Latencia mínima global', 'Protección DDoS básica', 'Cache inteligente'],
    stack: ['Cloudflare'],
    factura: 'Configuración de CDN para distribución global de contenido.',
  },
  {
    id: 'dominios-ssl', cat: 'INFRA', name: 'Dominios y certificados SSL', icon: '🔒', hours: 4, tier: TIER.XS, extras: 0,
    purpose: 'Configuración profesional de tu dominio, subdominios y HTTPS.',
    benefits: ['DNS configurado', 'SSL renovación automática', 'Email corporativo opcional'],
    stack: ['Cloudflare', 'Let’s Encrypt'],
    factura: 'Configuración de DNS, certificados SSL y dominios.',
  },
  {
    id: 'email-transaccional', cat: 'INFRA', name: 'Email transaccional', icon: '📧', hours: 10, tier: TIER.XS, extras: 0,
    purpose: 'Envía emails desde tu app (recibos, notificaciones, recuperación) confiables.',
    benefits: ['Alta entregabilidad', 'Plantillas personalizables', 'Tracking de aperturas'],
    stack: ['Resend', 'Sendgrid'],
    factura: 'Configuración de servicio de email transaccional.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  MARKETING & GROWTH                                      ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'seo-tecnico', cat: 'MKT', name: 'SEO técnico (Core Web Vitals)', icon: '🔍', hours: 20, tier: TIER.S, extras: 0,
    purpose: 'Optimización técnica para que Google te quiera: velocidad, schema, sitemap.',
    benefits: ['Lighthouse 90+', 'Schema markup', 'Sitemap & robots'],
    stack: ['Next.js', 'Lighthouse'],
    factura: 'Optimización SEO técnica y de rendimiento (Core Web Vitals).',
  },
  {
    id: 'analytics', cat: 'MKT', name: 'Analytics (GA4 + Tag Manager)', icon: '📈', hours: 10, tier: TIER.XS, extras: 0,
    purpose: 'Mide qué hacen tus visitantes y de dónde vienen — para decidir con datos.',
    benefits: ['Eventos personalizados', 'Embudos de conversión', 'Reportes ejecutivos'],
    stack: ['GA4', 'GTM'],
    factura: 'Implementación de analytics y gestor de etiquetas.',
  },
  {
    id: 'pixels-ads', cat: 'MKT', name: 'Pixels (Meta / TikTok / Google Ads)', icon: '🎯', hours: 8, tier: TIER.XS, extras: 0,
    purpose: 'Para que tus campañas pagadas midan resultados y remarqueteen visitantes.',
    benefits: ['Eventos del embudo', 'Audiencias personalizadas', 'Conversiones offline'],
    stack: ['Meta', 'TikTok', 'Google'],
    factura: 'Integración de pixels publicitarios y conversiones.',
  },
  {
    id: 'email-automation', cat: 'MKT', name: 'Email automation / drip campaigns', icon: '💌', hours: 18, tier: TIER.S, extras: 0,
    purpose: 'Series automáticas: bienvenida, onboarding, recuperación. Vendes mientras duermes.',
    benefits: ['Triggers por evento', 'Plantillas editables', 'Métricas por etapa'],
    stack: ['Brevo', 'Customer.io'],
    factura: 'Automatización de campañas de email marketing.',
  },
  {
    id: 'ab-testing', cat: 'MKT', name: 'A/B testing & CRO', icon: '🧪', hours: 22, tier: TIER.S, extras: 0,
    purpose: 'Prueba dos versiones y deja que los datos decidan cuál convierte más.',
    benefits: ['Tests estadísticos', 'Dashboard de resultados', 'Iteración continua'],
    stack: ['VWO', 'Optimizely'],
    factura: 'Configuración de pruebas A/B y optimización de conversión.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  EDUCACIÓN / LMS                                         ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'lms', cat: 'EDU', name: 'Plataforma de cursos online (LMS)', icon: '🎓', hours: 90, tier: TIER.L, extras: 0,
    purpose: 'Sube cursos, vende membresías, controla progreso de alumnos.',
    benefits: ['Player de video', 'Progreso por curso', 'Pagos integrados'],
    stack: ['Next.js', 'Mux'],
    factura: 'Plataforma LMS con gestión de cursos, alumnos y pagos.',
  },
  {
    id: 'evaluaciones', cat: 'EDU', name: 'Sistema de evaluaciones / quizzes', icon: '📝', hours: 30, tier: TIER.M, extras: 0,
    purpose: 'Crea tests con tipos variados, calificación automática y certificados.',
    benefits: ['Múltiples tipos de pregunta', 'Calificación automática', 'Banco de preguntas'],
    stack: ['React'],
    factura: 'Sistema de evaluaciones con calificación automatizada.',
  },
  {
    id: 'certificados', cat: 'EDU', name: 'Generador de certificados verificables', icon: '🏅', hours: 14, tier: TIER.S, extras: 0,
    purpose: 'Certificados con QR para verificar autenticidad — anti-fraude.',
    benefits: ['QR de verificación', 'Plantillas a medida', 'PDF descargable'],
    stack: ['jsPDF'],
    factura: 'Sistema de generación de certificados verificables vía QR.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  SALUD                                                   ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'telemedicina', cat: 'HEALTH', name: 'Telemedicina / video consultas', icon: '🩺', hours: 70, tier: TIER.L, extras: 0,
    purpose: 'Consultas por video con sala virtual, recetas y seguimiento.',
    benefits: ['Video HD', 'Sala segura', 'Receta digital'],
    stack: ['Daily.co', 'Next.js'],
    factura: 'Plataforma de telemedicina con videoconsultas y recetas.',
  },
  {
    id: 'historia-clinica', cat: 'HEALTH', name: 'Historia clínica digital', icon: '📋', hours: 55, tier: TIER.L, extras: 0,
    purpose: 'Expediente del paciente: antecedentes, evolución, archivos, prescripciones.',
    benefits: ['Acceso por especialista', 'Adjuntos médicos', 'Línea de tiempo'],
    stack: ['Next.js'],
    factura: 'Sistema de historia clínica electrónica.',
  },
  {
    id: 'receta-electronica', cat: 'HEALTH', name: 'Receta médica electrónica', icon: '💊', hours: 25, tier: TIER.M, extras: 0,
    purpose: 'Emite recetas digitales firmadas, validables en farmacias.',
    benefits: ['Firma digital', 'Validación por QR', 'Histórico por paciente'],
    stack: ['Node.js'],
    factura: 'Módulo de receta electrónica con firma digital.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  LOGÍSTICA                                               ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'tracking-pedidos', cat: 'LOG', name: 'Tracking de pedidos para el cliente', icon: '📦', hours: 20, tier: TIER.S, extras: 0,
    purpose: 'Tu cliente ve dónde va su pedido en cada paso, con notificaciones.',
    benefits: ['Mapa en vivo', 'Notificaciones automáticas', 'Página pública por código'],
    stack: ['React', 'Mapbox'],
    factura: 'Página de tracking público de envíos con notificaciones.',
  },
  {
    id: 'rutas', cat: 'LOG', name: 'Optimización de rutas (TSP)', icon: '🗺️', hours: 40, tier: TIER.M, extras: 0,
    purpose: 'Calcula la mejor ruta para tus repartos: menos km, menos gasolina, más entregas.',
    benefits: ['Algoritmo TSP', 'Hasta N paradas', 'Exportación a app del conductor'],
    stack: ['Google Routes API'],
    factura: 'Motor de optimización de rutas de entrega.',
  },
  {
    id: 'bodega', cat: 'LOG', name: 'WMS / inventario de bodega', icon: '🏗️', hours: 60, tier: TIER.L, extras: 0,
    purpose: 'Gestión de bodega: ubicaciones, picking, packing y despacho.',
    benefits: ['Ubicaciones por pasillo/estante', 'Picking guiado', 'Etiquetas con QR'],
    stack: ['Next.js'],
    factura: 'Sistema de gestión de almacén (WMS) con picking y packing.',
  },
  {
    id: 'codigo-barras', cat: 'LOG', name: 'Etiquetas y códigos de barras', icon: '🏷️', hours: 18, tier: TIER.S, extras: 0,
    purpose: 'Imprime etiquetas con código de barras o QR para tu inventario o envíos.',
    benefits: ['Códigos 1D y 2D', 'Plantillas a medida', 'Lectura con cámara'],
    stack: ['JsBarcode'],
    factura: 'Sistema de generación de etiquetas con códigos de barras / QR.',
  },

  // ╔══════════════════════════════════════════════════════════╗
  // ║  SOPORTE & MANTENIMIENTO                                 ║
  // ╚══════════════════════════════════════════════════════════╝
  {
    id: 'mantenimiento-mensual', cat: 'SUPPORT', name: 'Mantenimiento mensual', icon: '🔧', hours: 10, tier: TIER.S, extras: 0,
    purpose: 'Actualizaciones, parches de seguridad, monitoreo y pequeños ajustes — mensual.',
    benefits: ['Updates programados', 'Monitoreo proactivo', 'Reporte mensual'],
    stack: ['Iteración continua'],
    factura: 'Servicio mensual de mantenimiento técnico y actualizaciones.',
  },
  {
    id: 'soporte-24-7', cat: 'SUPPORT', name: 'Soporte 24/7', icon: '🆘', hours: 25, tier: TIER.M, extras: 0,
    purpose: 'Línea directa cuando algo crítico falla. Respuesta garantizada por SLA.',
    benefits: ['SLA de respuesta', 'Canal prioritario', 'On-call ingeniero'],
    stack: ['On-call'],
    factura: 'Servicio de soporte técnico 24/7 con SLA.',
  },
  {
    id: 'retainer', cat: 'SUPPORT', name: 'Bolsa de horas (retainer)', icon: '⏳', hours: 20, tier: TIER.S, extras: 0,
    purpose: 'Horas pre-pagadas para los pequeños cambios y mejoras del día a día.',
    benefits: ['Tarifa preferencial', 'Prioridad en cola', 'Sin contratos largos'],
    stack: ['Flexible'],
    factura: 'Bolsa de horas de desarrollo (retainer).',
  },
  {
    id: 'migracion-sistema', cat: 'SUPPORT', name: 'Migración de sistema legacy', icon: '🔁', hours: 70, tier: TIER.L, extras: 0,
    purpose: 'Pasamos tu sistema viejo a una plataforma moderna, conservando los datos.',
    benefits: ['Migración de datos', 'Paralelización segura', 'Capacitación al equipo'],
    stack: ['Custom'],
    factura: 'Migración de sistema legacy a plataforma moderna.',
  },
];

/** Categorías presentes en los productos (para filtrar). */
export const ACTIVE_CATEGORIES = CATEGORIES.filter(
  (c) => c.key === 'ALL' || PRODUCTS.some((p) => p.cat === c.key)
);

/** Calcula el precio de un item (horas + extras) × cantidad. */
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
