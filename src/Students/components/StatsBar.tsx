import React, { useEffect } from "react";
import { UserProfileData } from "../../api/auth.types";

interface Props {
  profile: UserProfileData;
}

const StatsBar: React.FC<Props> = ({ profile }) => {
  useEffect(() => {
    console.log("📊 StatsBar actualizado:", profile);
  }, [profile]);

  const styles = `
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.25); }
      100% { transform: scale(1); }
    }

    .stats-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 14px 16px;
      border-radius: 18px;
      box-shadow: 0 6px 14px rgba(0,0,0,0.08);
      flex-wrap: wrap;
      gap: 10px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      font-size: 15px;
      color: #3c3c3c;
      white-space: nowrap;
    }

    .stat-icon {
      font-size: 22px;
      line-height: 1;
    }

    .animate {
      animation: pop 0.3s ease-out;
    }

    /* ✅ Ajuste para pantallas muy pequeñas */
    @media (max-width: 420px) {
      .stat-item { font-size: 14px; }
      .stat-icon { font-size: 20px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-icon">🔥</span>
          <span>{profile.currentStreak ?? 0}</span>
        </div>

        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span
            key={profile.totalXp}
            className="animate"
            style={{ color: "#ffc800" }}
          >
            {profile.totalXp ?? 0}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-icon">❤️</span>
          <span
            key={profile.heartsCount}
            className="animate"
            style={{ color: "#ff4b4b" }}
          >
            {profile.heartsCount ?? 0}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-icon">💎</span>
          <span
            key={profile.lingots}
            className="animate"
            style={{ color: "#1cb0f6" }}
          >
            {profile.lingots ?? 0}
          </span>
        </div>
      </div>
    </>
  );
};

export default StatsBar;
