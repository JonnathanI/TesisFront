import React from 'react';
import { removeToken } from '../api/auth.service';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

export const AdminSidebarDashboard: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'generar', label: 'GENERAR CÓDIGO', icon: '🔑' },
    { id: 'carga', label: 'CARGA MASIVA', icon: '📥' },
    { id: 'roles', label: 'ADMIN ROLES', icon: '👤' },
  ];
  return (
    <div style={{
      width: '260px', height: '100vh', backgroundColor: '#131f24', 
      borderRight: '1px solid #37464f', display: 'flex', flexDirection: 'column',
      padding: '24px 16px', position: 'fixed', left: 0, top: 0, boxSizing: 'border-box'
    }}>
      <div style={{ padding: '16px', marginBottom: '30px' }}>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '24px', letterSpacing: '2px', margin: 0 }}>EUROPEEK</h1>
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
              fontWeight: 900, outline: 'none'
            }}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: '13px' }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={() => { removeToken(); window.location.href = '/login'; }}
        style={{
          display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px',
          borderRadius: '15px', cursor: 'pointer', color: '#ff4b4b',
          backgroundColor: 'transparent', border: 'none', fontWeight: 900, marginTop: 'auto'
        }}
      >
        <span>🚪</span>
        <span>CERRAR SESIÓN</span>
      </button>
    </div>
  );
};