// QuizModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Ajusta la ruta a tu archivo apiClient.ts
import { QuestionDTO, AnswerSubmissionDTO, submitAnswer } from '../api/auth.service'; 

interface QuizModalProps {
  questions: QuestionDTO[] | null;
  lessonId: string;
  onClose: () => void;
  onComplete: (lessonId: string, correctCount: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ questions, lessonId, onClose, onComplete }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!questions) {
    return (
      <div style={modalOverlayStyle}>
        <motion.div style={modalContentStyle}>
          <p style={{color: 'white', fontSize: '1.2rem'}}>Cargando preguntas...</p>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[qIndex];

  const handleOptionClick = async (option: string) => {
    if (isLoading || selectedOption) return; // Evitar clics múltiples

    setIsLoading(true);
    setSelectedOption(option);

    const submission: AnswerSubmissionDTO = {
      questionId: currentQuestion.id,
      userAnswer: option, // Tu backend espera 'userAnswer'
    };

    try {
      const result = await submitAnswer(submission);
      setIsCorrect(result.isCorrect);
      if (result.isCorrect) {
        setCorrectCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      setIsCorrect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Limpiar estados
    setSelectedOption(null);
    setIsCorrect(null);

    // ¿Es la última pregunta?
    if (qIndex + 1 >= questions.length) {
      onComplete(lessonId, correctCount); // ¡Lección completada!
    } else {
      setQIndex(qIndex + 1); // Siguiente pregunta
    }
  };

  const getOptionStyle = (option: string): React.CSSProperties => {
    if (!selectedOption) return optionStyle;
    
    const isThisOptionSelected = selectedOption === option;
    
    if (isThisOptionSelected && isCorrect === true) {
      return { ...optionStyle, ...correctOptionStyle };
    }
    if (isThisOptionSelected && isCorrect === false) {
      return { ...optionStyle, ...incorrectOptionStyle };
    }
    // Si no está seleccionada pero se mostró un resultado, atenuarla
    if (!isThisOptionSelected && isCorrect !== null) {
      return { ...optionStyle, opacity: 0.6, cursor: 'not-allowed' };
    }
    return optionStyle;
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <motion.div 
        style={modalContentStyle} 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 style={{ color: '#00FFC2', marginBottom: '2rem' }}>{currentQuestion.questionText}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {currentQuestion.options.map((option, idx) => (
            <motion.button
              key={idx}
              style={getOptionStyle(option)}
              whileHover={{ scale: selectedOption ? 1 : 1.05 }}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {qIndex + 1 >= questions.length ? 'Finalizar' : 'Siguiente'}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

// Estilos
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
};
const modalContentStyle: React.CSSProperties = {
  background: '#1A1A2E', padding: '2rem', borderRadius: '1rem',
  width: '90%', maxWidth: '500px', textAlign: 'center',
  border: '1px solid #00FFC2'
};
const optionStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)', border: '2px solid #555',
  color: 'white', padding: '1rem', borderRadius: '0.75rem',
  fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%'
};
const correctOptionStyle: React.CSSProperties = {
  background: '#2a9d8f', borderColor: '#00FFC2', color: 'white'
};
const incorrectOptionStyle: React.CSSProperties = {
  background: '#e76f51', borderColor: '#FF6B6B', color: 'white'
};
const nextButtonStyle: React.CSSProperties = {
  marginTop: '2rem', background: '#00FFC2', border: 'none',
  borderRadius: '0.75rem', padding: '0.75rem 1.5rem',
  fontWeight: 'bold', cursor: 'pointer', color: '#111'
};