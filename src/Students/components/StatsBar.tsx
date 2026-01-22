import React from "react";
import { UserProfileData } from "../../api/auth.service";

interface Props {
  profile: UserProfileData;
}

const StatsBar: React.FC<Props> = ({ profile }) => {
  const animations = `
    @keyframes burn { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.1); filter: brightness(1.2); } }
    @keyframes heartbeat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.2); } 30% { transform: scale(1.1); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .stat-item { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 15px; color: #4b4b4b; }
  `;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <style>{animations}</style>
      
      {/* Racha */}
      <div className="stat-item">
        <span style={{ animation: "burn 1.5s infinite ease-in-out", fontSize: "20px" }}>🔥</span>
        <span>{profile.currentStreak || 0}</span>
      </div>

      {/* XP */}
      <div className="stat-item">
        <span style={{ animation: "float 2s infinite ease-in-out", fontSize: "20px" }}>⭐</span>
        <span style={{ color: "#ffc800" }}>{profile.totalXp || 0}</span>
      </div>

      {/* Vidas */}
      <div className="stat-item">
        <span style={{ animation: "heartbeat 1.2s infinite ease-in-out", fontSize: "20px", display: "inline-block" }}>❤️</span>
        <span style={{ color: "#ff4b4b" }}>{profile.heartsCount || 0}</span>
      </div>

      {/* Gemas */}
      <div className="stat-item">
        <span style={{ animation: "float 2.5s infinite ease-in-out", fontSize: "20px" }}>💎</span>
        <span style={{ color: "#1cb0f6" }}>{profile.lingots || 0}</span>
      </div>
    </div>
  );
};

export default StatsBar;