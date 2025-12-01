import React from 'react';
import { motion } from 'framer-motion';

const menuItems = ["Level Map", "Lecciones", "Recompensas", "Perfil"];

export default function Sidebar() {
  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '200px',
        backgroundColor: '#1f2937',
        color: 'white',
        minHeight: '100vh',
        padding: '2rem 1rem'
      }}
    >
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Menú</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menuItems.map(item => (
          <li
            key={item}
            style={{ marginBottom: '1rem', cursor: 'pointer', transition: 'color 0.3s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#facc15')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
          >
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
