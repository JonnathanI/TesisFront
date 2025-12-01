import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lesson from './Lesson';
import RewardModal from './RewardModal';

interface LevelMapProps {
  skillTitle: string;
}

export default function LevelMap({ skillTitle }: LevelMapProps) {
  const [xp, setXp] = useState(0);
  const [showReward, setShowReward] = useState(false);

  const lessons = [
    { title: 'Lección 1', description: 'Palabras básicas', color: '#3b82f6' },
    { title: 'Lección 2', description: 'Saludos', color: '#10b981' },
    { title: 'Lección 3', description: 'Frases comunes', color: '#f59e0b' },
    { title: 'Lección 4', description: 'Números y colores', color: '#ef4444' },
  ];

  const handleCompleteLesson = () => {
    setXp((prev) => prev + 25);
    setShowReward(true);
  };

  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#fef3c7',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111827' }}>
        {skillTitle}
      </h1>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {lessons.map((lesson) => (
          <motion.div
            key={lesson.title}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: lesson.color,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
            onClick={handleCompleteLesson}
          >
            <span style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{lesson.title}</span>
            <span style={{ fontSize: '0.9rem' }}>{lesson.description}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        style={{
          marginTop: '2rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        XP Total: {xp}
      </motion.div>

      {showReward && (
        <RewardModal xp={25} onClose={() => setShowReward(false)} />
      )}
    </div>
  );
}
