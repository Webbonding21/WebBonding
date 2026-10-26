// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import Home from './pages/Home';
import Cotizador from './pages/Cotizador';
import CotizadorGate from './components/CotizadorGate';
import R4Apertura from './pages/R4Apertura';
import CreaTuApp from './pages/CreaTuApp';

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
  // /r4apertura es una herramienta interna: se muestra sola, sin las capas del sitio.
  const herramienta = pathname.startsWith('/r4apertura');
  // /crea-tu-app es la landing de anuncios: sin el menú ni el pie del sitio (lleva su propio encabezado y contacto)
  const landing = pathname.startsWith('/crea-tu-app');

  return (
    <div className="App">
      {!herramienta && !landing && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cotizador" element={<CotizadorGate><Cotizador /></CotizadorGate>} />
        <Route path="/r4apertura" element={<R4Apertura />} />
        <Route path="/crea-tu-app" element={<CreaTuApp />} />
      </Routes>
      {!herramienta && (
        <>
          {!landing && <Footer />}
          <FloatingWhatsAppButton />
        </>
      )}
    </div>
  );
}

export default App;
