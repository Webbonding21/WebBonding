// Las secciones del panel /admin: qué datos maneja cada una, con qué campos se editan y cómo se ve cada fila en la lista.
// Las de fuente 'contenido' se guardan en web_bonding.contenido (supabase/admin.sql) y la web las lee con useContenido
// (src/lib/contenido.js); 'portafolio' tiene su tabla. Inicio, leads y equipo tienen su propia vista; cotizador y R4 son
// herramientas aparte que se abren desde el menú.
//
// Cada campo: k (la clave en los datos), t (la etiqueta), tipo, y según el tipo: req, max, min, paso, ayuda, ejemplo,
// opciones [[valor, texto, detalle]], ancho ('medio' para dos por fila), desde (el campo del que sale un código), inicial (el
// valor con que empieza uno nuevo).
// Tipos: texto · largo · numero · opciones · si_no · lista · color · imagen · capturas · enlaces · instagram · etiqueta ·
// portada · codigo.
import {
  FiAward, FiBarChart2, FiBriefcase, FiCreditCard, FiFileText, FiFilm, FiHelpCircle, FiHome, FiInbox, FiLayers, FiPackage,
  FiSmartphone, FiTag, FiTrendingUp, FiType, FiUsers,
} from 'react-icons/fi';
import { CATEGORIES, TIERS } from '../../data/catalog';
import { IG } from '../EmbedInstagram';

export const GRUPOS = [
  { id: 'web', nombre: 'La web' },
  { id: 'ventas', nombre: 'Ventas' },
  { id: 'equipo', nombre: 'Equipo' },
];

const CATEGORIAS = CATEGORIES.filter((c) => c.key !== 'ALL').map((c) => [c.key, c.label]);
export const nombreCategoria = (k) => CATEGORIES.find((c) => c.key === k)?.label ?? k;
const COMPLEJIDAD = Object.entries(TIERS).map(([k, v]) => [k, v.label]);
const una = (lista, n, singular, plural) => (lista?.length ? `${lista.length} ${lista.length === 1 ? singular : plural}` : n);
const linea = (...partes) => partes.filter(Boolean).join(' · ');
const usd = (n) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(n));

export const SECCIONES = [
  {
    id: 'inicio', nombre: 'Resumen', icono: FiHome, vista: 'inicio', roles: ['admin', 'ventas', 'lectura'],
  },

  // ── La web ──
  {
    id: 'portafolio', grupo: 'web', nombre: 'Portafolio', uno: 'video', icono: FiFilm, vista: 'coleccion', fuente: 'portafolio',
    roles: ['admin'], donde: '/portafolio#videos',
    descripcion: 'Los videos de Instagram que salen en /portafolio, en este orden. Se pega el enlace tal cual lo copia Instagram.',
    campos: [
      { k: 'codigo', t: 'Enlace de Instagram', tipo: 'instagram', req: true,
        ayuda: 'En Instagram: abre el video, toca Compartir y «Copiar enlace». Sirve un reel o una publicación.' },
      { k: 'titulo', t: 'Título', tipo: 'texto', req: true, max: 80, ejemplo: 'Taquilla', ayuda: 'Va grande debajo de la portada.' },
      { k: 'etiqueta', t: 'Qué es', tipo: 'etiqueta', req: true, max: 30 },
      { k: 'tipo', t: 'La línea de abajo', tipo: 'texto', max: 120, ejemplo: 'Reel · Haciendo una app por día, Día 2' },
      { k: 'descripcion', t: 'Descripción', tipo: 'largo', max: 600, filas: 3,
        ejemplo: 'Para vender las entradas de un evento: cada una lleva su QR y se valida en la puerta.',
        ayuda: 'Sale al lado del video cuando alguien lo abre.' },
      { k: 'portada', t: 'Portada', tipo: 'portada', ayuda: 'Lo que se ve en la grilla antes de darle play: una imagen o un cuadro del video.' },
    ],
    fila: (d) => ({
      titulo: d.titulo, sub: linea(d.etiqueta, d.tipo), mini: { vertical: d.portada || null },
      enlace: d.codigo ? { texto: d.codigo, url: `${IG}/p/${d.codigo}/` } : null, extra: d.duracion || '',
    }),
  },
  {
    id: 'apps', grupo: 'web', nombre: 'Apps', uno: 'app', genero: 'f', icono: FiSmartphone, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/crea-tu-app#apps',
    descripcion: 'La vitrina de «Nuestras apps» de /crea-tu-app y /portafolio: cada app con sus pantallas reales y sus enlaces.',
    campos: [
      { k: 'nombre', t: 'Nombre', tipo: 'texto', req: true, max: 40, ejemplo: 'Taquilla', ancho: 'medio' },
      { k: 'slug', t: 'Código', tipo: 'codigo', req: true, desde: 'nombre', unico: true, ancho: 'medio',
        ayuda: 'Sin espacios. Sale solo del nombre.' },
      { k: 'tipo', t: 'Qué es', tipo: 'texto', req: true, max: 60, ejemplo: 'App de venta de entradas', ancho: 'medio' },
      { k: 'chip', t: 'Nombre corto', tipo: 'texto', max: 16, ejemplo: 'Farmacia', ancho: 'medio',
        ayuda: 'Para el botón de la vitrina, si el nombre es largo. Si lo dejas vacío, va el nombre.' },
      { k: 'descripcion', t: 'Descripción', tipo: 'largo', max: 500, filas: 4,
        ejemplo: 'Vendes las entradas de tu evento por la app: cada una lleva su QR y se valida en la puerta.' },
      { k: 'capturas', t: 'Pantallas', tipo: 'capturas', req: true,
        ayuda: 'Capturas reales de la app. La primera es la que se ve al elegirla. Marca si es de teléfono o de computadora.' },
      { k: 'enlaces', t: 'Enlaces', tipo: 'enlaces', ayuda: 'Solo los públicos: la web de la app o su página en la tienda.' },
    ],
    fila: (d) => ({
      titulo: d.nombre, sub: linea(d.tipo, una(d.capturas, 'sin pantallas', 'pantalla', 'pantallas')),
      mini: { telefono: d.capturas?.find((c) => c.formato === 'movil')?.src ?? d.capturas?.[0]?.src ?? null },
    }),
  },
  {
    id: 'proyectos', grupo: 'web', nombre: 'Proyectos', uno: 'proyecto', icono: FiBriefcase, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/#work',
    descripcion: 'Los casos de la página de inicio («Casos reales, resultados reales»).',
    campos: [
      { k: 'name', t: 'Nombre', tipo: 'texto', req: true, max: 60, ejemplo: 'Riko', ancho: 'medio' },
      { k: 'year', t: 'Año', tipo: 'texto', max: 9, ejemplo: '2025', ancho: 'medio' },
      { k: 'cat', t: 'Categoría', tipo: 'texto', max: 80, ejemplo: 'Food-tech · App de delivery' },
      { k: 'desc', t: 'Descripción', tipo: 'largo', req: true, max: 400, filas: 3 },
      { k: 'tags', t: 'Etiquetas', tipo: 'lista', max: 30, ejemplo: 'App móvil' },
      { k: 'accent', t: 'Color de la tarjeta', tipo: 'color', req: true, inicial: '#2E37FF' },
      { k: 'span', t: 'Ancho en la grilla', tipo: 'opciones', req: true, inicial: 'span-4',
        opciones: [['span-7', 'Ancha', '7 de 12 columnas'], ['span-5', 'Mediana', '5 de 12'], ['span-4', 'Angosta', '4 de 12']],
        ayuda: 'Cada fila de la grilla suma 12: ancha + mediana, o tres angostas.' },
    ],
    fila: (d) => ({ titulo: d.name, sub: linea(d.cat, d.year), mini: { color: d.accent || '#0E0E11' }, chips: (d.tags ?? []).slice(0, 3) }),
  },
  {
    id: 'planes', grupo: 'web', nombre: 'Planes', uno: 'plan', icono: FiLayers, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/#plans',
    descripcion: 'Las tarjetas de planes de la página de inicio («Inversión inteligente»).',
    campos: [
      { k: 'name', t: 'Nombre', tipo: 'texto', req: true, max: 60, ejemplo: 'Negocio en línea' },
      { k: 'tagline', t: 'Para quién es', tipo: 'texto', max: 90, ejemplo: 'Para negocios en expansión' },
      { k: 'price', t: 'Precio', tipo: 'texto', req: true, max: 30, ejemplo: 'Consultar', ayuda: 'Un monto ($300) o «Consultar», «A medida».' },
      { k: 'featured', t: 'Destacado', tipo: 'si_no', inicial: false, ayuda: 'Lleva la cinta «Más popular» y resalta la tarjeta.' },
      { k: 'features', t: 'Qué trae', tipo: 'lista', req: true, max: 80, ejemplo: 'Hosting incluido (1 año)' },
    ],
    fila: (d) => ({ titulo: d.name, sub: d.tagline, extra: d.price, chips: d.featured ? ['Destacado'] : [] }),
  },
  {
    id: 'servicios', grupo: 'web', nombre: 'Servicios', uno: 'servicio', icono: FiPackage, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/#services',
    descripcion: 'Las tarjetas de «Qué hacemos» en la página de inicio, con su foto.',
    campos: [
      { k: 'title', t: 'Título', tipo: 'texto', req: true, max: 60, ejemplo: 'Páginas web y apps' },
      { k: 'desc', t: 'Descripción', tipo: 'largo', max: 300, filas: 2 },
      { k: 'features', t: 'Qué incluye', tipo: 'lista', max: 80 },
      { k: 'img', t: 'Foto', tipo: 'imagen', req: true, lado: 1400, ayuda: 'Horizontal. Se recorta para llenar el espacio de la tarjeta.' },
      { k: 'icon', t: 'Ícono', tipo: 'texto', max: 4, ancho: 'medio', ayuda: 'Un emoji, al lado del título. Opcional.' },
      { k: 'mod', t: 'Tamaño de la tarjeta', tipo: 'opciones', req: true, ancho: 'medio', inicial: 'a',
        opciones: [['a', 'Ancha', '7 de 12'], ['b', 'Mediana', '5 de 12'], ['c', 'Completa', '12 de 12, foto al lado']] },
    ],
    fila: (d) => ({ titulo: d.title, sub: d.desc, mini: { imagen: d.img || null } }),
  },
  {
    id: 'preguntas', grupo: 'web', nombre: 'Preguntas', uno: 'pregunta', genero: 'f', icono: FiHelpCircle, vista: 'coleccion',
    fuente: 'contenido', roles: ['admin'], donde: '/#faq',
    descripcion: 'Las preguntas frecuentes de la página de inicio.',
    campos: [
      { k: 'q', t: 'Pregunta', tipo: 'texto', req: true, max: 200, ejemplo: '¿Cuánto tarda una app?' },
      { k: 'a', t: 'Respuesta', tipo: 'largo', req: true, max: 1200, filas: 5 },
    ],
    fila: (d) => ({ titulo: d.q, sub: d.a }),
  },
  {
    id: 'cifras', grupo: 'web', nombre: 'Cifras', uno: 'cifra', genero: 'f', icono: FiBarChart2, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/',
    descripcion: 'Los números de la portada de la página de inicio (30+ proyectos entregados…). Lo ideal son cuatro.',
    campos: [
      { k: 'n', t: 'Número', tipo: 'numero', req: true, min: 0, max: 1000000, paso: 1, ancho: 'medio' },
      { k: 'suffix', t: 'Lo que va pegado', tipo: 'texto', max: 3, ejemplo: '+', ancho: 'medio', ayuda: '+, % o nada.' },
      { k: 'label', t: 'Texto', tipo: 'largo', req: true, max: 60, filas: 2, ejemplo: 'proyectos\nentregados',
        ayuda: 'Con Enter lo partes en dos líneas.' },
    ],
    fila: (d) => ({ titulo: `${d.n ?? ''}${d.suffix ?? ''}`, sub: (d.label ?? '').replace(/\n/g, ' ') }),
  },
  {
    id: 'palabras', grupo: 'web', nombre: 'Cinta', uno: 'palabra', genero: 'f', icono: FiType, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/',
    descripcion: 'Las palabras que corren en la cinta debajo de la portada de la página de inicio.',
    campos: [{ k: 'texto', t: 'Palabra o frase', tipo: 'texto', req: true, max: 40, ejemplo: 'Apps móviles' }],
    fila: (d) => ({ titulo: d.texto }),
  },
  {
    id: 'pilares', grupo: 'web', nombre: 'Por qué nosotros', uno: 'pilar', icono: FiAward, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/#about',
    descripcion: 'Los tres puntos de «Nosotros» en la página de inicio.',
    campos: [
      { k: 'title', t: 'Título', tipo: 'texto', req: true, max: 60 },
      { k: 'desc', t: 'Texto', tipo: 'largo', req: true, max: 300, filas: 3 },
    ],
    fila: (d) => ({ titulo: d.title, sub: d.desc }),
  },
  {
    id: 'pasos', grupo: 'web', nombre: 'Cómo trabajamos', uno: 'paso', icono: FiTrendingUp, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/#process',
    descripcion: 'Los pasos del proceso en la página de inicio, en orden.',
    campos: [
      { k: 'title', t: 'Título', tipo: 'texto', req: true, max: 60 },
      { k: 'desc', t: 'Texto', tipo: 'largo', req: true, max: 300, filas: 3 },
    ],
    fila: (d) => ({ titulo: d.title, sub: d.desc }),
  },

  // ── Ventas ──
  {
    id: 'leads', grupo: 'ventas', nombre: 'Leads', icono: FiInbox, vista: 'leads', roles: ['admin', 'ventas'],
  },
  {
    id: 'catalogo', grupo: 'ventas', nombre: 'Catálogo', uno: 'producto', icono: FiTag, vista: 'coleccion', fuente: 'contenido',
    roles: ['admin'], donde: '/cotizador', arriba: 'tarifa', filtro: { k: 'cat', t: 'Categoría', opciones: CATEGORIAS },
    descripcion: 'Los productos y servicios del cotizador. El precio sale de las horas por la tarifa, más los extras.',
    campos: [
      { k: 'name', t: 'Nombre', tipo: 'texto', req: true, max: 80, ejemplo: 'Landing Page Premium' },
      { k: 'id', t: 'Código', tipo: 'codigo', req: true, desde: 'name', unico: true, ancho: 'medio', ayuda: 'Sin espacios. Sale solo del nombre.' },
      { k: 'cat', t: 'Categoría', tipo: 'opciones', req: true, opciones: CATEGORIAS, ancho: 'medio' },
      { k: 'hours', t: 'Horas', tipo: 'numero', req: true, min: 0, max: 10000, paso: 0.5, ancho: 'medio' },
      { k: 'extras', t: 'Extras (USD)', tipo: 'numero', min: 0, max: 1000000, paso: 1, ancho: 'medio', inicial: 0, ayuda: 'Licencias, hosting… Se suma al precio.' },
      { k: 'tier', t: 'Complejidad', tipo: 'opciones', req: true, opciones: COMPLEJIDAD, ancho: 'medio', inicial: 'M' },
      { k: 'icon', t: 'Ícono', tipo: 'texto', max: 4, ancho: 'medio', ayuda: 'Un emoji. Opcional.' },
      { k: 'purpose', t: 'Para qué sirve', tipo: 'largo', req: true, max: 400, filas: 3 },
      { k: 'benefits', t: 'Beneficios', tipo: 'lista', max: 80 },
      { k: 'stack', t: 'Tecnologías', tipo: 'lista', max: 40, ejemplo: 'React' },
      { k: 'factura', t: 'Texto para la factura', tipo: 'largo', max: 300, filas: 2 },
    ],
    fila: (d, { tarifa } = {}) => ({
      titulo: d.name, sub: linea(nombreCategoria(d.cat), `${d.hours ?? 0} h`, d.tier && TIERS[d.tier]?.label),
      mini: { texto: d.icon || '' }, extra: tarifa ? usd((Number(d.hours) || 0) * tarifa + (Number(d.extras) || 0)) : '',
    }),
  },
  { id: 'cotizador', grupo: 'ventas', nombre: 'Cotizador', icono: FiFileText, vista: 'enlace', ruta: '/cotizador', roles: ['admin', 'ventas'] },

  // ── Equipo ──
  { id: 'equipo', grupo: 'equipo', nombre: 'Usuarios', icono: FiUsers, vista: 'equipo', roles: ['admin'] },
  { id: 'r4', grupo: 'equipo', nombre: 'Cuentas R4', icono: FiCreditCard, vista: 'enlace', ruta: '/r4apertura', roles: ['admin', 'ventas', 'lectura'] },
];

export const seccionDe = (id) => SECCIONES.find((s) => s.id === id);

// los roles de public.perfiles, con lo que ve cada uno
export const ROLES = {
  admin: { t: 'Administrador', d: 'Todo: la web, el portafolio, los leads, el catálogo, el cotizador, R4 y los usuarios.' },
  ventas: { t: 'Ventas', d: 'Los leads, el cotizador con la guía de ventas y R4 para mirar.' },
  lectura: { t: 'Solo lectura', d: 'Mira las cuentas R4. Nada más.' },
};

// «Nuevo video», «Nueva app»
export const nuevoNombre = (s) => `${s.genero === 'f' ? 'Nueva' : 'Nuevo'} ${s.uno}`;
