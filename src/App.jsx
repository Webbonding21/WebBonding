// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes fijos
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';

// Páginas / Rutas
import Home from './pages/Home';
import RegisterStudents from './components/RegisterStudents'; // Asegúrate que la ruta sea correcta

import './App.css';
import Students from './components/Students';
import AdminCourses from './components/AdminCourses';
import Courses from './components/Courses';
import CoursePage from './components/CoursePage';
import AddCourse from './components/AddCourse';
import ContentCourse from './components/ContentCourse';
import Login from './components/Login';
import Certificado from './components/Certificado';
import Verify from './components/Verify';

function App() {
  return (
    <Router>
      <div className="App">
        {/* El Navbar aparece en todas las páginas */}
        <Navbar />
        
        {/* Aquí cambiamos el contenido según la URL */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registerstudents" element={<RegisterStudents />} />
          <Route path="/students" element={<Students />} />
          <Route path="/admincourses" element={<AdminCourses />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/curso/:id" element={<CoursePage />} />
          <Route path="/admin/add-course" element={<AddCourse />} />
          <Route path="/classroom/:courseId" element={<ContentCourse />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/certificate/:courseid" element={<Certificado />} /> 
          <Route path="/verify/:studentId" element={<Verify />} />
        </Routes>

        {/* El Footer y el botón de WhatsApp aparecen en todas las páginas */}
        <Footer />
        <FloatingWhatsAppButton />
      </div>
    </Router>
  );
}

export default App;