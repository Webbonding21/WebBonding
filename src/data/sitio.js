// src/data/sitio.js
// Lo que dice la página de inicio y se cambia desde /admin: cifras, palabras, servicios, pilares, el proceso, los
// proyectos, los planes y las preguntas. La web muestra lo que está en la base (public.ver_contenido(), ver
// src/lib/contenido.js); esto es lo que sale mientras llega o si la base no responde, y de aquí sale la semilla de la base
// (scripts/semilla-contenido.mjs). Los números «01», «02»… salen del orden, no se guardan.

// las cifras de la portada: n es el número que cuenta, suffix lo que va pegado (+, %) y label el texto (\n parte la línea)
export const CIFRAS = [
  { n: 30, suffix: '+', label: 'proyectos\nentregados' },
  { n: 8, suffix: '', label: 'industrias\natendidas' },
  { n: 2, suffix: '', label: 'países\n(VE · Latam)' },
  { n: 100, suffix: '%', label: 'código\na medida' },
];

// la cinta que corre debajo de la portada
export const PALABRAS = [
  'Apps móviles', 'Tiendas en línea', 'Sistemas administrativos', 'Equipos conectados',
  'Delivery', 'Pagos en línea', 'Paneles de control', 'Automatización', 'Apps web', 'Chatbots de WhatsApp',
].map((texto) => ({ texto }));

// mod: el color de la tarjeta (a, b o c, en Services.css)
export const SERVICIOS = [
  {
    icon: '💻',
    img: '/img/service-web.jpg',
    title: 'Páginas web y apps',
    desc: 'Páginas y apps rápidas, fáciles de usar y listas para crecer contigo.',
    features: ['Páginas de presentación y corporativas', 'Tiendas en línea', 'Apps web y paneles de control', 'Apps para iPhone y Android'],
    mod: 'a',
  },
  {
    icon: '⚙️',
    img: '/img/service-data.jpg',
    title: 'Sistemas para tu negocio',
    desc: 'El sistema que ordena tu negocio y saca las cuentas por ti.',
    features: ['Sistemas administrativos (ERP / CRM)', 'Conexión con bancos, pagos y WhatsApp', 'Tus datos seguros y ordenados', 'Cobros en línea'],
    mod: 'b',
  },
  {
    icon: '📡',
    img: '/img/service-iot.jpg',
    title: 'Equipos conectados (IoT)',
    desc: 'Conectamos tus máquinas y sensores a una app para verlos y controlarlos a distancia.',
    features: ['Sensores y monitoreo a distancia', 'Automatización industrial', 'Control desde la web o el teléfono', 'Datos de tus equipos en tiempo real'],
    mod: 'c',
  },
];

// «Por qué Web Bonding»
export const PILARES = [
  {
    title: 'Enfoque en resultados',
    desc: 'No entregamos «código»: entregamos orden, tiempo ahorrado y un negocio listo para crecer.',
  },
  {
    title: 'Rápido y seguro',
    desc: 'Apps que cargan rápido y datos protegidos, desde lo que ve tu cliente hasta el servidor donde se guarda todo.',
  },
  {
    title: 'Más allá de la pantalla',
    desc: 'Conectamos tu app con equipos físicos (sensores, máquinas, cámaras) para que los veas y controles desde el teléfono.',
  },
];

// «Cómo trabajamos»
export const PASOS = [
  { title: 'Te escuchamos', desc: 'Conocemos tu negocio y lo que necesitas. Definimos juntos qué vamos a construir, cuánto cuesta y cuándo estará listo.' },
  { title: 'Diseño', desc: 'Te mostramos cómo se verá tu app, pantalla por pantalla, y la apruebas antes de programarla.' },
  { title: 'Construcción y pruebas', desc: 'La construimos por etapas y cada semana ves el avance. La probamos a fondo antes de entregarla.' },
  { title: 'En tu teléfono', desc: 'La publicamos en las tiendas o en la web y te acompañamos después con ajustes, mejoras y soporte.' },
];

// los casos de la portada. accent: el color de la tarjeta; span: el ancho en la grilla de 12 (span-7, span-5 o span-4)
export const PROYECTOS = [
  {
    name: 'Riko',
    cat: 'Food-tech · App de delivery',
    year: '2025',
    desc: 'Marketplace de comida a domicilio: app del cliente, panel de restaurantes y módulo de repartidores con pagos y seguimiento en vivo.',
    tags: ['App móvil', 'Marketplace', 'Pagos', 'Tiempo real'],
    accent: '#7B2FBE',
    span: 'span-7',
  },
  {
    name: 'Llegate',
    cat: 'Movilidad · Transporte',
    year: '2025',
    desc: 'Transporte urbano para Venezuela. Apps de pasajero y conductor con geolocalización y despacho en tiempo real.',
    tags: ['iPhone y Android', 'GPS en vivo', 'Despacho en tiempo real'],
    accent: '#2E37FF',
    span: 'span-5',
  },
  {
    name: 'Planta Conectada',
    cat: 'IoT · Automatización industrial',
    year: '2024',
    desc: 'Monitoreo y control remoto de equipos con sensores, telemetría y alertas en tiempo real para plantas industriales.',
    tags: ['IoT', 'Telemetría', 'Hardware', 'Dashboard'],
    accent: '#1A1A2E',
    span: 'span-4',
  },
  {
    name: 'Automercado Digital',
    cat: 'Retail · E-commerce',
    year: '2024',
    desc: 'Catálogo en línea, carrito de compras y panel administrativo para cadenas de bodegones y automercados.',
    tags: ['E-commerce', 'Catálogo', 'Panel admin'],
    accent: '#0E3A2F',
    span: 'span-4',
  },
  {
    name: 'ERP / CRM a medida',
    cat: 'Sistemas · Software empresarial',
    year: '2024',
    desc: 'Gestión integral con módulos de facturación, dashboards en tiempo real, reportes y automatización de procesos para empresas y consultorios médicos.',
    tags: ['ERP', 'CRM', 'Dashboards', 'Roles', 'Reportes'],
    accent: '#1C1020',
    span: 'span-4',
  },
];

// featured: la tarjeta destacada («Más popular»)
export const PLANES = [
  {
    name: 'Presencia en línea',
    tagline: 'Para validar y tener presencia',
    price: 'Consultar',
    features: ['Página de presentación moderna', 'Se ve bien en teléfono y computadora', 'Botón directo a WhatsApp', 'Hosting incluido (1 año)', 'Lista para aparecer en Google'],
  },
  {
    name: 'Negocio en línea',
    tagline: 'Para negocios en expansión',
    price: 'Consultar',
    featured: true,
    features: ['Sitio corporativo (hasta 10 páginas)', 'Catálogo o tienda en línea', 'Panel administrativo', 'Blog / Noticias', 'Cobros en línea'],
  },
  {
    name: 'Software a la medida',
    tagline: 'Automatización y software a medida',
    price: 'A medida',
    features: ['App o sistema completo a la medida', 'Conexión con equipos y sensores (IoT)', 'Apps para iPhone y Android', 'Sistema administrativo (ERP / CRM)', 'Soporte prioritario 24/7'],
  },
];

// las preguntas frecuentes (el index.html trae las primeras en su JSON-LD FAQPage)
export const PREGUNTAS = [
  {
    q: '¿Dónde está ubicada Web Bonding?',
    a: 'Web Bonding tiene sede en Acarigua–Araure, estado Portuguesa, Venezuela. Atendemos clientes presenciales en la región y trabajamos de forma remota con empresas de toda Venezuela y Latinoamérica.',
  },
  {
    q: '¿Qué tipo de proyectos desarrollan?',
    a: 'Construimos páginas web, e-commerce, aplicaciones móviles iOS y Android, sistemas ERP/CRM, agentes de Inteligencia Artificial, chatbots WhatsApp, soluciones IoT, automatización industrial y software a medida para cualquier industria.',
  },
  {
    q: '¿Cuánto cuesta hacer una página web o una app en Venezuela?',
    a: 'Una landing page profesional inicia desde aproximadamente 300 USD; un e-commerce desde 1.200 USD; y una aplicación móvil multiplataforma desde 2.700 USD. Todos los proyectos se cotizan a medida según funcionalidades. Solicita una cotización por WhatsApp al +58 422 057 9731.',
  },
  {
    q: '¿Trabajan con empresas fuera de Acarigua y Araure?',
    a: 'Sí. Aunque nuestra sede está en Acarigua–Araure, Portuguesa, atendemos remotamente a clientes de Barquisimeto, Caracas, Valencia, Maracay, Maracaibo y toda Latinoamérica (Colombia, México, Argentina, entre otros).',
  },
  {
    q: '¿Qué tecnologías usan?',
    a: 'Desarrollamos con React, Next.js, TypeScript, Node.js, Python, Flutter, Capacitor, Supabase, MongoDB, PostgreSQL y plataformas en la nube como AWS, Render y Vercel. Para IoT usamos Arduino, ESP32, Raspberry Pi y MQTT.',
  },
  {
    q: '¿En cuánto tiempo entregan un proyecto?',
    a: 'Una landing page se entrega en 1 a 2 semanas, un e-commerce en 4 a 6 semanas y una app móvil completa entre 8 y 12 semanas. Trabajamos por etapas y cada semana ves el avance.',
  },
];
