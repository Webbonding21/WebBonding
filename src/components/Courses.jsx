import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../assets/Courses.css';
import { FaClock, FaCalendarAlt, FaCheckCircle, FaArrowRight, FaTag } from 'react-icons/fa';

// --- SUB-COMPONENTE: Tarjeta con Efecto Tilt ---
const CourseCard = ({ course }) => {
  const cardRef = useRef(null);

  // Función que calcula la inclinación al mover el mouse
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Posición X dentro de la tarjeta
    const y = e.clientY - rect.top;  // Posición Y dentro de la tarjeta

    // Calculamos el centro
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculamos la rotación (Max 15 grados)
    // Si el mouse está a la derecha, rotamos Y positivo.
    // Si el mouse está abajo, rotamos X negativo (para que se incline hacia atrás).
    const rotateX = ((y - centerY) / centerY) * -2; 
    const rotateY = ((x - centerX) / centerX) * 2;

    // Aplicamos la transformación directamente al estilo para mayor rendimiento
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  // Función para resetear la tarjeta cuando el mouse sale
  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    
    // Vuelve a la posición original suavemente
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  return (
    <article 
      ref={cardRef}
      className="course-card-horizontal tilt-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* IZQUIERDA: Imagen */}
      <div className="hz-image-wrapper">
        <img 
          src={course.image_url || 'https://via.placeholder.com/400x250'} 
          alt={course.title} 
        />
      </div>

      {/* DERECHA: Contenido */}
      <div className="hz-card-body">
        
        <div className="card-header-flex">
            <h3 className="hz-card-title">{course.title}</h3>
            <div className="hz-price-badge">
              <span className="price-symbol">$</span>{course.price}
            </div>
        </div>

        <div className="meta-info">
          <span className="meta-item">
            <FaCalendarAlt className="meta-icon" /> 
            {new Date(course.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' })}
          </span>
          <span className="meta-item">
            <FaClock className="meta-icon" /> {course.duration}
          </span>
        </div>

        <p className="card-desc">{course.description}</p>

        <div className="hz-card-footer">
          <div className="reservation-note">
            <FaTag className="tag-icon"/> Reserva con ${course.reservation_price}
          </div>
          <Link to={`/curso/${course.id}`} className="btn-enroll hz-btn">
            Ver Detalles <FaArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('active', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setCourses(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="courses-loading">
        <div className="spinner"></div>
        <p>Cargando oferta académica...</p>
      </div>
    );
  }

  return (
    <section className="courses-section">
      <div className="glow-spot spot-1"></div>
      <div className="glow-spot spot-2"></div>

      <div className="courses-container">
        <div className="courses-header-text">
          <span className="badge-pill">Formación Premium</span>
          <h2 className="courses-title">Domina el <span className="text-gradient">Futuro</span></h2>
          <p className="courses-subtitle">
            Cursos intensivos diseñados para potenciar tu carrera y negocio <br/>
            con herramientas de Inteligencia Artificial reales.
          </p>
        </div>

        <div className="courses-list">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;