import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QuestionDTO, AnswerSubmissionDTO, submitAnswer } from '../api/auth.service';

interface QuizModalProps {
  questions: QuestionDTO[] | null;
  lessonId: string;
  onClose: () => void;
  onComplete: (correctCount: number) => void;
}

// Configuración de reconocimiento de voz
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export const QuizModal: React.FC<QuizModalProps> = ({ questions, lessonId, onClose, onComplete }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // Para el micrófono

  if (!questions || questions.length === 0) return null; // ... (mantener lógica de carga anterior)

  const currentQuestion = questions[qIndex];

  // --- FUNCIONES MULTIMEDIA ---
  const playAudio = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
  };

  const startListening = () => {
    if (!recognition) return alert("Navegador no compatible con voz");
    setIsRecording(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleOptionClick(transcript); // Enviamos lo que dijo como respuesta
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
  };

  // --- LÓGICA DE ENVÍO ---
  const handleOptionClick = async (answer: string) => {
    if (isLoading || selectedOption) return;
    setIsLoading(true);
    setSelectedOption(answer);

    const submission: AnswerSubmissionDTO = {
      questionId: currentQuestion.id,
      userAnswer: answer,
    };

    try {
      const result = await submitAnswer(submission);
      setIsCorrect(result.isCorrect);
      if (result.isCorrect) setCorrectCount(prev => prev + 1);
    } catch (error) {
      console.error(error);
      setIsCorrect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    if (qIndex + 1 >= questions.length) onComplete(correctCount);
    else setQIndex(prev => prev + 1);
  };

  // --- RENDERIZADO DINÁMICO SEGÚN CATEGORÍA ---
  const renderContent = () => {
    switch (currentQuestion.category) {
      case 'IMAGE_SELECT':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {currentQuestion.options.map((opt, idx) => (
              <motion.div
                key={idx}
                onClick={() => handleOptionClick(opt)}
                style={getOptionStyle(opt)}
                whileHover={{ scale: 1.05 }}
              >
                <img src={opt} alt="opcion" style={{ width: '100%', height: '100px', objectFit: 'contain' }} />
              </motion.div>
            ))}
          </div>
        );

      case 'LISTENING':
        return (
          <div style={{ textAlign: 'center' }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => playAudio(currentQuestion.textSource)}
              style={audioButtonStyle}
            >
              🔊 Escuchar
            </motion.button>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQuestion.options.map((opt, idx) => (
                <button key={idx} onClick={() => handleOptionClick(opt)} style={getOptionStyle(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case 'SPEAKING':
        return (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#00FFC2', fontSize: '1.5rem', fontWeight: 'bold' }}>"{currentQuestion.textSource}"</p>
            <motion.button
              animate={isRecording ? { scale: [1, 1.1, 1], boxShadow: '0 0 20px #ff4b4b' } : {}}
              transition={{ repeat: Infinity }}
              onClick={startListening}
              style={{ ...audioButtonStyle, background: isRecording ? '#ff4b4b' : '#00FFC2', color: '#1A1A2E' }}
            >
              {isRecording ? '🛑 Escuchando...' : '🎤 Toca para hablar'}
            </motion.button>
            {selectedOption && <p style={{color: 'white', marginTop: '10px'}}>Dijiste: {selectedOption}</p>}
          </div>
        );

      default: // GRAMMAR, VOCABULARY o Texto normal
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                style={getOptionStyle(option)}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );
    }
  };

  // --- ESTILOS DINÁMICOS ---
  const getOptionStyle = (option: string): React.CSSProperties => {
    const base = { ...optionStyle };
    if (selectedOption === option) {
      if (isCorrect === true) return { ...base, ...correctOptionStyle };
      if (isCorrect === false) return { ...base, ...incorrectOptionStyle };
    }
    if (selectedOption && selectedOption !== option) return { ...base, opacity: 0.5 };
    return base;
  };

  return (
    <div style={modalOverlayStyle}>
      <motion.div style={modalContentStyle} initial={{ y: 50 }} animate={{ y: 0 }}>
        <div style={progressContainer}>
          <div style={{ ...progressFill, width: `${((qIndex + 1) / questions.length) * 100}%` }} />
        </div>
        
        <h2 style={{ color: '#00FFC2', marginBottom: '2rem' }}>
          {currentQuestion.questionText}
        </h2>

        {renderContent()}

        {isCorrect !== null && (
          <motion.button style={nextButtonStyle} onClick={handleNext} initial={{ y: 20 }} animate={{ y: 0 }}>
            {qIndex + 1 >= questions.length ? 'TERMINAR' : 'CONTINUAR'}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

// --- ESTILOS EXTRA ---
const audioButtonStyle: React.CSSProperties = {
  background: '#1cb0f6', color: 'white', border: 'none', borderRadius: '15px',
  padding: '15px 30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
  boxShadow: '0 4px 0 #1899d6'
};

// ... (Copia aquí tus otros estilos: modalOverlayStyle, modalContentStyle, etc.)
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