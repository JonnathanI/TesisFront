import React, { useState, useEffect } from "react"; // <-- ¡Añade useEffect!
import { motion, AnimatePresence } from "framer-motion";
import StudentTable from "./StudentTable";
// --- ¡AÑADE LOS IMPORTS DE TU API! ---
import {
  getQuestionsByLesson,
  createQuestion,
  deleteQuestion,
  QuestionData,
  NewQuestionPayload
} from '../api/auth.service'; // <-- Ajusta esta ruta

// (Tu interfaz Student está bien, aunque la movimos a StudentTable en el paso anterior)
// ...

// (Tu interfaz Question ahora se importa como QuestionData)

export default function TeacherDashboard() {
  const [xp, setXp] = useState(500);
  const [activeTab, setActiveTab] = useState<"dashboard" | "students" | "questions">("dashboard");

  // --- ESTADO DE PREGUNTAS (AHORA DINÁMICO) ---
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADO DEL FORMULARIO (SE MANTIENE) ---
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  // --- ¡ID DE LECCIÓN DE EJEMPLO! ---
  // En una app real, tendrías un <select> para que el profesor elija la unidad y lección.
  // Por ahora, usaremos un ID quemado.
  // ¡¡DEBES CAMBIAR ESTO POR UN lessonId REAL DE TU BASE DE DATOS!!
  const CURRENT_LESSON_ID = "77d89e99-76a3-4a91-807a-0e96f6a08cb6";

  // --- Cargar Preguntas (NUEVO) ---
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getQuestionsByLesson(CURRENT_LESSON_ID);
      setQuestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Cargar preguntas cuando la pestaña "questions" se activa ---
  useEffect(() => {
    if (activeTab === "questions") {
      fetchQuestions();
    }
  }, [activeTab]);

  // --- addQuestion (ACTUALIZADO) ---
  const addQuestion = async () => {
    if (!newQuestion.trim() || !correctAnswer.trim())
      return alert("Completa la pregunta y la respuesta correcta.");
    
    // Filtra opciones vacías
    const validOptions = newOptions.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      return alert("Debe haber al menos 2 opciones.");
    }
    // Asegurarse que la respuesta correcta esté en las opciones
    if (!validOptions.includes(correctAnswer)) {
      return alert("La respuesta correcta debe ser una de las opciones.");
    }

    const payload: NewQuestionPayload = {
      lessonId: CURRENT_LESSON_ID,
      questionTypeId: "TRANSLATION_TO_TARGET", // ¡Quemado por ahora!
      textSource: newQuestion,
      textTarget: correctAnswer,
      options: validOptions,
    };

    try {
      await createQuestion(payload);
      // Limpia el formulario
      setNewQuestion("");
      setNewOptions(["", "", "", ""]);
      setCorrectAnswer("");
      // Vuelve a cargar la lista
      fetchQuestions(); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- deleteQuestion (ACTUALIZADO) ---
  const deleteQuestion = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
      return;
    }
    try {
      await deleteQuestion(id);
      // Vuelve a cargar la lista
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* ... (Tu <style> y <header> están bien) ... */}
       <style>{`
         * { box-sizing: border-box; }
         body { margin: 0; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #f9fafb, #eef2ff); }
         header { background: linear-gradient(90deg, #3b82f6, #2563eb); color: white; padding: 1.5rem 1rem; font-size: 1.8rem; font-weight: bold; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
         nav { display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; }
         nav button { padding: 0.8rem 1.5rem; border-radius: 2rem; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; }
         nav button.active { background: linear-gradient(90deg, #2563eb, #3b82f6); color: white; box-shadow: 0 4px 15px rgba(37,99,235,0.5); }
         nav button.inactive { background: #e5e7eb; color: #1f2937; box-shadow: 0 3px 6px rgba(0,0,0,0.1); }
         main { padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; }
         .cards-container { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
         .card { width: 100%; max-width: 220px; height: 130px; border-radius: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem; box-shadow: 0 6px 20px rgba(0,0,0,0.1); transition: transform 0.2s; }
         .card:hover { transform: scale(1.05); }
         .xp-card { background: linear-gradient(135deg, #60a5fa, #2563eb, #1e40af); }
         .students-card { background: linear-gradient(135deg, #34d399, #10b981, #059669); }
         .form-input { width: 90%; max-width: 500px; padding: 0.8rem; border-radius: 0.7rem; border: 1px solid #cbd5e1; font-size: 1rem; outline: none; margin-bottom: 0.8rem; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
         .add-button { padding: 0.8rem 2rem; border-radius: 2rem; background: linear-gradient(90deg, #2563eb, #3b82f6); color: white; font-weight: bold; cursor: pointer; border: none; box-shadow: 0 6px 20px rgba(37,99,235,0.4); margin-top: 0.5rem; }
         .question-card { background: white; padding: 1rem; border-radius: 1rem; width: 90%; max-width: 600px; box-shadow: 0 6px 15px rgba(0,0,0,0.1); text-align: left; margin-bottom: 1rem; color: #1f2937; }
         .delete-button { background: linear-gradient(90deg, #ef4444, #dc2626); color: white; padding: 0.5rem 1rem; border-radius: 1.5rem; border: none; cursor: pointer; font-weight: bold; margin-top: 0.5rem; box-shadow: 0 4px 12px rgba(220,38,38,0.4); }
         @media (max-width: 768px) { .cards-container { flex-direction: column; gap: 1rem; } nav button { flex: 1 1 40%; } }
         @media (max-width: 480px) { header { font-size: 1.5rem; padding: 1rem; } nav button { font-size: 0.9rem; padding: 0.6rem 1rem; } }
      `}</style>

      <header>🧑‍🏫 Panel del Profesor</header>

      <nav>
        {/* ... (Tu <nav> está bien) ... */}
         {["dashboard", "students", "questions"].map((tab) => (
           <button
             key={tab}
             className={activeTab === tab ? "active" : "inactive"}
             onClick={() => setActiveTab(tab as any)}
           >
             {tab === "dashboard"
               ? "Inicio"
               : tab === "students"
               ? "Estudiantes"
               : "Preguntas"}
           </button>
         ))}
      </nav>

      <main>
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <h2>Bienvenido al Panel de Control</h2>
              <div className="cards-container">
                <div className="card xp-card">
                  <span>XP Total</span>
                  <span>{xp}</span>
                </div>
                <div className="card students-card">
                  <span>Estudiantes</span>
                   {/* ¡Este studentData.length ya no existe! 
                       Deberías cargar los estudiantes aquí también */}
                  <span>...</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "students" && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <h2>👩‍🎓 Estudiantes</h2>
              <StudentTable />
            </motion.div>
          )}

          {activeTab === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <h2>📝 Gestión de Preguntas</h2>
              <p>Mostrando preguntas para la lección: {CURRENT_LESSON_ID}</p>
              
              {/* --- FORMULARIO DE CREACIÓN (ACTUALIZADO) --- */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Escribe la pregunta (textSource)..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="form-input"
                />
                {newOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Opción ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[i] = e.target.value;
                      setNewOptions(updated);
                    }}
                    className="form-input"
                  />
                ))}
                <input
                  type="text"
                  placeholder="Respuesta correcta (textTarget)"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="form-input"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="add-button"
                  onClick={addQuestion}
                >
                  ➕ Agregar Pregunta
                </motion.button>
              </div>

              {/* --- MOSTRAR ERRORES O CARGA --- */}
              {isLoading && <p>Cargando preguntas...</p>}
              {error && <p style={{ color: 'red' }}>Error: {error}</p>}
              
              {/* --- LISTA DE PREGUNTAS (ACTUALIZADA) --- */}
              {questions.map((q) => (
                <motion.div
                  key={q.id} // <-- Usa el ID de la BD
                  whileHover={{ scale: 1.02 }}
                  className="question-card"
                >
                  <h3>{q.textSource}</h3> {/* <-- Campo actualizado */}
                  <ul>
                    {q.options.map((opt, i) => ( // <-- Campo actualizado
                      <li key={i} style={{
                         fontWeight: q.textTarget === opt ? 'bold' : 'normal',
                         color: q.textTarget === opt ? '#10b981' : 'inherit'
                      }}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                  <p>
                    ✅ <strong>Respuesta:</strong> {q.textTarget} {/* <-- Campo actualizado */}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => deleteQuestion(q.id)} // <-- Usa el ID de la BD
                    className="delete-button"
                  >
                    🗑️ Eliminar
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}