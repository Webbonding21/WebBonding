import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';
import '../assets/CoursePage.css';
import { FaClock, FaCalendarAlt, FaCheckCircle, FaArrowLeft, FaWhatsapp, FaShareAlt } from 'react-icons/fa';

const CoursePage = () => {
  const { id } = useParams(); // Captura el ID de la URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single(); // .single() devuelve un objeto, no un array

        if (error) throw error;
        setCourse(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // Función para compartir nativamente (móviles)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: `Mira este curso de Web Bonding: ${course.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error compartiendo', error);
      }
    } else {
      alert('Copia este link: ' + window.location.href);
    }
  };

  if (loading) return <div className="course-loading"><div className="spinner"></div></div>;
  if (!course) return <div className="course-error">Curso no encontrado</div>;

  // Fecha formateada
  const formattedDate = new Date(course.start_date).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', timeZone: 'UTC'
  });

  return (
    <>
      {/* --- META TAGS PARA WHATSAPP / SEO --- */}
      <Helmet>
        <title>{course.title} | Web Bonding</title>
        <meta name="description" content={course.description} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={course.title} />
        <meta property="og:description" content={course.description} />
        <meta property="og:image" content={course.image_url} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={course.title} />
        <meta name="twitter:description" content={course.description} />
        <meta name="twitter:image" content={course.image_url} />
      </Helmet>

      <div className="course-detail-container">
        
        {/* Botón Volver */}
        <Link to="/courses" className="back-link">
          <FaArrowLeft /> Volver a Cursos
        </Link>

        {/* --- HERO SECTION --- */}
        <div className="course-hero">
          <div className="hero-bg" style={{ backgroundImage: `url(${course.image_url})` }}></div>
          <div className="hero-overlay"></div>
          
          <div className="hero-content">
            <span className="course-badge-detail">Formación Profesional</span>
            <h1 className="detail-title">{course.title}</h1>
            <p className="detail-subtitle">{course.description}</p>
            
            <div className="hero-meta">
              <span><FaCalendarAlt /> Inicia: {formattedDate}</span>
              <span><FaClock /> Duración: {course.duration}</span>
            </div>
          </div>
        </div>

        {/* --- CONTENIDO PRINCIPAL (Grid 2 Columnas) --- */}
        <div className="detail-grid">
          
          {/* COLUMNA IZQUIERDA: Temario */}
          <div className="detail-left">
            <h2 className="section-heading">Lo que aprenderás</h2>
            <div className="syllabus-box">
              <ul className="syllabus-list">
                {course.modules && course.modules.map((mod, i) => (
                  <li key={i}>
                    <FaCheckCircle className="check-icon-detail" />
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="share-section">
              <button onClick={handleShare} className="share-btn">
                <FaShareAlt /> Compartir con amigos
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: Tarjeta de Inscripción (Sticky) */}
          <div className="detail-right">
            <div className="enroll-card-sticky">
              <div className="price-header">
                <span className="label">Precio Total</span>
                <div className="price-number">
                  <span className="symbol">$</span>{course.price}
                </div>
              </div>
              
              <div className="reservation-badge">
                Reserva tu cupo hoy con solo <strong>${course.reservation_price}</strong>
              </div>

              <Link to="/registerstudents" className="btn-enroll-detail">
                Inscribirme Ahora
              </Link>

              <a 
                href={`https://wa.me/584121510662?text=Hola, quiero info sobre el curso ${course.title}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn-whatsapp-detail"
              >
                <FaWhatsapp /> Consultar al WhatsApp
              </a>

              <p className="guarantee-text">
                * Cupos limitados. Certificado digital incluido.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CoursePage;