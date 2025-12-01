import React from 'react';
import { motion } from 'framer-motion';

interface CardLevelProps {
  level: number;
  unlocked: boolean;
  onClick?: () => void;
}

export default function CardLevel({ level, unlocked, onClick }: CardLevelProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ opacity: unlocked ? 1 : 0.5 }}
      transition={{ duration: 0.3 }}
      onClick={unlocked ? onClick : undefined}
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        color: 'white',
        cursor: unlocked ? 'pointer' : 'not-allowed',
        margin: '0.5rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        background: unlocked 
          ? 'linear-gradient(135deg, #22c55e, #3b82f6)' 
          : 'linear-gradient(135deg, #9ca3af, #6b7280)'
      }}
    >
      Nivel {level}
    </motion.div>
  );
}
