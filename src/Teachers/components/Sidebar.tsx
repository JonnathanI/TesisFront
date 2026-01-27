interface SidebarProps {
  sidebarNavItems: any[];
  activeTab: string;
  setActiveTab: (v: string) => void;
  setSubTab: (v: any) => void;
  resetForm: () => void;
  currentTheme: any;
  theme: string;
  handleMoreMenuClick: (a: string) => void;
  showMoreMenu: boolean;
  setShowMoreMenu: (v: boolean) => void;
}

export const Sidebar = ({
  sidebarNavItems,
  activeTab,
  setActiveTab,
  setSubTab,
  resetForm,
  currentTheme,
  theme,
  handleMoreMenuClick,
  showMoreMenu,
  setShowMoreMenu,
}: SidebarProps) => (
  <aside
    style={{
      width: "280px",
      minHeight: "100vh",
      borderRight: `2px solid #E5E5E5`,
      padding: "2rem 1.2rem",
      background: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
    }}
  >
    {/* LOGOTIPO SEGÚN IMAGEN */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      marginBottom: '2.5rem', 
      paddingLeft: '0.5rem' 
    }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        background: '#1cb0f6', 
        borderRadius: '8px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: '#fff', 
        fontWeight: 900,
        fontSize: '18px'
      }}>
        D
      </div>
      <h1 style={{ 
        color: "#1cb0f6", 
        fontSize: "22px", 
        fontWeight: 800, 
        margin: 0,
        letterSpacing: '-0.5px'
      }}>
        Docente<span style={{ color: '#333' }}>Hub</span>
      </h1>
    </div>

    {/* LISTA DE ITEMS */}
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {sidebarNavItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <div
            key={item.id}
            onClick={() => {
              if (item.id === "more") setShowMoreMenu(!showMoreMenu);
              else {
                setActiveTab(item.id);
                setSubTab("menu");
                resetForm();
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 16px",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 700, // Duolingo style siempre es Bold
              transition: "all 0.15s ease-in-out",
              
              // ESTILOS DE ESTADO ACTIVO (SEGÚN TU IMAGEN)
              background: isActive ? "#E8F5FE" : "transparent",
              color: isActive ? "#1cb0f6" : "#777777",
              border: isActive ? "2px solid #1cb0f6" : "2px solid transparent",
              
              // Efecto de sombra sólida inferior para que parezca 3D
              boxShadow: isActive ? "0 4px 0 0 #1cb0f6" : "none",
              transform: isActive ? "translateY(-2px)" : "none",
              marginBottom: isActive ? "8px" : "2px",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "#F7F7F7";
                e.currentTarget.style.color = "#333";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#777777";
              }
            }}
          >
            {/* ICONO CON FILTRO */}
            <span style={{ 
              fontSize: "20px", 
              display: 'flex',
              filter: isActive ? "none" : "grayscale(100%) opacity(0.6)" 
            }}>
              {item.icon}
            </span>

            {/* ETIQUETA */}
            <span style={{ flex: 1 }}>{item.label}</span>

            {/* PUNTO INDICADOR DERECHO */}
            {isActive && (
              <div style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#1cb0f6'
              }} />
            )}
          </div>
        );
      })}
    </nav>
  </aside>
);