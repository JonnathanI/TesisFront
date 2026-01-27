import React from 'react';
import { removeToken } from '../api/auth.service';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const AdminSidebarDashboard: React.FC<SidebarProps> = ({ 
  activeSection, setActiveSection, isCollapsed, setIsCollapsed 
}) => {
  const menuItems = [
    { id: 'generar', label: 'GENERAR CÓDIGO', icon: '🔑' },
    { id: 'carga', label: 'CARGA MASIVA', icon: '📥' },
    { id: 'roles', label: 'ADMIN ROLES', icon: '👤' },
  ];

  return (
    <div style={{
      width: isCollapsed ? '80px' : '260px',
      height: '100vh',
      backgroundColor: '#131f24',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
      position: 'fixed',
      left: 0,
      top: 0,
      transition: 'width 0.3s ease-in-out',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      {/* Botón para colapsar */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          backgroundColor: '#1cb0f6',
          border: 'none',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          cursor: 'pointer',
          position: 'absolute',
          right: '10px',
          top: '20px',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        {isCollapsed ? '>' : '<'}
      </button>

      {/* Logo o Nombre */}
      <div style={{ padding: '16px', marginBottom: '30px', whiteSpace: 'nowrap' }}>
        <h1 style={{ 
          color: 'white', 
          fontWeight: 900, 
          fontSize: '20px', 
          margin: 0,
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.2s'
        }}>
          EUROPEEK
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            title={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '15px',
              padding: '12px',
              borderRadius: '15px',
              cursor: 'pointer',
              border: activeSection === item.id ? '2px solid #1cb0f6' : '2px solid transparent',
              backgroundColor: activeSection === item.id ? 'rgba(28, 176, 246, 0.1)' : 'transparent',
              color: activeSection === item.id ? '#1cb0f6' : '#afbbbf',
              transition: 'all 0.2s',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {!isCollapsed && (
              <span style={{ fontSize: '12px', fontWeight: 900, whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      <button
        onClick={() => { removeToken(); window.location.href = '/login'; }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: '15px',
          padding: '12px',
          color: '#ff4b4b',
          backgroundColor: 'transparent',
          border: 'none',
          fontWeight: 900,
          marginTop: 'auto',
          cursor: 'pointer'
        }}
      >
        <span>🚪</span>
        {!isCollapsed && <span style={{ fontSize: '12px' }}>CERRAR SESIÓN</span>}
      </button>
    </div>
  );
};