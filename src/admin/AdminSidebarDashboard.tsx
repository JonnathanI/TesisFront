import React from "react";
import { removeToken } from "../api/auth.service";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  // 👇 nuevas props opcionales para colapsar
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
}

export const AdminSidebarDashboard: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  isCollapsed = false,
  setIsCollapsed,
}) => {
  // --- LISTA DE MENÚ ---
  const menuItems = [
    { id: "roles", label: "USUARIOS Y ROLES", icon: "👤" },
    { id: "generar", label: "GENERAR CÓDIGO", icon: "🔑" },
    { id: "carga", label: "CARGA MASIVA", icon: "📥" },
    { id: "cursos", label: "CURSOS", icon: "📚" }, // ✅ NUEVA OPCIÓN
  ];

  const sidebarWidth = isCollapsed ? "80px" : "260px";

  return (
    <div
      style={{
        width: sidebarWidth,
        height: "100vh",
        backgroundColor: "#131f24",
        borderRight: "1px solid #37464f",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        position: "fixed",
        left: 0,
        top: 0,
        boxSizing: "border-box",
        transition: "width 0.2s ease",
      }}
    >
      {/* CABECERA / LOGO + BOTÓN COLAPSAR */}
      <div
        style={{
          padding: "16px 8px",
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          gap: 8,
        }}
      >
        <div>
          <h1
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: isCollapsed ? "20px" : "24px",
              letterSpacing: "2px",
              margin: 0,
              textAlign: isCollapsed ? "center" : "left",
            }}
          >
            {isCollapsed ? "E" : "EUROPEEK"}
          </h1>
          {!isCollapsed && (
            <small
              style={{
                color: "#52656d",
                fontWeight: 800,
                fontSize: "10px",
              }}
            >
              PANEL ADMIN
            </small>
          )}
        </div>

        {/* Botón para colapsar / expandir (solo si nos pasaron el setter) */}
        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              border: "none",
              background: "transparent",
              color: "#afbbbf",
              cursor: "pointer",
              fontSize: 18,
            }}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? "»" : "«"}
          </button>
        )}
      </div>

      {/* MENÚ */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
        }}
      >
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isCollapsed ? 0 : 15,
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: "12px 20px",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "all 0.1s",
                border: isActive
                  ? "2px solid #1cb0f6"
                  : "2px solid transparent",
                backgroundColor: isActive
                  ? "rgba(28, 176, 246, 0.1)"
                  : "transparent",
                color: isActive ? "#1cb0f6" : "#afbbbf",
                fontWeight: 900,
                outline: "none",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {!isCollapsed && (
                <span
                  style={{ fontSize: "12px", letterSpacing: "0.5px" }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* CERRAR SESIÓN */}
      <div
        style={{
          borderTop: "2px solid #37464f",
          paddingTop: "20px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => {
            removeToken();
            window.location.href = "/login";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: isCollapsed ? 0 : "15px",
            justifyContent: isCollapsed ? "center" : "flex-start",
            padding: "12px 20px",
            width: "100%",
            borderRadius: "15px",
            cursor: "pointer",
            color: "#ff4b4b",
            backgroundColor: "transparent",
            border: "none",
            fontWeight: 900,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              "rgba(255, 75, 75, 0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <span>🚪</span>
          {!isCollapsed && (
            <span style={{ fontSize: "12px" }}>CERRAR SESIÓN</span>
          )}
        </button>
      </div>
    </div>
  );
};
