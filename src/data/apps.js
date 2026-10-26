// src/data/apps.js
// Catálogo de «Nuestras apps» de /crea-tu-app: capturas reales en public/img/apps/<slug>/.
// formato: 'movil' (390 × 844) o 'web' (1440 × 900). descarga: enlace público solo si existe de verdad; si no, null.
const APPS = [
  {
    slug: 'riko',
    nombre: 'Riko',
    tipo: 'App de delivery',
    descripcion: 'Comida a domicilio: app del cliente, panel de restaurantes y app de repartidores, con pagos y seguimiento en vivo.',
    formato: 'movil',
    capturas: [],
    descarga: null,
  },
  {
    slug: 'llegate',
    nombre: 'Llegate',
    tipo: 'App de transporte',
    descripcion: 'Transporte urbano para Venezuela: app de pasajero y de conductor con mapa y despacho en tiempo real.',
    formato: 'movil',
    capturas: [],
    descarga: null,
  },
];

export default APPS;
