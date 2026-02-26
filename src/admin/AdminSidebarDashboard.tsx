import React from "react";
import { removeToken } from "../api/auth.service";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
  isMobile?: boolean;
}

export const AdminSidebarDashboard: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  isCollapsed = false,
  setIsCollapsed,
  isMobile = false,
}) => {

  const menuItems = [
    { id: "roles", label: "Usuarios y Roles", icon: "👤" },
    { id: "generar", label: "Generar Código", icon: "🔑" },
    { id: "carga", label: "Carga Masiva", icon: "📥" },
    { id: "cursos", label: "Cursos", icon: "📚" },
  ];

  return (
    <>
      {/* Overlay móvil */}
      {isMobile && !isCollapsed && (
        <div
          onClick={() => setIsCollapsed?.(true)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1500,
            backdropFilter: "blur(2px)"
          }}
        />
      )}

      {/* BOTÓN MÓVIL ÚNICO */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed?.(!isCollapsed)}
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: 3000,
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            border: "none",
            background: "#1cb0f6",
            color: "white",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            transition: "all 0.2s ease"
          }}
        >
          {isCollapsed ? "☰" : "✕"}
        </button>
      )}

      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isMobile ? "240px" : (isCollapsed ? "80px" : "260px"),
          height: "100vh",
          background: "#131f24",
          padding: "20px 15px",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          transform:
            isMobile && isCollapsed
              ? "translateX(-100%)"
              : "translateX(0)",
          zIndex: 2000,
          boxShadow:
            isMobile && !isCollapsed
              ? "0 0 40px rgba(0,0,0,0.6)"
              : "none",
        }}
      >

        {/* HEADER */}
        <div
          style={{
            marginBottom: 30,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                color: "white",
                fontSize: isCollapsed && !isMobile ? 18 : 22,
                margin: 0,
                fontWeight: 900,
                letterSpacing: 2
              }}
            >
              {isCollapsed && !isMobile ? "E" : "EUROPEEK"}
            </h1>

            {!isCollapsed && (
              <small
                style={{
                  color: "#7a8b93",
                  fontWeight: 700,
                  fontSize: 11
                }}
              >
                PANEL ADMIN
              </small>
            )}
          </div>
        </div>

        {/* MENU */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          {menuItems.map((item) => {

            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (isMobile) setIsCollapsed?.(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isCollapsed && !isMobile ? 0 : 15,
                  justifyContent:
                    isCollapsed && !isMobile
                      ? "center"
                      : "flex-start",
                  padding: "14px",
                  borderRadius: 12,
                  border: active
                    ? "2px solid #1cb0f6"
                    : "2px solid transparent",
                  background: active
                    ? "rgba(28,176,246,0.15)"
                    : "transparent",
                  color: active
                    ? "#1cb0f6"
                    : "#c7d1d6",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {item.icon}
                </span>

                {!isCollapsed || isMobile ? item.label : null}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div
          style={{
            borderTop: "1px solid #37464f",
            paddingTop: 20
          }}
        >
          <button
            onClick={() => {
              removeToken();
              window.location.href="/login";
            }}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: "transparent",
              color: "#ff4b4b",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 15,
              justifyContent:
                isCollapsed && !isMobile
                  ? "center"
                  : "flex-start",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            🚪 {!isCollapsed || isMobile ? "Cerrar Sesión" : ""}
          </button>
        </div>

      </div>
    </>
  );
};
