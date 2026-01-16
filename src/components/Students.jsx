import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/Students.css';

import { 
  FaEye, FaCheck, FaTrash, FaTimes, 
  FaUserGraduate, FaMoneyBillWave, FaUsers, 
  FaIdCard, FaWhatsapp, FaImage 
} from 'react-icons/fa';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, money: 0 });

  // ESTADO DEL MODAL
  const [viewImage, setViewImage] = useState(null); // Si es null, está cerrado. Si tiene texto, está abierto.

  useEffect(() => {
    fetchStudents();
  }, []);

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (viewImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup al desmontar
    return () => { document.body.style.overflow = 'auto'; };
  }, [viewImage]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error cargando estudiantes:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const paidCount = data.filter(s => s.payment_status === 'pagado').length;
    setStats({
      total: data.length,
      paid: paidCount,
      money: paidCount * 5
    });
  };

  // Acciones (Pagar / Eliminar)
  const handleAction = async (action, id) => {
    if (action === 'delete' && !window.confirm('¿Eliminar registro?')) return;

    try {
      let error;
      if (action === 'pay') {
        const res = await supabase.from('students').update({ payment_status: 'pagado' }).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('students').delete().eq('id', id);
        error = res.error;
      }

      if (error) throw error;

      // Actualizar estado local
      if (action === 'pay') {
        const updated = students.map(s => s.id === id ? { ...s, payment_status: 'pagado' } : s);
        setStudents(updated);
        calculateStats(updated);
      } else {
        const filtered = students.filter(s => s.id !== id);
        setStudents(filtered);
        calculateStats(filtered);
      }
    } catch (err) {
      console.error(err);
      alert('Error al ejecutar acción');
    }
  };

  return (
    <div className="admin-container">
      
      {/* --- EL MODAL (Renderizado fuera de la tabla) --- */}
      {viewImage && (
        <div className="fullscreen-modal-backdrop" onClick={() => setViewImage(null)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-close-btn" onClick={() => setViewImage(null)}>
              <FaTimes />
            </button>
            <h3>Comprobante de Pago</h3>
            <div className="fullscreen-image-wrapper">
              <img src={viewImage} alt="Comprobante" />
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="admin-header">
        <h2 className="admin-title">Panel de Control <span className="highlight">Web Bonding</span></h2>
        <div className="stats-grid">
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <span className="stat-label">Total Inscritos</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card">
            <FaUserGraduate className="stat-icon success-icon" />
            <span className="stat-label">Pagos Confirmados</span>
            <span className="stat-value success-text">{stats.paid}</span>
          </div>
          <div className="stat-card">
            <FaMoneyBillWave className="stat-icon money-icon" />
            <span className="stat-label">Recaudo ($5)</span>
            <span className="stat-value money-text">${stats.money}</span>
          </div>
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="table-wrapper">
        {loading ? (
          <p className="loading-text">Cargando datos...</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estudiante</th>
                <th>Datos</th>
                <th>Curso</th>
                <th>Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    {new Date(student.created_at).toLocaleDateString()}
                    <div className="time-small">{new Date(student.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td>
                    <div className="student-name">{student.full_name}</div>
                    <div className="student-email">{student.email}</div>
                  </td>
                  <td>
                    <div className="student-info"><FaIdCard className="info-icon"/> {student.cedula}</div>
                    <div className="student-info"><FaWhatsapp className="info-icon"/> {student.phone}</div>
                  </td>
                  <td>
                    <span className={`course-badge ${student.course_name.includes('Excel') ? 'excel-badge' : 'ia-badge'}`}>
                      {student.course_name.includes('Excel') ? 'Excel' : 'IA'}
                    </span>
                  </td>
                  <td>
                    <div className="payment-cell">
                      <span className={`status-badge ${student.payment_status}`}>
                        {student.payment_status}
                      </span>
                      {student.payment_ref && <div className="ref-info">#{student.payment_ref}</div>}
                      
                      {student.pago_link ? (
                        <button 
                          // AQUÍ ESTA LA CLAVE: Solo pasamos el string de la URL
                          onClick={() => setViewImage(student.pago_link)} 
                          className="icon-btn view-btn"
                        >
                          <FaEye /> Ver
                        </button>
                      ) : (
                        <span className="no-proof"><FaImage /> No foto</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {student.payment_status !== 'pagado' && (
                        <button onClick={() => handleAction('pay', student.id)} className="icon-btn approve-btn">
                          <FaCheck />
                        </button>
                      )}
                      <button onClick={() => handleAction('delete', student.id)} className="icon-btn delete-btn">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Students;