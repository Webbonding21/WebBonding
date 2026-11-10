// src/data/abiertas.js
// Las apps de /apps, el enlace de la bio de Instagram (pedido de Williams del 10-nov-2026): las que cualquiera puede abrir
// ya desde el teléfono, cada una con el reel que la cuenta. Primero la serie «Haciendo una app por día»; después las que
// ya están en la calle, que salen del catálogo de /crea-tu-app (data/apps.js) con sus mismos enlaces y su primera captura.
// Acayork NO va hasta que esté publicada y tenga su reel (lo pidió Williams). Las capturas de la serie tienen su original
// en marketing/apps-capturas/<app>/ y van a 600 px de ancho, como las del catálogo.
// reel: el código de instagram.com/reel/<código>/ en @web.bonding.
import APPS from './apps';

export const SERIE = [
  {
    slug: 'revisalo',
    dia: 1,
    nombre: 'Revísalo',
    tipo: 'Para comprar un carro usado',
    linea: 'Te guía punto por punto al revisar un carro usado y te dice si te están pidiendo de más.',
    captura: '/img/apps/revisalo/01-inicio.webp',
    enlaces: [{ texto: 'Abrir la app', url: 'https://revisalo-app.onrender.com/', tipo: 'web' }],
    reel: 'DfUxMfRvkuR',
  },
  {
    slug: 'taquilla',
    dia: 2,
    nombre: 'Taquilla',
    tipo: 'Entradas para tu evento',
    linea: 'Vendes las entradas con un enlace, cobras en bolívares y en la puerta las validas con la cámara.',
    captura: '/img/apps/taquilla/01-evento.webp',
    enlaces: [{ texto: 'Abrir la app', url: 'https://taquilla-afz5.onrender.com/', tipo: 'web' }],
    reel: 'DfXb2i0JVxS',
  },
  {
    slug: 'ojo-al-hueco',
    dia: 3,
    nombre: 'Ojo al hueco',
    tipo: 'El mapa de los huecos',
    linea: 'Ves dónde están los huecos de la ciudad antes de caer en uno. Reportas con una foto y sin tu nombre.',
    captura: '/img/apps/ojo-al-hueco/01-mapa.webp',
    enlaces: [{ texto: 'Abrir la app', url: 'https://ojo-al-hueco.onrender.com/', tipo: 'web' }],
    reel: 'Dfi5k92N3i6',
  },
];

// del catálogo, solo las que tienen enlace público; la línea es más corta que su descripción de /crea-tu-app
const CALLE = [
  { slug: 'riko', linea: 'Pides comida, mercado o farmacia en Acarigua–Araure y te llega a la puerta.', reel: 'DZ5ZD3sAK6d' },
  { slug: 'cantera', linea: 'Para academias de fútbol y vóleibol: jugadores, mensualidades y torneos con marcador en vivo.' },
  { slug: 'nobu-fit', linea: 'Rutinas a tu medida, tu progreso y una tienda con recompensas.', reel: 'DfLZJolNyOa' },
  { slug: 'llegate', linea: 'Pides un viaje en moto o carro, lo sigues en vivo y pagas en dólares o bolívares.' },
  { slug: 'brillarte', linea: 'Catálogo de bisutería artesanal con carrito, y un panel para cargar los productos.' },
];

export const EN_LA_CALLE = CALLE.map(({ slug, ...resto }) => {
  const a = APPS.find((x) => x.slug === slug);
  return { slug, nombre: a.nombre, tipo: a.tipo, captura: a.capturas[0].src, enlaces: a.enlaces ?? [], ...resto };
}).filter((a) => a.enlaces.length > 0);

export const reel = (codigo) => `https://www.instagram.com/reel/${codigo}/`;
