import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/RegisterStudents.css';

const RegisterStudents = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    email: '',
    phone: '',
    courseId: '', // Guardamos el ID para lógica interna
    paymentRef: ''
  });

  // Estados para datos dinámicos
  const [courses, setCourses] = useState([]); // Lista de cursos desde DB
  const [selectedCourse, setSelectedCourse] = useState(null); // Curso actual con todos sus datos
  const [paymentFile, setPaymentFile] = useState(null);
  
  const [status, setStatus] = useState({ loading: false, type: '', msg: '' });
  const [bcvRate, setBcvRate] = useState(null);

  // 1. CARGAR DATOS (TASA BCV Y CURSOS)
  useEffect(() => {
    const fetchData = async () => {
      // A) Tasa BCV
      try {
        const rateRes = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const rateData = await rateRes.json();
        if (rateData?.promedio) setBcvRate(rateData.promedio);
      } catch (e) { console.error('Error tasa:', e); }

      // B) Cursos Activos desde Supabase
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('active', true)
          .order('start_date', { ascending: true });
        
        if (error) throw error;

        if (data && data.length > 0) {
          setCourses(data);
          // Seleccionar el primer curso por defecto
          setFormData(prev => ({ ...prev, courseId: data[0].id }));
          setSelectedCourse(data[0]);
        }
      } catch (e) { console.error('Error cursos:', e); }
    };

    fetchData();
  }, []);

  // 2. MANEJAR CAMBIO DE CURSO
  const handleCourseChange = (e) => {
    const newId = e.target.value;
    const course = courses.find(c => c.id === newId);
    
    setFormData({ ...formData, courseId: newId });
    setSelectedCourse(course);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) setPaymentFile(e.target.files[0]);
  };

  // 3. CÁLCULOS DINÁMICOS DE PRECIO
  const reservationPrice = selectedCourse ? selectedCourse.reservation_price : 0;
  const totalPrice = selectedCourse ? selectedCourse.price : 0;
  const remainingPrice = totalPrice - reservationPrice;
  const reservationBs = bcvRate ? (reservationPrice * bcvRate).toFixed(2) : '...';

  // 4. ENVÍO DEL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, type: '', msg: '' });

    if (!paymentFile) {
      setStatus({ loading: false, type: 'error', msg: 'Por favor sube la captura de pantalla del pago.' });
      return;
    }

    try {
      // A) Subir Imagen
      const fileExt = paymentFile.name.split('.').pop();
      const fileName = `${Date.now()}_${formData.cedula}.${fileExt}`;
      const filePath = `Pagos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('WebBonding')
        .upload(filePath, paymentFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('WebBonding')
        .getPublicUrl(filePath);

      // B) Insertar Estudiante (Usando datos del selectedCourse)
      const { error: insertError } = await supabase
        .from('students')
        .insert([{
          full_name: formData.fullName,
          cedula: formData.cedula,
          email: formData.email,
          phone: formData.phone,
          course_name: selectedCourse.title, // Guardamos el nombre real
          cohort_date: selectedCourse.start_date, // Fecha real de la DB
          payment_status: 'reservado',
          payment_ref: formData.paymentRef,
          pago_link: publicUrl
        }]);

      if (insertError) throw insertError;

      setStatus({ 
        loading: false, 
        type: 'success', 
        msg: '¡Recibido! Hemos guardado tu comprobante y cupo.' 
      });
      
      // Resetear form
      setFormData({ fullName: '', cedula: '', email: '', phone: '', paymentRef: '', courseId: formData.courseId });
      setPaymentFile(null);

    } catch (error) {
      console.error('Error:', error.message);
      setStatus({ loading: false, type: 'error', msg: 'Error al procesar. Intenta de nuevo.' });
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
            Asegura tu cupo hoy con solo <strong>${reservationPrice}</strong>.
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
                  name="phone"
                  placeholder="0412-1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* --- SELECCIÓN DINÁMICA DE CURSO --- */}
            <div className="form-group">
              <label htmlFor="course">Formación de Interés</label>
              <div className="select-wrapper">
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleCourseChange}
                  className="form-input form-select"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({new Date(course.start_date).toLocaleDateString()}) - Total ${course.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Extra del Curso Seleccionado */}
              {selectedCourse && (
                 <div style={{marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '15px'}}>
                    <span>📅 Inicio: {new Date(selectedCourse.start_date).toLocaleDateString()}</span>
                    <span>⏱ Duración: {selectedCourse.duration}</span>
                 </div>
              )}
            </div>

            {/* --- SECCIÓN DE PAGOS --- */}
            <div className="payment-section">
              <h4 className="payment-title">DATOS PARA RESERVA (${reservationPrice})</h4>
              
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
                        <span>Binance Pay (ID)</span>
                    </div>
                    <div className="card-body">
                        <p className="big-number">383888531</p>
                    </div>
                </div>

                {/* Tarjeta Banco Venezuela */}
                <div className="method-card bank-card">
                    <div className="card-header">
                        <span>Banco Venezuela (0102)</span>
                    </div>
                    <div className="card-body">
                        <p><strong>C.I:</strong> 31.491.968</p>
                        <p><strong>Telf:</strong> 04121510662</p>
                    </div>
                </div>

              </div>

              <p className="payment-note">
                * El restante (${remainingPrice}) se cancela el día del curso.
              </p>
            </div>

            {/* --- REFERENCIA Y SUBIDA DE ARCHIVO --- */}
            <div className="form-row upload-row">
                <div className="form-group">
                   <label className="highlight-label">REFERENCIA / HASH</label>
                   <input
                     type="text"
                     name="paymentRef"
                     placeholder="Ej: 123456"
                     value={formData.paymentRef}
                     onChange={handleChange}
                     required
                     className="form-input success-border"
                   />
                </div>
                
                <div className="form-group">
                   <label className="highlight-label">SUBIR COMPROBANTE</label>
                   <input
                     type="file"
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