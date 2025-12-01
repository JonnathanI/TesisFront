import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ButtonAnimated from '../Components/ButtonAnimated';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #ff9966, #ff5e62)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Número 404 animado con rotación */}
      <motion.h1
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{ fontSize: '6rem', fontWeight: 'bold', marginBottom: '1rem' }}
      >
        404
      </motion.h1>

      {/* Texto explicativo con fade-in */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ fontSize: '1.5rem', marginBottom: '2rem' }}
      >
        ¡Ups! La página que buscas no existe.
      </motion.p>

      {/* Botón para volver al inicio */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <ButtonAnimated onClick={() => navigate('/')}>Volver al inicio</ButtonAnimated>
      </motion.div>
    </motion.div>
  );
}
