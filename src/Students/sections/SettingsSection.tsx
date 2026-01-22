import React from "react";

interface Props {
  themeMode: "light" | "dark";
  toggleTheme: () => void;
}

export default function SettingsSection({ themeMode, toggleTheme }: Props) {
  return (
    <div>
      <h2>Configuración</h2>
      <button onClick={toggleTheme}>
        {themeMode === "dark" ? "🌙 Oscuro" : "☀️ Claro"}
      </button>
    </div>
  );
}
