import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/AdminCourses.css';
import { FaPlus, FaTrash, FaEdit, FaUpload, FaSave, FaTimes } from 'react-icons/fa';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    start_date: '',
    price: '',
    reservation_price: '5',
    modules: [], // Array de strings
    image_url: ''
  });

  // Estado para la subida de imagen y módulos
  const [imageFile, setImageFile] = useState(null);
  const [newModule, setNewModule] = useState('');

  // 1. Cargar cursos al iniciar
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCourses(data);
    setLoading(false);
  };

  // --- LÓGICA DE MÓDULOS ---
  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModule.trim()) return;
    setFormData({ ...formData, modules: [...formData.modules, newModule] });
    setNewModule('');
  };

  const handleRemoveModule = (index) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: updatedModules });
  };

  // --- LÓGICA DE IMAGEN ---
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url; // Si no hay nueva imagen, devuelve la vieja (si existe)

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `Cursos/${fileName}`;

    const { error } = await supabase.storage.from('WebBonding').upload(filePath, imageFile);
    if (error) throw error;

    const { data } = supabase.storage.from('WebBonding').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // --- GUARDAR (CREAR O EDITAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // 1. Subir imagen si existe
      const publicUrl = await uploadImage();

      const courseData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        start_date: formData.start_date,
        price: parseFloat(formData.price),
        reservation_price: parseFloat(formData.reservation_price),
        modules: formData.modules, // Se guarda como JSONB automáticamente
        image_url: publicUrl,
        active: true
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase.from('courses').update(courseData).eq('id', editingId);
        if (error) throw error;
        alert('Curso actualizado correctamente');
      } else {
        // INSERT
        const { error } = await supabase.from('courses').insert([courseData]);
        if (error) throw error;
        alert('Curso creado correctamente');
      }

      // Reset
      resetForm();
      fetchCourses();

    } catch (error) {
      console.error(error);
      alert('Error al guardar el curso');
    } finally {
      setUploading(false);
    }
  };

  // --- ACCIONES DE UI ---
  const handleEdit = (course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      start_date: course.start_date,
      price: course.price,
      reservation_price: course.reservation_price,
      modules: course.modules || [],
      image_url: course.image_url
    });
    window.scrollTo(0, 0); // Subir al formulario
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este curso? Se borrará permanentemente.')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) fetchCourses();
  };

  const resetForm = () => {
    setEditingId(null);
    setImageFile(null);
    setFormData({
      title: '', description: '', duration: '', start_date: '',
      price: '', reservation_price: '5', modules: [], image_url: ''
    });
  };

  return (
    <div className="admin-courses-container">
      <h2 className="admin-title">Gestión de <span className="highlight">Cursos</span></h2>

      {/* --- FORMULARIO DE CREACIÓN/EDICIÓN --- */}
      <div className="course-form-card">
        <h3 className="form-title">{editingId ? 'Editar Curso' : 'Crear Nuevo Curso'}</h3>
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Título del Curso</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
                placeholder="Ej: Master en Excel"
              />
            </div>
            
            <div className="form-group">
              <label>Fecha de Inicio</label>
              <input 
                type="date" 
                value={formData.start_date} 
                onChange={e => setFormData({...formData, start_date: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Precio Total ($)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                required 
                placeholder="25"
              />
            </div>

            <div className="form-group">
              <label>Reserva ($)</label>
              <input 
                type="number" 
                value={formData.reservation_price} 
                onChange={e => setFormData({...formData, reservation_price: e.target.value})} 
                required 
                placeholder="5"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción Corta</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Duración (Texto)</label>
            <input 
              type="text" 
              value={formData.duration} 
              onChange={e => setFormData({...formData, duration: e.target.value})} 
              placeholder="Ej: 4 Semanas / 10 Horas"
            />
          </div>

          {/* --- GESTIÓN DE MÓDULOS --- */}
          <div className="modules-section">
            <label>Módulos / Temario</label>
            <div className="module-input-group">
              <input 
                type="text" 
                value={newModule} 
                onChange={e => setNewModule(e.target.value)}
                placeholder="Escribe un tema y pulsa +"
              />
              <button type="button" onClick={handleAddModule} className="add-module-btn">
                <FaPlus />
              </button>
            </div>
            <ul className="modules-list">
              {formData.modules.map((mod, index) => (
                <li key={index}>
                  {mod} 
                  <button type="button" onClick={() => handleRemoveModule(index)}><FaTimes /></button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- SUBIDA DE IMAGEN --- */}
          <div className="form-group image-upload-group">
            <label>Portada del Curso</label>
            <div className="upload-wrapper">
              <input type="file" accept="image/*" onChange={handleImageChange} id="course-img" hidden />
              <label htmlFor="course-img" className="upload-btn">
                <FaUpload /> {imageFile ? 'Imagen Seleccionada' : 'Subir Imagen'}
              </label>
              {/* Preview */}
              {(imageFile || formData.image_url) && (
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                  alt="Preview" 
                  className="img-preview"
                />
              )}
            </div>
          </div>

          <div className="form-actions">
            {editingId && <button type="button" onClick={resetForm} className="cancel-btn">Cancelar</button>}
            <button type="submit" className="save-btn" disabled={uploading}>
              <FaSave /> {uploading ? 'Guardando...' : (editingId ? 'Actualizar Curso' : 'Crear Curso')}
            </button>
          </div>
        </form>
      </div>

      {/* --- LISTADO DE CURSOS --- */}
      <div className="courses-grid-admin">
        {courses.map(course => (
          <div key={course.id} className="course-card-admin">
            <div className="course-img-wrapper">
              <img src={course.image_url || 'https://via.placeholder.com/300'} alt={course.title} />
              <span className="price-tag">${course.price}</span>
            </div>
            <div className="course-content">
              <h4>{course.title}</h4>
              <p className="date-info">📅 {new Date(course.start_date).toLocaleDateString()}</p>
              <div className="admin-card-actions">
                <button onClick={() => handleEdit(course)} className="edit-icon"><FaEdit /></button>
                <button onClick={() => handleDelete(course.id)} className="delete-icon"><FaTrash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourses;