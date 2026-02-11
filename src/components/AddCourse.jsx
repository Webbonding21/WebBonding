import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaPlus, FaSave, FaGoogleDrive } from 'react-icons/fa';
import '../assets/AddCourse.css';

const AddCourse = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);

  // Estructura inicial
  const [modules, setModules] = useState([
    { title: '', lessons: [] }
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('id, title');
    setCourses(data || []);
  };

  // --- Manejadores de Estado ---
  const addModule = () => {
    setModules([...modules, { title: '', lessons: [] }]);
  };

  const addLesson = (moduleIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      title: '',
      video_url: '', // AQUI pegaremos el link de Drive
      is_final_exam: false,
      questions: []
    });
    setModules(newModules);
  };

  const addQuestion = (moduleIndex, lessonIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex].questions.push({
      question_text: '',
      options: ['', '', '', ''],
      correct_option: 0
    });
    setModules(newModules);
  };

  // --- Guardar en Supabase (Solo texto, sin subidas pesadas) ---
  const handleSaveCurriculum = async () => {
    if (!selectedCourse) return alert('Selecciona un curso');
    setLoading(true);

    try {
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        
        // 1. Guardar Módulo
        const { data: modData, error: modError } = await supabase
          .from('modules')
          .insert({ course_id: selectedCourse, title: mod.title, order: i })
          .select()
          .single();

        if (modError) throw modError;

        for (let j = 0; j < mod.lessons.length; j++) {
          const lesson = mod.lessons[j];
          
          // 2. Guardar Lección (Guardamos el LINK directo)
          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .insert({
              module_id: modData.id,
              title: lesson.title,
              video_url: lesson.video_url, 
              is_final_exam: lesson.is_final_exam,
              order: j
            })
            .select()
            .single();

          if (lessonError) throw lessonError;

          // 3. Guardar Preguntas
          if (lesson.questions.length > 0) {
            const questionsToInsert = lesson.questions.map(q => ({
              lesson_id: lessonData.id,
              question_text: q.question_text,
              options: q.options,
              correct_option: parseInt(q.correct_option)
            }));
            
            await supabase.from('questions').insert(questionsToInsert);
          }
        }
      }
      alert('¡Curso guardado exitosamente con enlaces de Drive!');
      setModules([{ title: '', lessons: [] }]); 
    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <h2>Cargar Curso (Versión Drive)</h2>
      
      <select onChange={(e) => setSelectedCourse(e.target.value)} value={selectedCourse}>
        <option value="">-- Selecciona el Curso --</option>
        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>

      {modules.map((module, mIndex) => (
        <div key={mIndex} className="module-card">
          <input 
            placeholder="Título del Módulo (Ej. Mentalidad)"
            value={module.title}
            onChange={e => {
              const newMods = [...modules];
              newMods[mIndex].title = e.target.value;
              setModules(newMods);
            }}
          />
          
          <div className="lessons-container">
            {module.lessons.map((lesson, lIndex) => (
              <div key={lIndex} className="lesson-card">
                <h4>Lección {lIndex + 1}</h4>
                <input 
                  placeholder="Título de la Clase" 
                  value={lesson.title}
                  onChange={e => {
                    const newMods = [...modules];
                    newMods[mIndex].lessons[lIndex].title = e.target.value;
                    setModules(newMods);
                  }}
                />
                
                {/* INPUT PARA LINK DE DRIVE */}
                <div className="input-group">
                  <FaGoogleDrive className="icon-drive" />
                  <input 
                    placeholder="Pega aquí el enlace de Google Drive del video..." 
                    value={lesson.video_url}
                    onChange={e => {
                      const newMods = [...modules];
                      newMods[mIndex].lessons[lIndex].video_url = e.target.value;
                      setModules(newMods);
                    }}
                  />
                </div>
                <small style={{color: '#94a3b8', display: 'block', marginBottom: '10px'}}>
                  * Asegúrate de que el video en Drive tenga acceso "Cualquiera con el enlace".
                </small>

                <label>
                  <input 
                    type="checkbox" 
                    checked={lesson.is_final_exam}
                    onChange={e => {
                      const newMods = [...modules];
                      newMods[mIndex].lessons[lIndex].is_final_exam = e.target.checked;
                      setModules(newMods);
                    }}
                  /> ¿Es Examen Final?
                </label>

                {/* BOTÓN QUIZ */}
                <button onClick={() => addQuestion(mIndex, lIndex)} className="btn-small">
                   + Agregar Pregunta al Quiz
                </button>
                
                {lesson.questions.map((q, qIndex) => (
                  <div key={qIndex} className="question-box">
                    <input 
                      placeholder="Pregunta"
                      value={q.question_text}
                      onChange={e => {
                         const newMods = [...modules];
                         newMods[mIndex].lessons[lIndex].questions[qIndex].question_text = e.target.value;
                         setModules(newMods);
                      }}
                    />
                    <div className="options-grid-admin">
                         {q.options.map((opt, optIdx) => (
                            <input 
                                key={optIdx}
                                placeholder={`Opción ${optIdx + 1}`}
                                value={opt}
                                onChange={e => {
                                    const newMods = [...modules];
                                    newMods[mIndex].lessons[lIndex].questions[qIndex].options[optIdx] = e.target.value;
                                    setModules(newMods);
                                }}
                            />
                         ))}
                    </div>
                    <input 
                      placeholder="Índice Correcta (0-3)"
                      type="number"
                      value={q.correct_option}
                      onChange={e => {
                         const newMods = [...modules];
                         newMods[mIndex].lessons[lIndex].questions[qIndex].correct_option = e.target.value;
                         setModules(newMods);
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => addLesson(mIndex)} className="btn-add-lesson">
              <FaPlus /> Nueva Lección
            </button>
          </div>
        </div>
      ))}

      <button onClick={addModule} className="btn-add-module">Agregar Nuevo Módulo</button>
      <button onClick={handleSaveCurriculum} disabled={loading} className="btn-save-all">
        {loading ? 'Guardando...' : 'GUARDAR CURSO'}
      </button>
    </div>
  );
};

export default AddCourse;