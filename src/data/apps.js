// src/data/apps.js
// Catálogo de «Nuestras apps» de /crea-tu-app: capturas reales en public/img/apps/<slug>/.
// Las capturas salen de marketing/apps-capturas/ con exportar_web.py: si cambia una aquí, cambia también allá.
// formato de cada captura: 'movil' (teléfono) o 'web' (computadora). chip: nombre corto para el selector.
// enlaces: solo los públicos y comprobados (tipo 'descarga' para las tiendas, 'web' para un sitio).
// No van FV Bodegones ni SIGEPP (lo pidió Williams).
const cap = (slug, archivo, t, formato = 'movil') => ({ src: `/img/apps/${slug}/${archivo}.webp`, t, formato });

const APPS = [
  {
    slug: 'riko',
    nombre: 'Riko',
    tipo: 'App de delivery',
    descripcion: 'Pides comida, mercado o farmacia en Acarigua–Araure y te llega a la puerta. Trae también la app de los comercios, con punto de venta e inventario, la del repartidor y el panel de administración.',
    capturas: [
      cap('riko', '01-inicio', 'Inicio'),
      cap('riko', '02-comercios', 'Comercios abiertos'),
      cap('riko', '03-comercio-menu', 'Menú de un comercio'),
      cap('riko', '04-producto', 'Producto'),
      cap('riko', '05-mapa', 'Comercios cerca'),
      cap('riko', '06-login-escritorio', 'App de los comercios', 'web'),
    ],
    enlaces: [
      { texto: 'Pedir en rikoapp.com', url: 'https://www.rikoapp.com/', tipo: 'web' },
      { texto: 'Riko Comercios en Google Play', url: 'https://play.google.com/store/apps/details?id=com.rikoapprest.com', tipo: 'descarga' },
    ],
  },
  {
    slug: 'kakareo',
    nombre: 'Kakareo',
    tipo: 'App para granjas avícolas',
    descripcion: 'La granja en el teléfono: lotes, producción de huevos, alimento, vacunas, ventas y finanzas, con el registro del día y reportes.',
    capturas: [
      cap('kakareo', '01-inicio', 'Inicio de la granja'),
      cap('kakareo', '02-registro-diario', 'Registro del día'),
      cap('kakareo', '03-produccion', 'Producción de huevos'),
      cap('kakareo', '04-sanidad', 'Calendario de vacunas'),
      cap('kakareo', '05-finanzas', 'Finanzas'),
      cap('kakareo', '06-escritorio-inicio', 'En la computadora', 'web'),
    ],
  },
  {
    slug: 'mi-angel',
    nombre: 'Mi Ángel App',
    chip: 'Mi Ángel',
    tipo: 'App escolar y de cantina',
    descripcion: 'El representante ve el saldo y las compras de su hijo en la cantina, pone límites, recarga y lleva el carnet en el teléfono. El colegio cobra y cuadra la caja desde su panel.',
    capturas: [
      cap('mi-angel', '01-inicio', 'Saldo del hijo'),
      cap('mi-angel', '02-control-de-consumo', 'Límites de consumo'),
      cap('mi-angel', '03-carnet', 'Carnet digital'),
      cap('mi-angel', '04-recargar', 'Recargar saldo'),
      cap('mi-angel', '05-login', 'Panel del colegio', 'web'),
    ],
  },
  {
    slug: 'cantera',
    nombre: 'Cantera',
    tipo: 'Plataforma para academias deportivas',
    descripcion: 'Para academias de fútbol y vóleibol: jugadores, representantes, mensualidades cobradas por Débito Inmediato y torneos con marcador en vivo.',
    capturas: [
      cap('cantera', '01-inicio-movil', 'Inicio'),
      cap('cantera', '02-torneo-en-vivo', 'Torneo en vivo'),
      cap('cantera', '03-tabla-de-posiciones', 'Tabla de posiciones'),
      cap('cantera', '04-inicio-web', 'En la computadora', 'web'),
      cap('cantera', '05-crear-academia', 'Crear tu academia', 'web'),
    ],
    enlaces: [{ texto: 'Visitar canteravzla.com', url: 'https://canteravzla.com/', tipo: 'web' }],
  },
  {
    slug: 'nobu-fit',
    nombre: 'Nobu Fit',
    tipo: 'App de entrenamiento',
    descripcion: 'Rutinas a tu medida, progreso, comunidad y una tienda con recompensas. Los entrenadores llevan a sus alumnos y las tiendas venden desde su propio portal.',
    capturas: [
      cap('nobu-fit', '01-rutinas-personalizadas', 'Rutinas a tu medida'),
      cap('nobu-fit', '02-tienda-y-recompensas', 'Tienda y recompensas'),
      cap('nobu-fit', '03-elige-tu-perfil', 'Entrenar o entrenador'),
      cap('nobu-fit', '04-login', 'Entrar'),
      cap('nobu-fit', '05-registro-de-tienda', 'Portal de las tiendas', 'web'),
    ],
    enlaces: [
      { texto: 'Google Play', url: 'https://play.google.com/store/apps/details?id=app.nobufit', tipo: 'descarga' },
      { texto: 'App Store', url: 'https://apps.apple.com/app/id6784727820', tipo: 'descarga' },
    ],
  },
  {
    slug: 'farmacia-libertad',
    nombre: 'Farmacia Libertad',
    chip: 'Farmacia',
    tipo: 'Tienda en línea de farmacia',
    descripcion: 'Más de 2.300 productos con precio en dólares y bolívares, carrito y pago por Pago Móvil o Débito Inmediato. Por dentro: punto de venta, inventario por lote y caja.',
    capturas: [
      cap('farmacia-libertad', '01-inicio', 'Inicio'),
      cap('farmacia-libertad', '02-catalogo', 'Catálogo'),
      cap('farmacia-libertad', '03-producto', 'Producto en $ y Bs'),
      cap('farmacia-libertad', '04-carrito', 'Carrito'),
      cap('farmacia-libertad', '05-escritorio-tienda', 'En la computadora', 'web'),
    ],
  },
  {
    slug: 'llegate',
    nombre: 'Llegate',
    tipo: 'App de transporte',
    descripcion: 'Pides un viaje en moto o carro, lo sigues en vivo y pagas en dólares o bolívares. El conductor tiene su propia app y la operación se lleva desde un panel.',
    capturas: [
      cap('llegate', '01-elige-como-usar', 'Pasajero o conductor'),
      cap('llegate', '02-gana-con-tu-vehiculo', 'App del conductor'),
      cap('llegate', '03-pagos', 'Pagos al conductor'),
      cap('llegate', '04-llegate-pasajero-login', 'Entrar'),
      cap('llegate', '05-llegate-admin-login', 'Panel de operación', 'web'),
    ],
    enlaces: [{ texto: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.llegate.app', tipo: 'descarga' }],
  },
  {
    slug: 'hot-dog-tony',
    nombre: 'Hot Dog Tony',
    tipo: 'Web y sistema para restaurante',
    descripcion: 'Menú, reservas con abono y contacto para los clientes. El personal entra a su sistema de caja, cocina, inventario y nómina.',
    capturas: [
      cap('hot-dog-tony', '01-inicio', 'Inicio'),
      cap('hot-dog-tony', '02-reservar-mesa', 'Reservar mesa'),
      cap('hot-dog-tony', '03-contacto', 'Contacto'),
      cap('hot-dog-tony', '04-escritorio-inicio', 'En la computadora', 'web'),
      cap('hot-dog-tony', '05-escritorio-acceso-del-personal', 'Sistema del personal', 'web'),
    ],
  },
  {
    slug: 'formatos-bfc',
    nombre: 'Formatos BFC',
    tipo: 'App de control de calidad',
    descripcion: 'Los formatos de calidad del silo, llenados paso a paso en el teléfono: clasifica el maíz mientras se escribe, deja auditar el día y arma los reportes.',
    capturas: [
      cap('formatos-bfc', '01-inicio', 'Menú'),
      cap('formatos-bfc', '02-registrar', 'Formatos'),
      cap('formatos-bfc', '03-resumen', 'Resumen del día'),
      cap('formatos-bfc', '04-reportes', 'Reportes'),
      cap('formatos-bfc', '05-escritorio-reportes', 'En la computadora', 'web'),
    ],
  },
  {
    slug: 'brillarte',
    nombre: 'Brillarte',
    tipo: 'Tienda en línea',
    descripcion: 'Catálogo de bisutería artesanal con carrito y un panel para cargar productos y categorías.',
    capturas: [
      cap('brillarte', '01-inicio', 'Inicio'),
      cap('brillarte', '02-nosotros', 'Nosotros'),
      cap('brillarte', '03-acceso-admin', 'Panel de la tienda'),
      cap('brillarte', '04-escritorio-inicio', 'En la computadora', 'web'),
    ],
    enlaces: [{ texto: 'Ver la tienda', url: 'https://brillartecatalogo.onrender.com/', tipo: 'web' }],
  },
  {
    slug: 'que-comprar',
    nombre: 'Qué Comprar en Portuguesa',
    chip: 'Qué Comprar',
    tipo: 'Directorio y mercado local',
    descripcion: 'Los vecinos publican lo que necesitan y los comercios de la zona les mandan precio. Los negocios pagan un plan para salir en el mapa.',
    capturas: [
      cap('que-comprar', '01-inicio', 'Inicio'),
      cap('que-comprar', '02-planes-para-comercios', 'Planes para comercios'),
      cap('que-comprar', '03-login', 'Entrar'),
    ],
  },
  {
    slug: 'sistemas',
    nombre: 'Sistemas administrativos',
    chip: 'Más sistemas',
    tipo: 'Sistemas a la medida',
    descripcion: 'Inventario y despacho, punto de venta con servicio técnico, consultorio médico e importación. Son privados: aquí se ve la entrada, porque adentro está la información de cada negocio.',
    capturas: [
      cap('sistemas', '01-michell-market-login', 'Michell Market: inventario y despacho', 'web'),
      cap('sistemas', '02-innovatech-login', 'InnovaTech: tienda y servicio técnico', 'web'),
      cap('sistemas', '03-wilmercrm-login', 'WilmerCRM: consultorio médico', 'web'),
      cap('sistemas', '04-global-import-login', 'Global Import: importación y ventas', 'web'),
    ],
  },
];

export default APPS;
