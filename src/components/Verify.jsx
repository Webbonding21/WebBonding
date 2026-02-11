import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaCheckCircle, FaTimesCircle, FaCertificate, FaUser, FaIdCard, FaCalendarAlt } from 'react-icons/fa';
import '../assets/Verify.css';

const Verify = () => {
  const { studentId } = useParams(); // Obtenemos el ID de la URL
  const [verificationData, setVerificationData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'valid', 'invalid'

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        if (!studentId) throw new Error("No ID provided");

        // Buscamos el registro en Supabase
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single();

        if (error || !data) {
          setStatus('invalid');
        } else {
          setVerificationData(data);
          setStatus('valid');
        }
      } catch (err) {
        console.error(err);
        setStatus('invalid');
      }
    };

    verifyCertificate();
  }, [studentId]);

  // Renderizado de carga
  if (status === 'loading') {
    return (
      <div className="verify-container">
        <div className="verify-loader">
          <div className="spinner"></div>
          <p>Verificando autenticidad...</p>
        </div>
      </div>
    );
  }

  // Renderizado de Certificado NO VÁLIDO
  if (status === 'invalid') {
    return (
      <div className="verify-container">
        <div className="verify-card error">
          <FaTimesCircle className="icon-status error-icon" />
          <h1>Certificado No Encontrado</h1>
          <p className="verify-message">
            El código de verificación proporcionado no coincide con ningún registro en nuestra base de datos académica.
          </p>
          <div className="verify-footer">
            <p>Web Bonding Verifier System</p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado de Certificado VÁLIDO
  return (
    <div className="verify-container">
      <div className="verify-card success">
        <div className="brand-header">
           {/* Asegúrate de tener el logo en public/logoennegro.png */}
          <img src="/logoennegro.png" alt="Web Bonding" className="verify-logo" />
        </div>

        <div className="status-badge">
          <FaCheckCircle className="icon-status success-icon" />
          <h2>Certificado Auténtico</h2>
        </div>

        <div className="verify-details">
          <div className="detail-item">
            <FaUser className="detail-icon" />
            <div>
              <label>Estudiante</label>
              <p>{verificationData.full_name}</p>
            </div>
          </div>

          <div className="detail-item">
            <FaIdCard className="detail-icon" />
            <div>
              <label>Documento de Identidad</label>
              <p>{verificationData.cedula}</p>
            </div>
          </div>

          <div className="detail-item">
            <FaCertificate className="detail-icon" />
            <div>
              <label>Programa Aprobado</label>
              <p className="course-highlight">{verificationData.course_name}</p>
            </div>
          </div>

          <div className="detail-item">
            <FaCalendarAlt className="detail-icon" />
            <div>
              <label>Fecha de Emisión</label>
              <p>
                {new Date(verificationData.cohort_date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="verify-footer">
          <p>ID: {verificationData.id}</p>
          <small>Validado por Web Bonding, C.A.</small>
        </div>
      </div>
    </div>
  );
};

export default Verify;