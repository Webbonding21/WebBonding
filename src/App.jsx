// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import Home from './pages/Home';
import Cotizador from './pages/Cotizador';
import CotizadorGate from './components/CotizadorGate';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cotizador" element={<CotizadorGate><Cotizador /></CotizadorGate>} />
        </Routes>
        <Footer />
        <FloatingWhatsAppButton />
      </div>
    </Router>
  );
}

export default App;
