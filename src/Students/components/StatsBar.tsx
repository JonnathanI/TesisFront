import React from "react";
import { UserProfileData } from "../../api/auth.service";

interface Props {
  profile: UserProfileData;
}

const StatsBar: React.FC<Props> = ({ profile }) => {
  return (
    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
      <div>🔥 Racha: {profile.currentStreak}</div>
      <div>⭐ XP: {profile.totalXp}</div>
      <div>❤️ Vidas: {profile.heartsCount}</div>
      <div>💎 Gemas: {profile.lingots}</div>
    </div>
  );
};

export default StatsBar;
