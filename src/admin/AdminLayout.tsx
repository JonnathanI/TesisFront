import React, { useState } from 'react';
import { AdminSidebarDashboard } from './AdminSidebarDashboard';
import { AdminDashboard } from './AdminDashboard';
import { BulkUpload } from './BulkUpload';

export const AdminLayout = () => {
  const [activeSection, setActiveSection] = useState('generar');
  const [isCollapsed, setIsCollapsed] = useState(false); // Nuevo estado

  const renderContent = () => {
    switch (activeSection) {
      case 'generar': return <AdminDashboard />;
      case 'carga': return <BulkUpload />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F2F5]">
      <AdminSidebarDashboard 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* El margen cambia dinámicamente: 260px si está expandido, 80px si está colapsado */}
      <main 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? '80px' : '260px' }}
      >
        <div className="max-w-5xl mx-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};