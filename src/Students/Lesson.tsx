import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Definimos la interfaz con "?" para que TypeScript no de error en AppRoutes
interface LessonProps {
  title?: string;
  description?: string;
  onComplete?: () => void;
  heartsCount?: number;             // Opcional para evitar error TS2739
  nextHeartRegenTime?: string | null; // Opcional
  onFetchUpdate?: () => void;        // Opcional
}

export default function Lesson({ 
  title = "Lección", 
  description = "Completa los ejercicios para ganar XP", 
  onComplete, 
  heartsCount = 5,                  // Valor por defecto si no se recibe
  nextHeartRegenTime = null,
  onFetchUpdate = () => {}          // Función vacía por defecto
}: LessonProps) {
  const [completed, setCompleted] = useState(false);
  const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);
  const [heartTimer, setHeartTimer] = useState<string>("");

  // Lógica del Cronómetro interna para el modal de "Sin Vidas"
  useEffect(() => {
    // Solo activar cronómetro si realmente no hay vidas y hay un tiempo de recarga
    if (heartsCount > 0 || !nextHeartRegenTime) {
      setHeartTimer("");
      return;
    }

    const timer = setInterval(() => {
      const target = new Date(nextHeartRegenTime).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        onFetchUpdate(); // Al llegar a cero, intenta recuperar vida llamando al padre
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setHeartTimer(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [heartsCount, nextHeartRegenTime, onFetchUpdate]);

  const handleStartLesson = () => {
    if (heartsCount <= 0) {
      // Si el usuario intenta entrar y tiene 0 vidas, abrimos el modal
      setShowNoHeartsModal(true); 
    } else {
      // Lógica normal para iniciar la lección
      setCompleted(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.2rem',
          width: '300px', margin: '1rem', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', border: '2px solid #e5e5e5'
        }}
      >
        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem', color: '#4b4b4b' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#777', marginBottom: '1.5rem', flexGrow: 1 }}>
          {description}
        </p>

        <motion.button
          whileHover={heartsCount > 0 ? { scale: 1.02, translateY: -2 } : {}}
          whileTap={heartsCount > 0 ? { scale: 0.98 } : {}}
          onClick={handleStartLesson}
          style={{
            padding: '0.8rem', borderRadius: '0.8rem',
            backgroundColor: heartsCount === 0 ? '#e5e5e5' : (completed ? '#58cc02' : '#1cb0f6'),
            color: heartsCount === 0 ? '#afafaf' : 'white',
            border: 'none', cursor: heartsCount === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '900', fontSize: '1rem',
            boxShadow: heartsCount === 0 ? 'none' : `0 4px 0 ${completed ? '#46a302' : '#1899d6'}`,
            transition: 'background-color 0.2s'
          }}
        >
          {completed ? 'REPASAR ✅' : (heartsCount === 0 ? 'SIN VIDAS 💔' : 'EMPEZAR')}
        </motion.button>
      </motion.div>

      {/* MODAL DE BLOQUEO "SIN VIDAS" */}
      <AnimatePresence>
        {showNoHeartsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={modalOverlayStyle}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              style={modalContentStyle}
            >
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '4rem' }}>💔</span>
              </div>
              
              <h2 style={{ fontWeight: '900', color: '#3c3c3c', marginBottom: '0.5rem' }}>
                ¡Te quedaste sin vidas!
              </h2>
              <p style={{ color: '#777', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                Necesitas al menos un corazón para comenzar esta lección. Practica anteriores o espera a que se recarguen.
              </p>
              
              <div style={timerBoxStyle}>
                <p style={{ fontSize: '0.75rem', color: '#afafaf', margin: 0, fontWeight: 'bold' }}>
                  PRÓXIMA VIDA EN
                </p>
                <span style={{ fontSize: '2rem', color: '#ff4b4b', fontWeight: '900' }}>
                  {heartTimer || "Calculando..."}
                </span>
              </div>

              <button 
                onClick={() => setShowNoHeartsModal(false)}
                style={closeButtonStyle}
              >
                ENTENDIDO
              </button>

              <button 
                onClick={() => setShowNoHeartsModal(false)}
                style={{ background: 'none', border: 'none', color: '#1cb0f6', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer' }}
              >
                IR A LA TIENDA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- ESTILOS ---
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
  backdropFilter: 'blur(4px)'
};

const modalContentStyle: React.CSSProperties = {
  background: 'white', padding: '2.5rem', borderRadius: '2rem', textAlign: 'center', 
  width: '90%', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
};

const timerBoxStyle: React.CSSProperties = {
  margin: '1.5rem 0', padding: '1rem', background: '#f7f7f7', borderRadius: '1rem', border: '2px solid #eee'
};

const closeButtonStyle: React.CSSProperties = {
  width: '100%', padding: '1rem', background: '#1cb0f6', color: 'white', border: 'none', 
  borderRadius: '1rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 5px 0 #1899d6',
  fontSize: '1.1rem'
};