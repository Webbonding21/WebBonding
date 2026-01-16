import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/RegisterStudents.css';

const RegisterStudents = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    email: '',
    phone: '',
    course: 'IA de Bolsillo',
    paymentRef: ''
  });

  const [paymentFile, setPaymentFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, type: '', msg: '' });
  const [bcvRate, setBcvRate] = useState(null);

  useEffect(() => {
    const fetchBcvRate = async () => {
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const data = await response.json();
        if (data && data.promedio) {
          setBcvRate(data.promedio);
        }
      } catch (error) {
        console.error('Error obteniendo tasa BCV:', error);
      }
    };
    fetchBcvRate();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentFile(e.target.files[0]);
    }
  };

  const getCohortDate = (courseName) => {
    if (courseName === 'Excel & AI Masterclass') {
      return '2026-02-01'; 
    }
    return '2026-01-31'; 
  };

  const RESERVATION_AMOUNT = 5;
  const totalCoursePrice = formData.course === 'Excel & AI Masterclass' ? 25 : 15;
  const reservationBs = bcvRate ? (RESERVATION_AMOUNT * bcvRate).toFixed(2) : '...';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, type: '', msg: '' });

    if (!paymentFile) {
      setStatus({ 
        loading: false, 
        type: 'error', 
        msg: 'Por favor sube la captura de pantalla del pago.' 
      });
      return;
    }

    try {
      let imageUrl = null;

      // 1. Subir imagen
      const fileExt = paymentFile.name.split('.').pop();
      const fileName = `${Date.now()}_${formData.cedula}.${fileExt}`;
      const filePath = `Pagos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('WebBonding')
        .upload(filePath, paymentFile);

      if (uploadError) throw uploadError;

      // 2. Obtener URL
      const { data: { publicUrl } } = supabase.storage
        .from('WebBonding')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;

      // 3. Guardar datos
      const { error: insertError } = await supabase
        .from('students')
        .insert([
          {
            full_name: formData.fullName,
            cedula: formData.cedula,
            email: formData.email,
            phone: formData.phone,
            course_name: formData.course,
            cohort_date: getCohortDate(formData.course),
            payment_status: 'reservado',
            payment_ref: formData.paymentRef,
            pago_link: imageUrl
          }
        ]);

      if (insertError) throw insertError;

      setStatus({ 
        loading: false, 
        type: 'success', 
        msg: '¡Recibido! Hemos guardado tu comprobante y cupo.' 
      });
      
      setFormData({ 
        fullName: '', cedula: '', email: '', phone: '', 
        course: 'IA de Bolsillo', paymentRef: '' 
      });
      setPaymentFile(null);

    } catch (error) {
      console.error('Error:', error.message);
      setStatus({ 
        loading: false, 
        type: 'error', 
        msg: 'Error al subir el pago. Intenta de nuevo o contáctanos.' 
      });
    }
  };

  return (
    <section className="register-section">
      <div className="glow-effect glow-left"></div>
      <div className="glow-effect glow-right"></div>

      <div className="register-container">
        
        <div className="register-header">
          <span className="hero-badge">Inscripciones Abiertas</span>
          <h2 className="section-title">
            Reserva tu <span className="highlight">Futuro</span>
          </h2>
          <p className="about-lead">
            Asegura tu cupo hoy con solo <strong>${RESERVATION_AMOUNT}</strong>.
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="register-form">
            
            {/* --- DATOS PERSONALES --- */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Nombre Completo</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Ej: Juan Pérez"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cedula">Cédula (V/E)</label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  placeholder="Ej: V-12345678"
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">WhatsApp</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="0412-1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="course">Formación de Interés</label>
              <div className="select-wrapper">
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="form-input form-select"
                >
                  <option value="IA de Bolsillo">IA de Bolsillo (31 Enero) - Total ${15}</option>
                  <option value="Excel & AI Masterclass">Excel & AI Automation (1 Feb) - Total ${25}</option>
                </select>
              </div>
            </div>

            {/* --- SECCIÓN DE PAGOS --- */}
            <div className="payment-section">
              <h4 className="payment-title">DATOS PARA RESERVA (${RESERVATION_AMOUNT})</h4>
              
              <div className="rate-display">
                 <div className="rate-item">
                    <span>Tasa BCV</span>
                    <strong>{bcvRate ? `Bs. ${bcvRate}` : 'Cargando...'}</strong>
                 </div>
                 <div className="rate-item highlight-item">
                    <span>Monto a Transferir</span>
                    <strong>{bcvRate ? `Bs. ${reservationBs}` : '...'}</strong>
                 </div>
              </div>

              {/* Tarjetas Separadas */}
              <div className="payment-methods-grid">
                
                {/* Tarjeta Binance */}
                <div className="method-card binance-card">
                    <div className="card-header">
                        {/* <span className="card-icon">🔶</span> */}
                        <span>Binance Pay (ID)</span>
                    </div>
                    <div className="card-body">
                        <p className="big-number">383888531</p>
                    </div>
                </div>

                {/* Tarjeta Banco Venezuela */}
                <div className="method-card bank-card">
                    <div className="card-header">
                        {/* <span className="card-icon">🏦</span> */}
                        <span>Banco Venezuela (0102)</span>
                    </div>
                    <div className="card-body">
                        <p><strong>C.I:</strong> 31.491.968</p>
                        <p><strong>Telf:</strong> 04121510662</p>
                    </div>
                </div>

              </div>

              <p className="payment-note">
                * El restante (${totalCoursePrice - RESERVATION_AMOUNT}) se cancela el día del curso.
              </p>
            </div>

            {/* --- REFERENCIA Y SUBIDA DE ARCHIVO --- */}
            <div className="form-row upload-row">
                <div className="form-group">
                   <label htmlFor="paymentRef" className="highlight-label">REFERENCIA / HASH</label>
                   <input
                     type="text"
                     id="paymentRef"
                     name="paymentRef"
                     placeholder="Ej: 123456"
                     value={formData.paymentRef}
                     onChange={handleChange}
                     required
                     className="form-input success-border"
                   />
                </div>
                
                <div className="form-group">
                   <label htmlFor="fileUpload" className="highlight-label">SUBIR COMPROBANTE</label>
                   <input
                     type="file"
                     id="fileUpload"
                     accept="image/*"
                     onChange={handleFileChange}
                     required
                     className="form-input file-input success-border"
                   />
                </div>
            </div>

            {/* Mensajes de Estado */}
            {status.msg && (
              <div className={`status-msg ${status.type}`}>
                {status.msg}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={status.loading}>
              {status.loading ? 'Subiendo Pago...' : 'Confirmar Inscripción'}
            </button>
            
          </form>
        </div>
      </div>
    </section>
  );
};

export default RegisterStudents;