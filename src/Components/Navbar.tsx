import React from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '1rem 2rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Duolingo Clone</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={buttonStyle}>Inicio</button>
          <button style={buttonStyle}>Perfil</button>
          <button style={buttonStyle}>Cerrar sesión</button>
        </div>
      </motion.nav>
    </>
  );
}

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'color 0.3s',
};

