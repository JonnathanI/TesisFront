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
      borderRight: `2px solid ${currentTheme.border}`,
      padding: "1.5rem 1rem",
      background: currentTheme.sidebarBg,
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* TÍTULO */}
    <h1
      style={{
        paddingLeft: "0.8rem",
        marginBottom: "1.5rem",
        color: "#1cb0f6",
        fontSize: "20px",
        fontWeight: 800,
      }}
    >
      Panel Docente
    </h1>

    {/* ITEMS */}
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
            padding: "14px 16px",
            marginBottom: "10px",
            borderRadius: "16px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: isActive ? 700 : 500,
            background: isActive ? "#E8F5FE" : "transparent",
            color: isActive ? "#1cb0f6" : "#333",
            boxShadow: isActive
              ? "0 6px 14px rgba(28,176,246,0.25)"
              : "none",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            if (!isActive)
              e.currentTarget.style.background = "#F3FAFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isActive
              ? "#E8F5FE"
              : "transparent";
          }}
        >
          <span style={{ fontSize: "20px" }}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      );
    })}
  </aside>
);
