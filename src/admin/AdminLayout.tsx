import React, { useState, useEffect } from "react";
import { AdminSidebarDashboard } from "./AdminSidebarDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { BulkUpload } from "./BulkUpload";

export const AdminLayout = () => {
  const [activeSection, setActiveSection] = useState("generar");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detectar móvil y colapsar automáticamente
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setIsCollapsed(true); // 👈 sidebar oculto en móvil
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "generar":
        return <AdminDashboard />;
      case "carga":
        return <BulkUpload />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] relative">
      {/* Sidebar */}
      <AdminSidebarDashboard
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
      />

      {/* Contenido */}
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile
            ? "0"
            : isCollapsed
            ? "80px"
            : "260px",
        }}
      >
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
