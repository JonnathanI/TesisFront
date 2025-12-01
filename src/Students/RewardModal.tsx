import React from 'react';
import { motion } from 'framer-motion';

interface RewardModalProps {
  xp: number;           // Cantidad de XP ganada
  onClose: () => void;  // Función para cerrar el modal
}

export default function RewardModal({ xp, onClose }: RewardModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          textAlign: 'center',
          width: '300px',
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#10b981' }}>
          🎉 ¡Felicidades! 🎉
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          Has ganado <strong>{xp} XP</strong>
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}
