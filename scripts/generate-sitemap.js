/* scripts/generate-sitemap.js
 * Sitemap dinámico de Web Bonding — solo páginas públicas.
 * /cotizador es privado (gate de password) → NO se incluye.
 */
import { SitemapStream, streamToPromise } from 'sitemap';
import { promises as fs } from 'fs';
import { resolve } from 'path';

const hostname = 'https://webbonding-sasj.onrender.com';
const today = new Date().toISOString().split('T')[0];

const routes = [
  { url: '/',          changefreq: 'weekly',  priority: 1.0, lastmod: today },
  { url: '/#about',    changefreq: 'monthly', priority: 0.8, lastmod: today },
  { url: '/#services', changefreq: 'monthly', priority: 0.9, lastmod: today },
  { url: '/#work',     changefreq: 'monthly', priority: 0.9, lastmod: today },
  { url: '/#process',  changefreq: 'monthly', priority: 0.6, lastmod: today },
  { url: '/#plans',    changefreq: 'monthly', priority: 0.8, lastmod: today },
  { url: '/#contact',  changefreq: 'monthly', priority: 0.9, lastmod: today },
];

(async () => {
  try {
    const sitemapStream = new SitemapStream({ hostname, xmlns: { news: false, xhtml: true, image: false, video: false } });

    routes.forEach((route) => {
      sitemapStream.write({
        url: route.url,
        changefreq: route.changefreq,
        priority: route.priority,
        lastmod: route.lastmod,
        links: [
          { lang: 'es-VE', url: `${hostname}${route.url}` },
          { lang: 'x-default', url: `${hostname}${route.url}` },
        ],
      });
    });

    sitemapStream.end();
    const xmlBuffer = await streamToPromise(sitemapStream);

    await fs.writeFile(resolve('dist', 'sitemap.xml'), xmlBuffer.toString());
    console.log('✅ Sitemap generado correctamente');
  } catch (err) {
    console.error('❌ Error generando sitemap:', err);
    process.exit(1);
  }
})();
