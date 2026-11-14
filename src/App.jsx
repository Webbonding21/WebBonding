// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import AvisoCookies from './components/AvisoCookies';
import Home from './pages/Home';
import Cotizador from './pages/Cotizador';
import CotizadorGate from './components/CotizadorGate';
import R4Apertura from './pages/R4Apertura';
import CreaTuApp from './pages/CreaTuApp';
import Portafolio from './pages/Portafolio';
import Apps from './pages/Apps';
import Privacidad from './pages/Privacidad';
import Leads from './pages/Leads';
import Admin from './pages/Admin';
import Firmar from './pages/Firmar';

import './App.css';

function App() {
  return (
    <Router>
      <Contenido />
    </Router>
  );
}

function Contenido() {
  const { pathname } = useLocation();
  // /admin (el panel del equipo, con los leads en /admin/leads), /r4apertura, /leads (lleva al panel) y /firmar (la firma
  // electrónica de contratos) son herramientas:
  // se muestran solas, sin las capas del sitio.
  const herramienta = ['/admin', '/r4apertura', '/leads', '/firmar'].some((r) => pathname.startsWith(r));
  // /crea-tu-app (la landing de anuncios), /portafolio y /apps (el enlace de la bio) van sin el menú ni el pie del sitio:
  // llevan su propio encabezado y contacto
  const landing = ['/crea-tu-app', '/portafolio', '/apps'].some((r) => pathname.startsWith(r));

  return (
    <div className="App">
      {!herramienta && !landing && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cotizador" element={<CotizadorGate><Cotizador /></CotizadorGate>} />
        <Route path="/r4apertura" element={<R4Apertura />} />
        <Route path="/crea-tu-app" element={<CreaTuApp />} />
        <Route path="/portafolio" element={<Portafolio />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/leads" element={<Leads />} />
        {/* una sola ruta para todo el panel: al cambiar de sección no se vuelve a pedir la sesión */}
        <Route path="/admin/:seccion?" element={<Admin />} />
        <Route path="/firmar/:token?" element={<Firmar />} />
      </Routes>
      {!herramienta && (
        <>
          {!landing && <Footer />}
          <FloatingWhatsAppButton />
          <AvisoCookies />
        </>
      )}
    </div>
  );
}

export default App;
