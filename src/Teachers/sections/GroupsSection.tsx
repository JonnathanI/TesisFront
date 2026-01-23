import React from 'react';

// 1. Actualizamos la interfaz para incluir onRefresh
interface Props {
  groups?: any[];
  onRefresh?: () => void; // ✅ Definimos que puede recibir una función
}

export const GroupsSection = ({ groups = [], onRefresh }: Props) => {
  
  if (!groups || groups.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        <p style={{ fontSize: '18px' }}>No hay grupos creados todavía.</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            style={{
              background: '#1cb0f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Actualizar lista
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#3c3c3c' }}>Mis Grupos</h2>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            title="Recargar grupos"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
          >
            🔄
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {groups.map((group) => (
          <div 
            key={group.id} 
            style={{
              padding: '20px',
              background: '#fff',
              borderRadius: '15px',
              border: '2px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{ fontSize: '30px' }}>👥</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#3c3c3c' }}>
                {group.name}
              </div>
              <div style={{ fontSize: '14px', color: '#afafaf', fontWeight: 'bold' }}>
                CÓDIGO: {group.code || '---'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};