import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export default function ButtonAnimated({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
      style={{
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        padding: '0.6rem 1.2rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
    >
      {children}
    </motion.button>
  );
}
