/* scripts/generate-sitemap.js */
import { SitemapStream, streamToPromise } from 'sitemap';
import { promises as fs } from 'fs';
import { resolve } from 'path';

const hostname = 'https://webbonding.onrender.com';
const routes   = ['/', '/servicios', '/blog', '/contacto']; // añade las que vayas creando

(async () => {
  try {
    // 1) Crea el stream legible que construye el XML
    const sitemapStream = new SitemapStream({ hostname });

    // 2) Añade cada URL
    routes.forEach((url) =>
      sitemapStream.write({
        url,
        changefreq: 'monthly',
        priority: url === '/' ? 1 : 0.7,
      })
    );
    sitemapStream.end();

    // 3) Convierte a string usando el stream legible (¡no el de escritura!)
    const xmlBuffer = await streamToPromise(sitemapStream);

    // 4) Escribe el resultado en dist/sitemap.xml
    await fs.writeFile(resolve('dist', 'sitemap.xml'), xmlBuffer.toString());
    console.log('✅  Sitemap generado correctamente');
  } catch (err) {
    console.error('❌  Error generando sitemap:', err);
    process.exit(1);
  }
})();
