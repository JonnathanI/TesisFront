import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Asegúrate de que esta ruta sea correcta según tu estructura
import { QuestionDTO, AnswerSubmissionDTO, submitAnswer } from '../api/auth.service'; 

interface QuizModalProps {
  questions: QuestionDTO[] | null;
  lessonId: string;
  onClose: () => void;
  // Ajustado para recibir el conteo de correctas como número
  onComplete: (correctCount: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ questions, lessonId, onClose, onComplete }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Caso: No hay preguntas
  if (!questions || questions.length === 0) {
    return (
      <div style={modalOverlayStyle}>
        <motion.div style={modalContentStyle} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            Esta lección no tiene preguntas disponibles.
          </p>
          <button onClick={onClose} style={nextButtonStyle}>
            Cerrar
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[qIndex];

  // 2. Caso: Error de carga de pregunta específica
  if (!currentQuestion) {
    return (
      <div style={modalOverlayStyle}>
        <motion.div style={modalContentStyle}>
          <p style={{ color: 'white' }}>Finalizando lección...</p>
          <button onClick={() => onComplete(correctCount)} style={nextButtonStyle}>Continuar</button>
        </motion.div>
      </div>
    );
  }

  const handleOptionClick = async (option: string) => {
    if (isLoading || selectedOption) return; 

    setIsLoading(true);
    setSelectedOption(option);

    const submission: AnswerSubmissionDTO = {
      questionId: currentQuestion.id,
      userAnswer: option, 
    };

    try {
      const result = await submitAnswer(submission);
      setIsCorrect(result.isCorrect);
      if (result.isCorrect) {
        setCorrectCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      setIsCorrect(false); // Por defecto falso si falla la red
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Es vital limpiar los estados antes de pasar a la siguiente
    setSelectedOption(null);
    setIsCorrect(null);

    if (qIndex + 1 >= questions.length) {
      // Si es la última pregunta, enviamos el resultado al Dashboard
      onComplete(correctCount); 
    } else {
      // Si no, avanzamos el índice
      setQIndex(prev => prev + 1); 
    }
  };

  const getOptionStyle = (option: string): React.CSSProperties => {
    if (!selectedOption) return optionStyle;
    
    const isThisOptionSelected = selectedOption === option;
    
    if (isThisOptionSelected) {
      if (isCorrect === true) return { ...optionStyle, ...correctOptionStyle };
      if (isCorrect === false) return { ...optionStyle, ...incorrectOptionStyle };
    }
    
    if (isCorrect !== null) {
      return { ...optionStyle, opacity: 0.5, cursor: 'not-allowed' };
    }
    
    return optionStyle;
  };

  return (
    <div style={modalOverlayStyle}>
      <motion.div 
        style={modalContentStyle} 
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        {/* Barra de Progreso Visual */}
        <div style={progressContainer}>
            <div style={{...progressFill, width: `${((qIndex + 1) / questions.length) * 100}%`}} />
        </div>

        <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '1rem' }}>
            PREGUNTA {qIndex + 1} DE {questions.length}
        </p>

        <h2 style={{ color: '#00FFC2', marginBottom: '2rem', minHeight: '60px' }}>
            {currentQuestion.questionText}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
          {currentQuestion.options.map((option, idx) => (
            <motion.button
              key={`${qIndex}-${idx}`} // Clave única por pregunta e índice
              style={getOptionStyle(option)}
              whileHover={!selectedOption ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.2)' } : {}}
              whileTap={!selectedOption ? { scale: 0.98 } : {}}
              onClick={() => handleOptionClick(option)}
              disabled={selectedOption !== null}
            >
              {option}
            </motion.button>
          ))}
        </div>
        
        {isCorrect !== null && (
          <motion.button
            style={nextButtonStyle}
            onClick={handleNext}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {qIndex + 1 >= questions.length ? 'FINALIZAR LECCIÓN' : 'SIGUIENTE PREGUNTA'}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

// --- ESTILOS ---
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(10, 10, 25, 0.9)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  background: '#1A1A2E', padding: '2.5rem', borderRadius: '1.5rem',
  width: '90%', maxWidth: '450px', textAlign: 'center',
  border: '2px solid #00FFC2', boxShadow: '0 0 20px rgba(0, 255, 194, 0.2)'
};

const progressContainer: React.CSSProperties = {
    width: '100%', height: '8px', background: '#333', 
    borderRadius: '10px', marginBottom: '1.5rem', overflow: 'hidden'
};

const progressFill: React.CSSProperties = {
    height: '100%', background: '#00FFC2', transition: 'width 0.3s ease'
};

const optionStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)', border: '2px solid #444',
  color: 'white', padding: '1.2rem', borderRadius: '1rem',
  fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', 
  width: '100%', transition: 'all 0.2s ease'
};

const correctOptionStyle: React.CSSProperties = {
  background: 'rgba(42, 157, 143, 0.3)', borderColor: '#00FFC2', color: '#00FFC2'
};

const incorrectOptionStyle: React.CSSProperties = {
  background: 'rgba(231, 111, 81, 0.3)', borderColor: '#FF6B6B', color: '#FF6B6B'
};

const nextButtonStyle: React.CSSProperties = {
  marginTop: '2.5rem', background: '#00FFC2', border: 'none',
  borderRadius: '1rem', padding: '1rem 2rem', width: '100%',
  fontWeight: 'bold', cursor: 'pointer', color: '#1A1A2E', fontSize: '1rem'
};