import React, { useState, useEffect } from 'react'; // <-- ¡Añade useState y useEffect!
import { motion } from 'framer-motion';
// --- ¡AÑADE ESTOS IMPORTS! ---
// (Ajusta la ruta a tu archivo api)
import { getStudentList } from '../api/auth.service';
import { StudentData } from '../api/auth.types';

// (Tu interfaz 'Student' ahora es 'StudentData' y se importa de la API)

export default function StudentTable() {
  // --- ¡REEMPLAZA LOS DATOS ESTÁTICOS POR ESTADOS! ---
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ¡AÑADE useEffect PARA CARGAR DATOS! ---
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getStudentList();
        setStudents(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar la lista de estudiantes.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // El array vacío [] hace que se ejecute 1 vez al cargar

  // --- Renderizado Condicional ---
  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Cargando estudiantes...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>Error: {error}</div>;
  }

  return (
    <div style={{ marginTop: '2rem', borderRadius: '0.5rem', overflow: 'hidden', flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#3b82f6', color: 'white' }}>
          <tr>
            <th style={{ padding: '0.75rem' }}>Nombre</th>
            <th>Progreso (XP)</th> {/* <-- Título actualizado */}
            <th>Racha 🔥</th>
          </tr>
        </thead>
        <tbody>
          {/* --- ¡AHORA USA EL ESTADO 'students'! --- */}
          {students.map((student, idx) => (
            <motion.tr
              key={student.id} // <-- Usa el ID real como key
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              style={{ 
                backgroundColor: idx % 2 === 0 ? '#f3f4f6' : '#e5e7eb',
                color: '#1f2937' // <-- Añadido color de texto oscuro para contraste
              }}
            >
              {/* --- ¡Usa los nombres de campos del DTO! --- */}
              <td style={{ padding: '0.75rem' }}>{student.fullName}</td>
              <td>{student.xpTotal} XP</td>
              <td>{student.currentStreak}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}