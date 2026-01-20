import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QuestionDTO, 
  AnswerSubmissionDTO, 
  submitAnswer, 
  completeLesson 
} from '../api/auth.service';

interface QuizModalProps {
  questions: QuestionDTO[] | null;
  lessonId: string;
  onClose: () => void;
  onComplete: (correctCount: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ questions, lessonId, onClose, onComplete }) => {
  // --- ESTADOS DE PROGRESO ---
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // --- ESTADOS DE PREGUNTA ACTUAL ---
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. EFECTO: CARGAR PROGRESO AL INICIAR
  useEffect(() => {
    const savedProgress = localStorage.getItem(`lesson_progress_${lessonId}`);
    if (savedProgress && questions) {
      const { lastIndex, savedScore } = JSON.parse(savedProgress);
      // Solo cargamos si no habíamos terminado la lección
      if (lastIndex < questions.length) {
        setQIndex(lastIndex);
        setCorrectCount(savedScore);
      }
    }
  }, [lessonId, questions]);

  if (!questions || questions.length === 0) return null;
  const currentQuestion = questions[qIndex];

  // 2. FUNCIÓN: GUARDAR PROGRESO EN LOCALSTORAGE
  const saveProgressToLocal = (nextIndex: number, currentScore: number) => {
    const data = { lastIndex: nextIndex, savedScore: currentScore };
    localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify(data));
  };

  const handleCheck = async () => {
    if (isLoading || !selectedOption || isAnswered) return;
    setIsLoading(true);

    try {
      const submission: AnswerSubmissionDTO = {
        questionId: currentQuestion.id,
        userAnswer: selectedOption,
      };
      const result = await submitAnswer(submission);
      const correct = result.isCorrect;

      setIsCorrect(correct);
      setIsAnswered(true);

      if (correct) {
        const newScore = correctCount + 1;
        setCorrectCount(newScore);
        // Guardamos el progreso inmediatamente después de contestar
        saveProgressToLocal(qIndex, newScore); 
      }
    } catch (error) {
        // Fallback local...
        setIsAnswered(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const nextIndex = qIndex + 1;

    if (nextIndex >= questions.length) {
      setIsLoading(true);
      try {
        await completeLesson(lessonId, correctCount);
        localStorage.removeItem(`lesson_progress_${lessonId}`); // Limpiar al terminar
        setIsFinished(true);
      } catch (error) {
        setIsFinished(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Avanzar y actualizar el guardado
      setQIndex(nextIndex);
      saveProgressToLocal(nextIndex, correctCount); 
      setSelectedOption(null);
      setIsCorrect(null);
      setIsAnswered(false);
    }
  };

  // --- VISTA DE RESUMEN ---
  if (isFinished) {
    return (
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          <h2 style={{ color: '#ffc800' }}>¡LECCIÓN COMPLETADA!</h2>
          <p style={{ color: 'white' }}>Puntaje final: {correctCount}</p>
          <button onClick={() => onComplete(correctCount)} style={nextButtonStyle}>VOLVER AL INICIO</button>
        </div>
      </div>
    );
  }

  return (
    <div style={modalOverlayStyle}>
      <motion.div style={modalContentStyle} initial={{ y: 50 }} animate={{ y: 0 }}>
        
        {/* CABECERA: La X ahora solo cierra el modal (onClose) */}
        <div style={headerLayout}>
           <button onClick={onClose} style={exitButtonStyle}>✕</button>
           <div style={progressContainer}>
             <div style={{ ...progressFill, width: `${((qIndex + 1) / questions.length) * 100}%` }} />
           </div>
        </div>

        <h2 style={{ color: '#00FFC2' }}>{currentQuestion.textSource}</h2>

        {/* CONTENIDO DE PREGUNTA (Opciones) */}
        <div style={{ padding: '1rem' }}>
          {currentQuestion.options.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => !isAnswered && setSelectedOption(opt)}
              style={{
                ...optionStyle,
                background: selectedOption === opt ? '#1cb0f6' : 'transparent',
                color: selectedOption === opt ? 'white' : 'white',
                opacity: isAnswered && selectedOption !== opt ? 0.5 : 1
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* FOOTER: PERSISTENTE */}
        <div style={footerContainer}>
          <AnimatePresence mode="wait">
            {!isAnswered ? (
              <button 
                disabled={!selectedOption || isLoading} 
                onClick={handleCheck}
                style={{...nextButtonStyle, background: selectedOption ? '#58cc02' : '#333'}}
              >
                {isLoading ? 'VERIFICANDO...' : 'COMPROBAR'}
              </button>
            ) : (
              <motion.div initial={{ y: 50 }} animate={{ y: 0 }} style={{...feedbackPanel, background: isCorrect ? '#d7ffb8' : '#ffdfe0'}}>
                <h3 style={{color: isCorrect ? '#58a700' : '#ea2b2b', margin: 0}}>
                    {isCorrect ? '¡Muy bien!' : 'Incorrecto'}
                </h3>
                <button onClick={handleNext} style={nextButtonStyle}>CONTINUAR</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// --- ESTILOS (Resumidos) ---
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(10,10,25,0.98)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { background: '#1A1A2E', padding: '2rem', borderRadius: '2rem', width: '95%', maxWidth: '500px', height: '85vh', position: 'relative', overflow: 'hidden' };
const headerLayout: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' };
const exitButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#666', fontSize: '1.8rem', cursor: 'pointer' };
const progressContainer: React.CSSProperties = { flex: 1, height: '12px', background: '#333', borderRadius: '10px', overflow: 'hidden' };
const progressFill: React.CSSProperties = { height: '100%', background: '#00FFC2', transition: 'width 0.3s ease' };
const footerContainer: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, width: '100%' };
const feedbackPanel: React.CSSProperties = { padding: '1.5rem', textAlign: 'center' };
const optionStyle: React.CSSProperties = { border: '2px solid #444', padding: '1rem', borderRadius: '1rem', width: '100%', marginBottom: '0.5rem', cursor: 'pointer' };
const nextButtonStyle: React.CSSProperties = { border: 'none', borderRadius: '1rem', padding: '1.2rem', width: '90%', margin: '1rem auto', fontWeight: 'bold', cursor: 'pointer', display: 'block' };