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
      width: "260px",
      borderRight: `2px solid ${currentTheme.border}`,
      padding: "1.5rem 0",
      background: currentTheme.sidebarBg,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <h1 style={{ paddingLeft: "1.5rem", color: "#1cb0f6" }}>
      Panel Docente
    </h1>

    {sidebarNavItems.map((item) => (
      <div key={item.id}>
        <div
          onClick={() => {
            if (item.id === "more") setShowMoreMenu(!showMoreMenu);
            else {
              setActiveTab(item.id);
              setSubTab("menu");
              resetForm();
            }
          }}
        >
          {item.icon} {item.label}
        </div>
      </div>
    ))}
  </aside>
);
