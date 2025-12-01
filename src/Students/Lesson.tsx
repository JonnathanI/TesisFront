import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LessonProps {
  title?: string;
  description?: string;
  onComplete?: () => void; // Función opcional
}

export default function Lesson({ title = 'Título de la lección', description = 'Descripción de la lección', onComplete }: LessonProps) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    if (onComplete) onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: '#f3f4f6',
        padding: '1.5rem',
        borderRadius: '1rem',
        width: '300px',
        margin: '1rem',
        boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>{description}</p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={completed}
        onClick={handleComplete}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: completed ? '#10b981' : '#3b82f6',
          color: 'white',
          border: 'none',
          cursor: completed ? 'default' : 'pointer',
          fontWeight: 'bold',
          alignSelf: 'flex-end',
        }}
      >
        {completed ? 'Completada ✅' : 'Completar'}
      </motion.button>

      {completed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            backgroundColor: '#facc15',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          ⭐
        </motion.div>
      )}
    </motion.div>
  );
}
