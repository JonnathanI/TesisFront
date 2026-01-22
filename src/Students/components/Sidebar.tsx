import React from "react";
import { COLORS } from "../theme/color";
import { 
  Home, 
  Volume2, 
  Users, 
  ShoppingBag, 
  UserCircle, 
  Trophy, 
  Settings,
  LogOut 
} from "lucide-react";

interface SidebarProps {
  active: string;
  onChange: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onChange, onLogout }) => {
  const items = [
    { id: "learn", label: "Aprender", icon: <Home size={28} strokeWidth={2.5} /> },
    { id: "sounds", label: "Sonidos", icon: <Volume2 size={28} strokeWidth={2.5} /> },
    { id: "groups", label: "Grupos", icon: <Users size={28} strokeWidth={2.5} /> },
    { id: "shop", label: "Tienda", icon: <ShoppingBag size={28} strokeWidth={2.5} /> },
    { id: "profile", label: "Perfil", icon: <UserCircle size={28} strokeWidth={2.5} /> },
    { id: "challenges", label: "Desafíos", icon: <Trophy size={28} strokeWidth={2.5} /> },
    { id: "settings", label: "Configuración", icon: <Settings size={28} strokeWidth={2.5} /> },
  ];

  const sideStyles = `
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    /* El efecto elástico que te gustó */
    .nav-item {
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      display: flex;
      align-items: center;
      width: 100%;
      padding: 14px 18px;
      margin-bottom: 8px;
      border-radius: 16px;
      border: 2px solid transparent;
      background: transparent;
      cursor: pointer;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 15px;
      letter-spacing: 0.8px;
    }
    .nav-item:hover {
      transform: scale(1.05) translateX(5px);
      background-color: #F7F7F7;
    }
    .nav-item:active {
      transform: scale(0.95);
    }
    .nav-item.active {
      background-color: #DDF4FF;
      border-color: #84D8FF;
      color: #1CB0F6;
    }
    /* Animación para los iconos */
    .icon-wrapper {
      transition: transform 0.3s ease;
      display: flex;
      margin-right: 15px;
    }
    .nav-item:hover .icon-wrapper {
      transform: rotate(-12deg) scale(1.1);
    }
    /* Estilo especial para Cerrar Sesión en la parte inferior */
    .logout-section {
      margin-top: auto;
      padding-top: 20px;
      border-top: 2px solid #E5E5E5;
      padding-bottom: 10px;
    }
    .logout-item {
      color: #AFB4B8;
    }
    .logout-item:hover {
      background-color: #FFF0F0 !important;
      color: #FF4B4B !important;
      border-color: #FFC1C1 !important;
    }
  `;

  return (
    <aside style={{ 
      width: 260, 
      borderRight: `2px solid #E5E5E5`, 
      padding: "30px 15px", 
      height: "100vh", 
      position: "fixed",
      left: 0,
      top: 0,
      backgroundColor: "white",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      animation: "slideIn 0.5s ease-out"
    }}>
      <style>{sideStyles}</style>

      {/* Logo estilo marca */}
      <div style={{ padding: "0 15px 40px" }}>
        <h1 style={{ color: "#1CB0F6", fontSize: "32px", fontWeight: 900, margin: 0, letterSpacing: "-1.5px" }}>
          duolingo
        </h1>
      </div>

      {/* Navegación Superior */}
      <nav style={{ flex: 1 }}>
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            style={{ 
              animation: `slideIn 0.5s ease-out backwards ${index * 0.05}s`
            }}
          >
            <span className="icon-wrapper">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* SECCIÓN INFERIOR: Cerrar Sesión */}
      <div className="logout-section">
        <button
          onClick={onLogout}
          className="nav-item logout-item"
        >
          <span className="icon-wrapper">
            <LogOut size={28} strokeWidth={2.5} />
          </span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;