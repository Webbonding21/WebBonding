import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ReactPlayer from 'react-player';
import { FaCheckCircle, FaLock, FaPlayCircle, FaArrowRight, FaUndo, FaGoogleDrive } from 'react-icons/fa';
import '../assets/ContentCourse.css';

const ContentCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Estados para Quiz
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // --- 1. Autenticación y Verificación ---
  useEffect(() => {
    const checkAuthAndEnrollment = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }
      setUser(session.user);
      
      try {
        const { data: enrollment, error } = await supabase
          .from('enrollments')
          .select('completed_lessons')
          .eq('user_id', session.user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (error) throw error;

        if (!enrollment) {
          alert('No tienes acceso a este curso.');
          navigate(`/course/${courseId}`);
          return;
        }

        let completed = enrollment.completed_lessons || [];
        if (typeof completed === 'string') completed = JSON.parse(completed);
        
        setProgress(completed);
        fetchContent();

      } catch (err) {
        console.error("Error de acceso:", err);
      }
    };

    checkAuthAndEnrollment();
  }, [courseId]);

  // --- 2. Carga de Contenido ---
  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          id, title, "order",
          lessons (
            id, title, video_url, is_final_exam, "order",
            questions ( id, question_text, options, correct_option )
          )
        `)
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error) throw error;

      if (data) {
        const sortedModules = data.map(m => ({
          ...m,
          lessons: (m.lessons || [])
            .sort((a, b) => a.order - b.order)
            .map(l => ({
               ...l,
               questions: (l.questions || []).sort((qa, qb) => qa.id.localeCompare(qb.id))
            }))
        }));

        setModules(sortedModules);
        if (sortedModules.length > 0 && sortedModules[0].lessons.length > 0) {
           setCurrentLesson(sortedModules[0].lessons[0]);
        }
      }
    } catch (error) {
      console.error("Error al cargar lecciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: Configuración de Video ---
  const getVideoConfig = (url) => {
    if (!url) return { type: 'unknown', url: '' };
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        return { type: 'drive', url: `https://drive.google.com/file/d/${idMatch[1]}/preview` };
      }
    }
    return { type: 'normal', url: url };
  };

  // --- 3. Lógica Académica y Certificación ---

  // Función para generar automáticamente los datos del estudiante al aprobar
  const handleFinalCertification = async () => {
    try {
      // 1. Buscamos el registro del estudiante
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single();

      if (fetchError) throw fetchError;

      // 2. Preparamos los datos automáticos
      const today = new Date().toISOString().split('T')[0];
      const randomCode = `WB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const updates = {
        is_certified: true,
        cohort_date: student.cohort_date || today, // Si no tiene, hoy
        certificate_code: student.certificate_code || randomCode // Si no tiene, uno nuevo
      };

      // 3. Actualizamos la tabla students
      const { error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('id', student.id);

      if (updateError) throw updateError;

      // 4. Redirigimos al certificado
      setTimeout(() => {
        navigate(`/certificate/${courseId}`);
      }, 2500);

    } catch (err) {
      console.error("Error procesando certificación:", err);
    }
  };

  const completeLesson = async (lessonId, grade = 0) => {
    if (!progress.includes(lessonId)) {
      const newProgress = [...progress, lessonId];
      setProgress(newProgress);

      const updateData = { completed_lessons: newProgress };
      if (currentLesson.is_final_exam && grade >= 80) {
        updateData.passed = true;
        updateData.final_grade = grade;
        // Si es el final, disparamos la actualización de la tabla students
        await handleFinalCertification();
      }

      await supabase
        .from('enrollments')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('course_id', courseId);
    }
  };

  const submitQuiz = async () => {
  let correctCount = 0;
  currentLesson.questions.forEach(q => {
    if (parseInt(quizAnswers[q.id]) === q.correct_option) { 
      correctCount++; 
    }
  });
  
  const total = currentLesson.questions.length;
  const score = total > 0 ? (correctCount / total) * 100 : 100;
  const passingScore = currentLesson.is_final_exam ? 80 : 50; 

  if (score >= passingScore) {
    setQuizResult('passed');
    // Marcamos la lección como completada en la tabla de enrollments
    await completeLesson(currentLesson.id, score);

    // LÓGICA DE CERTIFICACIÓN AUTOMÁTICA
    if (currentLesson.is_final_exam) {
      try {
        // 1. Buscamos el registro del estudiante por su correo (Auth)
        const { data: student, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('email', user.email)
          .single();

        if (fetchError) throw fetchError;

        // 2. Generamos los datos faltantes si no existen
        const today = new Date().toISOString().split('T')[0];
        // Generamos un código único profesional: WB-A1B2C3D4
        const generatedCode = `WB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const updates = {
          is_certified: true,
          cohort_date: student.cohort_date || today, // Si está vacío, hoy
          certificate_code: student.certificate_code || generatedCode // Si está vacío, nuevo código
        };

        // 3. Actualizamos la tabla students
        const { error: updateError } = await supabase
          .from('students')
          .update(updates)
          .eq('id', student.id);

        if (updateError) throw updateError;

        // 4. Redirección con un pequeño delay para que el usuario vea el éxito
        setTimeout(() => {
          navigate(`/certificate/${courseId}`);
        }, 2000);

      } catch (err) {
        console.error("Error al procesar la certificación:", err.message);
        alert("Examen aprobado, pero hubo un error al generar los datos del certificado. Contacta a soporte.");
      }
    }
  } else {
    setQuizResult('failed');
  }
};

  // --- 4. Navegación de la UI ---
  const handleLessonSelect = (lesson, locked) => {
    if (locked) return;
    setCurrentLesson(lesson);
    setQuizMode(false);
    setQuizResult(null);
    setQuizAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLessonLocked = (modIndex, lessIndex) => {
    if (modIndex === 0 && lessIndex === 0) return false;
    let prevLessonId = null;
    if (lessIndex > 0) {
      prevLessonId = modules[modIndex].lessons[lessIndex - 1].id;
    } else {
      const prevModule = modules[modIndex - 1];
      if (prevModule && prevModule.lessons.length > 0) {
        prevLessonId = prevModule.lessons[prevModule.lessons.length - 1].id;
      }
    }
    return !prevLessonId || !progress.includes(prevLessonId);
  };

  const moveToNextLesson = () => {
    let currentModIdx = -1;
    let currentLessIdx = -1;
    modules.forEach((mod, mIdx) => {
      const lIdx = mod.lessons.findIndex(l => l.id === currentLesson.id);
      if (lIdx !== -1) { currentModIdx = mIdx; currentLessIdx = lIdx; }
    });

    if (currentModIdx === -1) return;

    if (currentLessIdx < modules[currentModIdx].lessons.length - 1) {
      handleLessonSelect(modules[currentModIdx].lessons[currentLessIdx + 1], false);
    } 
    else if (currentModIdx < modules.length - 1) {
      const nextMod = modules[currentModIdx + 1];
      if (nextMod.lessons.length > 0) {
        handleLessonSelect(nextMod.lessons[0], false);
      }
    } else {
       // Si ya no hay más lecciones, pero no es el examen final, avisar.
       // Si es el examen final, el submitQuiz ya maneja la redirección.
       alert("Has completado todas las lecciones de este módulo.");
    }
  };

  const handleManualComplete = () => {
    if (currentLesson.questions && currentLesson.questions.length > 0) {
        setQuizMode(true);
    } else {
        completeLesson(currentLesson.id);
        moveToNextLesson();
    }
  };

  if (loading) return <div className="course-loading"><div className="spinner"></div></div>;
  if (!currentLesson) return <div className="course-error">No se encontró contenido.</div>;

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const percent = totalLessons > 0 ? (progress.length / totalLessons) * 100 : 0;
  const videoConfig = getVideoConfig(currentLesson.video_url);

  return (
    <div className="classroom-layout">
      <aside className="classroom-sidebar">
        <div className="sidebar-header">
           <h3>Tu Progreso</h3>
           <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width: `${percent}%`}}></div>
           </div>
           <small>{Math.round(percent)}% Completado</small>
        </div>
        <div className="modules-list">
          {modules.map((mod, mIdx) => (
            <div key={mod.id} className="module-group">
              <h4 className="module-title">{mod.title}</h4>
              <ul>
                {mod.lessons.map((less, lIdx) => {
                  const isCompleted = progress.includes(less.id);
                  const isLocked = isLessonLocked(mIdx, lIdx); 
                  const isActive = currentLesson.id === less.id;
                  return (
                    <li key={less.id} 
                      className={`lesson-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => handleLessonSelect(less, isLocked)}
                    >
                      <span className="icon">
                        {isCompleted ? <FaCheckCircle color="#4caf50"/> : (isLocked ? <FaLock/> : <FaPlayCircle/>)}
                      </span>
                      <span className="lesson-text">{less.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <main className="classroom-content">
        <header className="lesson-header">
          <span className={`badge-lesson ${currentLesson.is_final_exam ? 'exam' : ''}`}>
             {currentLesson.is_final_exam ? 'EXAMEN FINAL' : 'CLASE VIDEO'}
          </span>
          <h1>{currentLesson.title}</h1>
        </header>

        <div className="player-wrapper">
          {!quizMode ? (
            <div className="video-section">
               <div className="video-container">
                 {videoConfig.type === 'drive' ? (
                    <iframe src={videoConfig.url} width="100%" height="100%" style={{border:0, position:'absolute', top:0, left:0}} allow="autoplay" title="Video"></iframe>
                 ) : (
                    <ReactPlayer url={videoConfig.url} controls={true} width="100%" height="100%" className="react-player" onEnded={handleVideoEnd} />
                 )}
               </div>
               <div className="lesson-actions">
                 {videoConfig.type === 'drive' && !progress.includes(currentLesson.id) && (
                    <div className="drive-warning" style={{color: '#06b6d4', marginBottom: '10px', fontSize: '0.9rem'}}>
                        <FaGoogleDrive style={{marginRight:'5px', verticalAlign:'middle'}}/>
                        Termina de ver el video y presiona el botón para avanzar.
                    </div>
                 )}
                 {(videoConfig.type === 'drive' || progress.includes(currentLesson.id)) && (
                    <button className="btn-next" onClick={handleManualComplete}>
                      {currentLesson.questions?.length > 0 ? 'Ir al Quiz' : 'Siguiente'} <FaArrowRight />
                    </button>
                 )}
               </div>
            </div>
          ) : (
            <div className="quiz-container">
              <div className="quiz-header">
                 <h2>Evaluación</h2>
                 {currentLesson.is_final_exam && <p style={{color: '#fca5a5'}}>Este es el examen final. Necesitas 80% para certificarte.</p>}
              </div>
              {currentLesson.questions.map((q, idx) => (
                <div key={q.id} className="quiz-question">
                  <p className="q-text"><strong>{idx + 1}.</strong> {q.question_text}</p>
                  <div className="options-grid">
                    {Array.isArray(q.options) && q.options.map((opt, optIdx) => (
                      <label key={optIdx} className={`radio-option ${parseInt(quizAnswers[q.id]) === optIdx ? 'selected' : ''}`}>
                        <input type="radio" name={`q-${q.id}`} value={optIdx} onChange={(e) => setQuizAnswers({...quizAnswers, [q.id]: e.target.value})} disabled={quizResult === 'passed'} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {quizResult === 'passed' && (
                <div className="quiz-feedback success">
                   <FaCheckCircle /> {currentLesson.is_final_exam ? '¡EXAMEN APROBADO! Generando certificado...' : '¡Aprobado!'}
                </div>
              )}
              {quizResult === 'failed' && <div className="quiz-feedback error">❌ Inténtalo de nuevo.</div>}
              <div className="quiz-actions">
                {quizResult !== 'passed' ? (
                  <button onClick={submitQuiz} className="btn-submit-quiz">Enviar Respuestas</button>
                ) : (
                  !currentLesson.is_final_exam && <button onClick={moveToNextLesson} className="btn-next">Siguiente <FaArrowRight /></button>
                )}
                {quizResult === 'failed' && <button onClick={() => {setQuizResult(null); setQuizAnswers({});}} className="btn-retry"><FaUndo /> Reintentar</button>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContentCourse;