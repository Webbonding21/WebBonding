import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// 1. Importamos la librería del QR
import QRCode from "react-qr-code";
import { FaDownload, FaCircle } from 'react-icons/fa';
import '../assets/Certificado.css';

const Certificado = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef();
  
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStudentInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (error || !data) {
          console.error("No se encontró el registro del estudiante.");
          return;
        }

        setStudentData(data);
      } catch (err) {
        console.error("Error cargando certificado:", err);
      } finally {
        setLoading(false);
      }
    };

    getStudentInfo();
  }, [navigate]);

const downloadPDF = () => {
    const input = certificateRef.current;
    
    // Opcional: Mostrar mensaje de carga o feedback visual aquí
    
    html2canvas(input, { 
      scale: 4, 
      useCORS: true,
      backgroundColor: '#ffffff',
      // Forzamos el ancho y alto para asegurar que aunque esté en móvil,
      // la "foto" se tome como si fuera una pantalla grande.
      windowWidth: 1600, 
      width: input.offsetWidth,
      height: input.offsetHeight,
      x: 0,
      y: 0
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); 
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificado_WebBonding_${studentData.full_name.replace(/\s+/g, '_')}.pdf`);
    });
  };

  if (loading) return <div className="cert-loader">Generando documento...</div>;
  if (!studentData) return <div className="cert-error">Registro no disponible.</div>;

  // URL de validación (Puedes cambiar esto por tu URL real de verificación en el futuro)
  // Usamos el ID del estudiante como dato clave.
  const validationUrl = `https://webbonding-sasj.onrender.com//verify/${studentData.id}`;

  return (
    <div className="cert-container">
      <div className="cert-top-bar">
        <p>Certificación Académica Exitosa</p>
        <button onClick={downloadPDF} className="cert-btn-main">
          <FaDownload /> Descargar PDF
        </button>
      </div>

      <div className="cert-canvas-wrapper">
        <div className="cert-modern-design" ref={certificateRef}>
          <div className="geo-accent-top"></div>
          
          <div className="cert-layout">
            <header className="cert-header-minimal">
              <div className="brand-info">
                <img src="/logoennegro.png" alt="WEB BONDING" className="cert-logo-minimal" />
                <h2>WEB BONDING, C.A.</h2>
              </div>
              <div className="cert-type-badge">CAPACITACIÓN PROFESIONAL</div>
            </header>

            {/* 2. Reestructuración del cuerpo en dos columnas */}
            <main className="cert-body-minimal flex-row">
              
              {/* Columna Izquierda: Texto */}
              <div className="cert-details-left">
                <div className="title-section">
                  <h1>Certificado de Aprobación</h1>
                  <div className="title-underline"></div>
                </div>

                <section className="student-info-minimal">
                  <p className="intro-text">Se certifica que el estudiante:</p>
                  <h3 className="student-name-main">{studentData.full_name}</h3>
                  <p className="student-id-sub">Cédula de Identidad: {studentData.cedula}</p>
                </section>

                <section className="course-info-minimal">
                  <p>Ha completado satisfactoriamente el programa de formación en:</p>
                  <h4 className="course-name-title">{studentData.course_name}</h4>
                  <div className="completion-status">
                     <span>Estado: Aprobado</span>
                     <FaCircle className="status-dot" />
                     <span>Fecha: {new Date(studentData.cohort_date).toLocaleDateString('es-ES', { 
                       day: 'numeric', month: 'long', year: 'numeric' 
                     })}</span>
                  </div>
                </section>
              </div>

              {/* Columna Derecha: Código QR */}
              <div className="cert-qr-right">
                <div className="qr-box">
                  <QRCode 
                    value={validationUrl} 
                    size={130}
                    bgColor={"#ffffff"}
                    fgColor={"#0f172a"} // Color azul oscuro de la marca
                    level={"H"} // Nivel alto de corrección de errores
                  />
                </div>
                <p className="qr-label">Escanee para verificar autenticidad</p>
              </div>
            </main>

            <footer className="cert-footer-minimal">
              <div className="directors-grid">
                <div className="director-info">
                  <p className="d-name">ANA EMILIANA CESAR PIÑA</p>
                  <p className="d-role">Directora Ejecutiva</p>
                  <p className="d-id">V-20.388.097</p>
                </div>

                <div className="director-info">
                  <p className="d-name">DIOSELY LISBETH CESAR PIÑA</p>
                  <p className="d-role">Directora de Operaciones</p>
                  <p className="d-id">V-15.691.368</p>
                </div>

                <div className="director-info">
                  <p className="d-name">WILLIAMS JESUS BRICEÑO CESAR</p>
                  <p className="d-role">Director de Tecnología</p>
                  <p className="d-id">V-31.491.968</p>
                </div>
              </div>

              <div className="legal-bottom">
                <p className="validation-id">VERIFICACIÓN: {studentData.id.split('-')[0].toUpperCase()}</p>
                <p className="location-stamp">Barquisimeto, Estado Lara, Venezuela</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificado;