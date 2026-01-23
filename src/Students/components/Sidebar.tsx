import React from "react";
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
// Asegúrate de que la ruta a AvatarEditor sea la correcta en tu proyecto
import { AnimatedAvatarRenderer } from "../AvatarEditor";

interface SidebarProps {
  active: string;
  onChange: (section: string) => void;
  onLogout: () => void;
  userProfile?: any; 
}

const Sidebar: React.FC<SidebarProps> = ({ active, onChange, onLogout, userProfile }) => {
  const items = [
    { id: "learn", label: "Aprender", icon: <Home size={28} strokeWidth={2.5} /> },
    { id: "sounds", label: "Sonidos", icon: <Volume2 size={28} strokeWidth={2.5} /> },
    { id: "groups", label: "Grupos", icon: <Users size={28} strokeWidth={2.5} /> },
    { id: "shop", label: "Tienda", icon: <ShoppingBag size={28} strokeWidth={2.5} /> },
    { id: "profile", label: "Perfil", icon: <UserCircle size={28} strokeWidth={2.5} /> },
    { id: "challenges", label: "Desafíos", icon: <Trophy size={28} strokeWidth={2.5} /> },
    { id: "settings", label: "Configuración", icon: <Settings size={28} strokeWidth={2.5} /> },
  ];

  // Lógica para obtener los atributos del avatar desde el JSON de la DB
  const avatarAttrs = React.useMemo(() => {
    try {
      if (userProfile?.avatarData) {
        return typeof userProfile.avatarData === 'string' 
          ? JSON.parse(userProfile.avatarData) 
          : userProfile.avatarData;
      }
    } catch (e) {
      console.error("Error al procesar avatarData en Sidebar", e);
    }
    return null;
  }, [userProfile?.avatarData]);

  const sideStyles = `
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .nav-item {
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      display: flex;
      align-items: center;
      width: 100%;
      padding: 12px 16px;
      margin-bottom: 6px;
      border-radius: 16px;
      border: 2px solid transparent;
      background: transparent;
      cursor: pointer;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.8px;
      color: #4B4B4B;
    }

    .nav-item:hover {
      transform: scale(1.05) translateX(5px);
      background-color: #F7F7F7;
    }

    .nav-item.active {
      background-color: #DDF4FF;
      border-color: #84D8FF;
      color: #1CB0F6;
    }

    .icon-wrapper {
      transition: transform 0.3s ease;
      display: flex;
      margin-right: 15px;
    }

    .profile-wrapper {
      position: relative;
      margin: 0 10px 25px;
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      border-radius: 16px;
      border: 2px solid #E5E5E5;
      background: white;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .profile-card:hover {
      border-color: #1CB0F6;
      background: #F0F9FF;
    }

    /* Contenedor circular para el avatar animado */
    .avatar-mini-circle {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #EDF2F7;
      border: 2px solid #1CB0F6;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    /* Escalado para centrar la cara del avatar animado */
    .avatar-scaler {
      transform: scale(0.45) translateY(25px); 
      transform-origin: center;
    }

    .profile-tooltip {
      position: absolute;
      left: 250px;
      top: 0;
      width: 210px;
      background: #4B4B4B;
      color: white;
      padding: 15px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      opacity: 0;
      visibility: hidden;
      transform: translateX(-15px);
      transition: all 0.3s ease;
      z-index: 9999;
      pointer-events: none;
    }

    .profile-wrapper:hover .profile-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }

    .profile-tooltip::before {
      content: "";
      position: absolute;
      right: 100%;
      top: 20px;
      border: 10px solid transparent;
      border-right-color: #4B4B4B;
    }

    .logout-section {
      margin-top: auto;
      padding-top: 15px;
      border-top: 2px solid #E5E5E5;
    }

    .logout-item { color: #AFB4B8; }
    .logout-item:hover {
      background-color: #FFF0F0 !important;
      color: #FF4B4B !important;
      border-color: #FFC1C1 !important;
    }
  `;

  return (
    <aside style={{ 
      width: 260, borderRight: `2px solid #E5E5E5`, padding: "25px 15px", 
      height: "100vh", position: "fixed", left: 0, top: 0,
      backgroundColor: "white", zIndex: 100, display: "flex",
      flexDirection: "column", animation: "slideIn 0.5s ease-out"
    }}>
      <style>{sideStyles}</style>

      {/* Logo */}
      <div style={{ padding: "0 15px 25px" }}>
        <h1 style={{ color: "#1CB0F6", fontSize: "30px", fontWeight: 900, margin: 0, letterSpacing: "-1.5px" }}>
          EuroPeek
        </h1>
      </div>

      {/* SECCIÓN DE PERFIL CON AVATAR ANIMADO */}
      <div className="profile-wrapper">
        <div className="profile-card" onClick={() => onChange("profile")}>
          <div className="avatar-mini-circle">
            {avatarAttrs ? (
              <div className="avatar-scaler">
                <AnimatedAvatarRenderer attrs={avatarAttrs} size={100} />
              </div>
            ) : (
              <div style={{ fontWeight: 800, color: "#1CB0F6", fontSize: "18px" }}>
                {userProfile?.fullName?.[0].toUpperCase() || "U"}
              </div>
            )}
          </div>
          
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: 800, 
              color: "#4B4B4B", 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis" 
            }}>
              {userProfile?.fullName || "Usuario"}
            </div>
            <div style={{ fontSize: "11px", color: "#AFB4B8", fontWeight: 700, textTransform: "uppercase" }}>
              Estudiante
            </div>
          </div>
        </div>

        {/* TOOLTIP DE PROGRESO */}
        <div className="profile-tooltip">
          <div style={{ fontWeight: 900, fontSize: "15px", marginBottom: "8px", color: "#1CB0F6", textTransform: "uppercase" }}>
             Mi Progreso
          </div>
          <div style={{ fontSize: "13px", marginBottom: "6px", color: "#DDD" }}>
            📅 Se unió en: <br/> 
            <span style={{ color: "white", fontWeight: "bold" }}>
              {userProfile?.joinedAt ? new Date(userProfile.joinedAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : "Reciente"}
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "#DDD", borderTop: "1px solid #666", paddingTop: "8px", marginTop: "4px" }}>
            ⭐ Experiencia Total: <br/>
            <span style={{ color: "#FFC800", fontWeight: "900", fontSize: "16px" }}>
              {userProfile?.totalXp || 0} XP
            </span>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, overflowY: "auto" }}>
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            style={{ animation: `slideIn 0.5s ease-out backwards ${index * 0.05}s` }}
          >
            <span className="icon-wrapper">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer / Cerrar Sesión */}
      <div className="logout-section">
        <button onClick={onLogout} className="nav-item logout-item">
          <span className="icon-wrapper"><LogOut size={28} strokeWidth={2.5} /></span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;