import React from 'react';
import { removeToken } from '../api/auth.service';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

export const AdminSidebarDashboard: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  // --- LISTA DE MENÚ SIN OPCIÓN DE ESTUDIANTES ---
  const menuItems = [
    { id: 'roles', label: 'USUARIOS Y ROLES', icon: '👤' }, // Movido al principio por relevancia
    { id: 'generar', label: 'GENERAR CÓDIGO', icon: '🔑' },
    { id: 'carga', label: 'CARGA MASIVA', icon: '📥' },
  ];

  return (
    <div style={{
      width: '260px', height: '100vh', backgroundColor: '#131f24', 
      borderRight: '1px solid #37464f', display: 'flex', flexDirection: 'column',
      padding: '24px 16px', position: 'fixed', left: 0, top: 0, boxSizing: 'border-box'
    }}>
      <div style={{ padding: '16px', marginBottom: '30px' }}>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '24px', letterSpacing: '2px', margin: 0 }}>EUROPEEK</h1>
        <small style={{ color: '#52656d', fontWeight: 800, fontSize: '10px' }}>PANEL ADMIN</small>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px',
              borderRadius: '15px', cursor: 'pointer', transition: 'all 0.1s',
              border: activeSection === item.id ? '2px solid #1cb0f6' : '2px solid transparent',
              backgroundColor: activeSection === item.id ? 'rgba(28, 176, 246, 0.1)' : 'transparent',
              color: activeSection === item.id ? '#1cb0f6' : '#afbbbf',
              fontWeight: 900, outline: 'none', textAlign: 'left'
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span style={{ fontSize: '12px', letterSpacing: '0.5px' }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ borderTop: '2px solid #37464f', paddingTop: '20px', marginTop: '20px' }}>
        <button
          onClick={() => { removeToken(); window.location.href = '/login'; }}
          style={{
            display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px',
            width: '100%', borderRadius: '15px', cursor: 'pointer', color: '#ff4b4b',
            backgroundColor: 'transparent', border: 'none', fontWeight: 900, transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 75, 75, 0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span>🚪</span>
          <span style={{ fontSize: '12px' }}>CERRAR SESIÓN</span>
        </button>
      </div>
    </div>
  );
};