import React from 'react';
import { motion } from 'framer-motion';

interface XPBadgeProps {
  xp: number;
}

export default function XPBadge({ xp }: XPBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 120 }}
      style={{
        display: 'inline-block',
        padding: '0.5rem 1rem',
        borderRadius: '1rem',
        backgroundColor: '#fcd34d',
        color: 'black',
        fontWeight: 'bold',
        fontSize: '1rem',
      }}
    >
      XP: {xp}
    </motion.div>
  );
}
