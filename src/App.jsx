// src/App.jsx
import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';
import Home from './pages/Home';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Home/>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}

export default App;
