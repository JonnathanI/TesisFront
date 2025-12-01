import React from 'react';
import { motion } from 'framer-motion';

export default function StatsChart() {
  const stats = [
    { name: 'Completadas', value: 80, color: '#3b82f6' },
    { name: 'En progreso', value: 15, color: '#f59e0b' },
    { name: 'Pendientes', value: 5, color: '#ef4444' },
  ];

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '1rem', flex: 1 }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>Estadísticas de la clase</h2>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-around' }}>
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            initial={{ height: 0 }}
            animate={{ height: `${stat.value}%` }}
            transition={{ duration: 1 }}
            style={{
              width: '80px',
              backgroundColor: stat.color,
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              color: 'white',
              fontWeight: 'bold',
              paddingBottom: '0.5rem',
            }}
          >
            {stat.value}%
          </motion.div>
        ))}
      </div>
    </div>
  );
}
