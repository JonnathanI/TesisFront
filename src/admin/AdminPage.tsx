import React, { useState } from 'react';
import { AdminSidebarDashboard } from './AdminSidebarDashboard';
import { AdminDashboard } from './AdminDashboard';
import { BulkUpload } from './BulkUpload';

export const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('generar');
  const [isCollapsed, setIsCollapsed] = useState(false); // <-- Añadir esto

  const renderContent = () => {
    switch (activeSection) {
      case 'generar': return <AdminDashboard />;
      case 'carga': return <BulkUpload />;
      case 'roles': return <div className="p-8"><h2>Sección de Roles</h2></div>;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar con las nuevas propiedades */}
      <AdminSidebarDashboard 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* El margen cambia según si el sidebar está contraído o no */}
      <main style={{ 
        marginLeft: isCollapsed ? '80px' : '260px', 
        flex: 1, 
        transition: 'margin-left 0.3s ease' 
      }}>
        {renderContent()}
      </main>
    </div>
  );
};