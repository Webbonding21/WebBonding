import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Importamos la conexión
import '../assets/RegisterStudents.css'; // Asegúrate de tener los estilos adecuados

const RegisterStudents = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    email: '',
    phone: '',
    course: 'IA de Bolsillo'
  });

  const [status, setStatus] = useState({ loading: false, type: '', msg: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función auxiliar para definir la fecha según el curso
  const getCohortDate = (courseName) => {
    if (courseName === 'Excel & AI Masterclass') {
      return '2026-02-01'; // Fecha para Excel
    }
    return '2026-01-31'; // Fecha por defecto (IA de Bolsillo)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, type: '', msg: '' });

    try {
      // 1. Enviamos los datos a Supabase
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            full_name: formData.fullName,
            cedula: formData.cedula,
            email: formData.email,
            phone: formData.phone,
            course_name: formData.course,
            cohort_date: getCohortDate(formData.course), // AQUÍ SE SELECCIONA LA FECHA CORRECTA
            payment_status: 'reservado'
          }
        ]);

      if (error) throw error;

      // 2. Éxito
      setStatus({ 
        loading: false, 
        type: 'success', 
        msg: '¡Reserva exitosa! Te hemos enviado los datos de pago.' 
      });
      
      // Limpiar formulario (Opcional, puedes dejarlo lleno si prefieres)
      setFormData({ fullName: '', cedula: '', email: '', phone: '', course: 'IA de Bolsillo' });

    } catch (error) {
      console.error('Error al registrar:', error.message);
      setStatus({ 
        loading: false, 
        type: 'error', 
        msg: 'Hubo un error al registrarte. Intenta de nuevo.' 
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
            Asegura tu cupo en nuestras formaciones premium. <br />
            Cupos limitados por cohorte.
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="register-form">
            
            {/* Fila 1 */}
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

            {/* Fila 2 */}
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

            {/* Fila 3 */}
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
                  <option value="IA de Bolsillo">IA de Bolsillo (31 Enero)</option>
                  <option value="Excel & AI Masterclass">Excel & AI Automation (1 Feb)</option>
                </select>
              </div>
            </div>

            {/* Mensajes */}
            {status.msg && (
              <div className={`status-msg ${status.type}`}>
                {status.msg}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={status.loading}>
              {status.loading ? 'Registrando...' : 'Reservar Cupo Ahora'}
            </button>
            
            <p className="form-footer">
              Tus datos están protegidos. Recibirás info de pago al instante.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RegisterStudents;