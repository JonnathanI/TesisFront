import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  name: string;
  icon?: React.ReactNode;
}

export default function Badge({ name, icon }: BadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fbbf24',
        color: 'white',
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        margin: '0.5rem',
        textAlign: 'center',
        fontWeight: 'bold'
      }}
    >
      {icon && <div style={{ fontSize: '2rem' }}>{icon}</div>}
      <span style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{name}</span>
    </motion.div>
  );
}
