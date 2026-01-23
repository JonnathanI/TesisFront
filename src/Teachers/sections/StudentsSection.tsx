import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getStudentList, 
  getStudentDetailProgress, 
  StudentData, 
  DetailedStudentProgress 
} from '../../api/auth.service';

export const StudentsSection = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [progress, setProgress] = useState<DetailedStudentProgress | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getStudentList();
      setStudents(data);
    } catch (err) {
      console.error("Error al cargar estudiantes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProgress = async (student: StudentData) => {
    setSelectedStudent(student);
    setLoadingDetail(true);
    setProgress(null);
    try {
      const data = await getStudentDetailProgress(student.id);
      setProgress(data);
    } catch (err) {
      console.error("Error cargando progreso:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px', color: '#1cb0f6', fontWeight: 'bold' }}>
      Cargando lista de alumnos...
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '25px', minHeight: '70vh' }}>
      
      {/* --- PANEL IZQUIERDO: LISTADO DE ALUMNOS --- */}
      <div style={{ 
        flex: "1", 
        background: '#fff', 
        borderRadius: '18px', 
        border: '2px solid #e5e5e5',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f7f7f7', borderBottom: '2px solid #e5e5e5' }}>
            <tr style={{ color: '#afafaf', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Estudiante</th>
              <th>XP Total</th>
              <th>Racha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} style={{ 
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: selectedStudent?.id === s.id ? '#f1f7ff' : 'transparent'
              }}>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#4b4b4b' }}>{s.fullName}</td>
                <td style={{ textAlign: 'center', color: '#ffc800', fontWeight: 'bold' }}>⚡ {s.xpTotal}</td>
                <td style={{ textAlign: 'center' }}>🔥 {s.currentStreak}</td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => handleViewProgress(s)}
                    style={{ 
                      background: '#1cb0f6', color: 'white', border: 'none', padding: '8px 12px', 
                      borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                      boxShadow: '0 3px 0 #1899d6'
                    }}
                  >
                    ANALIZAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PANEL DERECHO: DETALLE ACADÉMICO --- */}
      <div style={{ 
        flex: "1.4", background: '#fff', padding: '25px', borderRadius: '18px', 
        border: '2px solid #e5e5e5', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <AnimatePresence mode="wait">
          {!selectedStudent ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '100px', color: '#afafaf' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎓</div>
              <p>Selecciona un alumno para ver su rendimiento detallado por unidad y lección.</p>
            </motion.div>
          ) : loadingDetail ? (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando datos...</div>
          ) : (
            <motion.div key={selectedStudent.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <header style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#1cb0f6' }}>Reporte: {selectedStudent.fullName}</h3>
                <span style={{ fontSize: '13px', color: '#777' }}>Desglose de unidades y precisión de respuestas</span>
              </header>

              {progress?.units.map(unit => (
                <div key={unit.id} style={{ marginBottom: '25px' }}>
                  <div style={{ 
                    background: '#f1f7ff', padding: '10px 15px', borderRadius: '12px', 
                    fontWeight: 'bold', color: '#1899d6', marginBottom: '10px'
                  }}>
                    <span>📚 {unit.title}</span>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {unit.lessons.map(lesson => (
                      <div key={lesson.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px', borderRadius: '12px', border: '1px solid #f0f0f0',
                        background: '#fafafa'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>{lesson.isCompleted ? '✅' : '⏳'}</span>
                          <span style={{ fontWeight: 600, color: '#4b4b4b' }}>{lesson.title}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          {/* COLUMNA XP */}
                          {lesson.isCompleted && (
                            <div style={{ textAlign: 'center', background: '#fff9e6', padding: '4px 10px', borderRadius: '10px', border: '1px solid #ffc800', minWidth: '55px' }}>
                              <div style={{ fontSize: '9px', color: '#ffc800', fontWeight: 800 }}>XP</div>
                              <div style={{ color: '#ffc800', fontWeight: 'bold', fontSize: '13px' }}>+{lesson.xpEarned || 0}</div>
                            </div>
                          )}

                          {/* COLUMNA ACIERTOS */}
                          <div style={{ textAlign: 'center', background: '#e8f9e1', padding: '4px 10px', borderRadius: '10px', minWidth: '55px' }}>
                            <div style={{ fontSize: '9px', color: '#58cc02', fontWeight: 800 }}>ACIERTOS</div>
                            <div style={{ color: '#58cc02', fontWeight: 'bold', fontSize: '13px' }}>{lesson.correctAnswers || 0}</div>
                          </div>
                          
                          {/* COLUMNA ERRORES (Con estrella si es 0) */}
                          <div style={{ 
                            textAlign: 'center', 
                            background: '#ffebeb', 
                            padding: '4px 10px', 
                            borderRadius: '10px', 
                            minWidth: '55px',
                            border: (lesson.isCompleted && lesson.mistakesCount === 0) ? '1px solid #ff4b4b' : '1px solid transparent'
                          }}>
                            <div style={{ fontSize: '9px', color: '#ff4b4b', fontWeight: 800 }}>ERRORES</div>
                            <div style={{ color: '#ff4b4b', fontWeight: 'bold', fontSize: '13px' }}>
                              {lesson.mistakesCount || 0}
                              {lesson.isCompleted && lesson.mistakesCount === 0 }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {progress?.units.length === 0 && <p style={{ color: '#afafaf', textAlign: 'center' }}>No hay actividad registrada aún.</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};