const { defineConfig } = require('vite');
const react            = require('@vitejs/plugin-react');
const vitePrerender    = require('vite-plugin-prerender');
const path             = require('node:path');

module.exports = defineConfig(({ command }) => ({
  plugins: [
    react(),
    // solo en build, nunca en dev
    command === 'build' &&
      vitePrerender({
        staticDir: path.resolve(__dirname, 'dist'),
        routes: ['/', '/servicios', '/blog', '/contacto'],
      }),
  ].filter(Boolean),            // elimina "false" cuando estamos en dev
}));
