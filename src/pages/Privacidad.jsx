// src/pages/Privacidad.jsx
// Política de privacidad y cookies. Si cambia algo de fondo, se cambia también VERSION_POLITICA en lib/privacidad.js:
// así la fecha de aquí, la versión que guarda cada lead y el aviso de cookies van juntos.
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { VERSION_POLITICA, abrirAvisoCookies } from '../lib/privacidad';
import '../assets/Privacidad.css';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const [ANO, MES, DIA] = VERSION_POLITICA.split('-').map(Number);
const FECHA = `${DIA} de ${MESES[MES - 1]} de ${ANO}`;

const CORREO = 'webbonding21@gmail.com';
const WHATSAPP = '+58 422 057 9731';

function Privacidad() {
  return (
    <>
      <Helmet>
        <html lang="es-VE" />
        <title>Política de privacidad y cookies | Web Bonding</title>
        <meta name="description" content="Qué datos guarda Web Bonding cuando nos escribes, para qué los usa, cuánto tiempo los guarda y cómo puedes pedir verlos o borrarlos." />
        <link rel="canonical" href="https://webbonding.net/privacidad" />
      </Helmet>

      <header className="priv-top wb-grain">
        <div className="wb-container priv__in">
          <span className="wb-eyebrow">Tus datos</span>
          <h1 className="priv-top__t">Política de privacidad y cookies</h1>
          <p className="priv-top__p">
            Cuando nos escribes por el formulario nos confías tus datos. Aquí te contamos qué guardamos, para qué, y cómo
            puedes pedirnos verlos o borrarlos.
          </p>
          <p className="priv-top__fecha">Última actualización: {FECHA}</p>
        </div>
      </header>

      <main className="priv wb-section--paper">
        <div className="wb-container priv__in">
          <h2>Quién es responsable</h2>
          <p>
            Web Bonding, C.A. (RIF J-50804362-6), en Acarigua–Araure, estado Portuguesa, Venezuela. Para cualquier tema de
            tus datos, escríbenos a <a href={`mailto:${CORREO}`}>{CORREO}</a> o al WhatsApp {WHATSAPP}.
          </p>

          <h2>Qué datos guardamos</h2>
          <p>Los que escribes en el formulario de la página «Crea la app de tu negocio»:</p>
          <ul>
            <li>lo que quieres construir;</li>
            <li>tu nombre;</li>
            <li>tu teléfono (WhatsApp);</li>
            <li>tu correo;</li>
            <li>lo que nos cuentes de tu proyecto, si lo escribes.</li>
          </ul>
          <p>
            Junto con eso guardamos la fecha, que aceptaste esta política y en qué versión, si quieres recibir novedades y,
            si llegaste desde un anuncio, el nombre de la campaña que trae el enlace. No pedimos documentos, datos
            bancarios ni contraseñas.
          </p>

          <h2>Para qué los usamos</h2>
          <ul>
            <li>Para escribirte sobre tu proyecto por WhatsApp o por correo, mandarte la propuesta y darle seguimiento.</li>
            <li>Si marcaste la casilla de novedades, para enviarte ofertas y novedades de Web Bonding. Nos puedes pedir que paremos cuando quieras.</li>
            <li>Para saber desde qué anuncio nos llegaste.</li>
          </ul>
          <p>No vendemos, alquilamos ni regalamos tus datos, y no los usamos para nada distinto de esto.</p>

          <h2>Con qué permiso</h2>
          <p>
            Con tu consentimiento, que nos das al marcar la casilla antes de enviar el formulario: sin esa casilla el
            formulario no se envía. Puedes retirarlo cuando quieras.
          </p>

          <h2>Dónde se guardan y quién los ve</h2>
          <p>
            En una base de datos de Supabase, con servidores en Estados Unidos. Está cerrada: desde el sitio solo se pueden
            enviar datos, no leerlos, y solo el equipo de Web Bonding tiene acceso.
          </p>
          <p>
            Al enviar el formulario también se abre WhatsApp con tu mensaje. Si lo envías, esa conversación queda en
            WhatsApp, que es de Meta y tiene su propia política de privacidad.
          </p>

          <h2>Cuánto tiempo los guardamos</h2>
          <p>
            Mientras estemos conversando sobre tu proyecto o seas cliente. Si no seguimos, los borramos a más tardar dos
            años después del último contacto. Si nos pides borrarlos antes, los borramos.
          </p>

          <h2>Tus derechos</h2>
          <p>Cuando quieras, puedes pedirnos:</p>
          <ul>
            <li>ver qué datos tuyos tenemos;</li>
            <li>corregirlos;</li>
            <li>borrarlos;</li>
            <li>que dejemos de escribirte.</li>
          </ul>
          <p>
            Escríbenos a <a href={`mailto:${CORREO}`}>{CORREO}</a> o al WhatsApp {WHATSAPP} y te respondemos en menos de
            15 días. Va en línea con el artículo 28 de la Constitución de Venezuela, que te reconoce el derecho a saber qué
            datos tuyos están registrados y para qué se usan.
          </p>

          <h2>Cookies y almacenamiento del navegador</h2>
          <ul>
            <li>
              <b>Necesarias, siempre activas.</b> Guardan tu elección sobre el aviso de cookies y, en las herramientas
              internas del equipo, la sesión iniciada o el trabajo en curso. No sirven para seguirte ni para publicidad.
            </li>
            <li>
              <b>De medición y publicidad, solo si aceptas.</b> Hoy el sitio no usa ninguna. Si más adelante agregamos
              alguna, como Google Analytics o el píxel de Meta, solo se activará si aceptaste, y la nombraremos aquí.
            </li>
            <li>
              Las letras del sitio se cargan desde Google Fonts: tu navegador se conecta con los servidores de Google para
              descargarlas, sin cookies.
            </li>
          </ul>
          <button type="button" className="priv__btn" onClick={abrirAvisoCookies}>Cambiar mi elección de cookies</button>

          <h2>Menores de edad</h2>
          <p>El formulario es para dueños de negocios y emprendedores. No está pensado para menores de 18 años.</p>

          <h2>Cambios</h2>
          <p>
            Si cambiamos esta política, actualizamos la fecha de arriba. Si el cambio es de fondo, te volveremos a preguntar
            por las cookies y, en el formulario, por tu aceptación.
          </p>
        </div>
      </main>
    </>
  );
}

export default Privacidad;
