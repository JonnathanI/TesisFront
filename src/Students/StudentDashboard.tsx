import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar"; 
import { LearnSection } from "./sections/LearnSection";
import { COLORS } from "./theme/color";
import {
  UserProfileData,
  getUserProfile,
  getCourseStatus,
  UnitWithLessons,
  getCourses,
  getGlobalLeaderboard, 
  LeaderboardEntry      
} from "../api/auth.service";

const StudentDashboard = () => {
  const [section, setSection] = useState("learn");
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]); 
  const [heartTimer, setHeartTimer] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
        setHeartTimer(profile.nextHeartRegenTime ?? "");

        const topUsers = await getGlobalLeaderboard();
        setLeaderboard(topUsers);

        const courses = await getCourses();
        if (courses && courses.length > 0) {
          const unitsData = await getCourseStatus(String(courses[0].id));
          setUnits(unitsData);
        }
      } catch (error) {
        console.error("Error cargando datos reales:", error);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id"); 
    window.location.href = "/login"; 
  };

  // Estilos inyectados para el efecto del Ranking
  const dashboardStyles = `
    .leaderboard-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      position: relative;
      transition: all 0.2s ease;
      cursor: default;
    }
    .leaderboard-row:hover {
      background-color: #f7f7f7;
    }
    .xp-tooltip {
      position: absolute;
      right: 15px;
      background: #4b4b4b;
      color: white;
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: bold;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.2s ease;
      pointer-events: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .leaderboard-row:hover .xp-tooltip {
      opacity: 1;
      transform: translateX(0);
    }
    .leaderboard-row:hover {
        transform: scale(1.02);
    }
  `;

  if (!userProfile) return <p>Cargando Dashboard...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "white" }}>
      <style>{dashboardStyles}</style>
      
      {/* COLUMNA 1: Sidebar */}
      <Sidebar active={section} onChange={setSection} onLogout={handleLogout} />
      
      <div style={{ flex: 1, marginLeft: 260, display: "flex" }}>
        
        {/* COLUMNA 2: Centro (Aprendizaje) */}
        <main style={{ flex: 1, padding: "40px 20px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "600px" }}>
            {section === "learn" && (
              <LearnSection 
                units={units} 
                userProfile={userProfile} 
                heartTimer={heartTimer} 
                onUpdateProfile={setUserProfile} 
              />
            )}
          </div>
        </main>

        {/* COLUMNA 3: Derecha (Estadísticas y Ranking) */}
        <aside style={{ 
          width: 380, 
          padding: "30px 20px", 
          borderLeft: `2px solid ${COLORS.gray || "#E5E5E5"}`,
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "25px"
        }}>
          
          {/* BARRA DE ESTADÍSTICAS */}
          <div style={{ 
            padding: "15px", 
            borderRadius: "18px", 
            border: `2px solid #E5E5E5`,
            backgroundColor: "#fff"
          }}>
            <StatsBar profile={userProfile} />
          </div>

          {/* TABLA DE POSICIONES GLOBAL */}
          <div style={{ 
            padding: "20px", 
            borderRadius: "18px", 
            border: `2px solid #E5E5E5`,
            backgroundColor: "#FFF"
          }}>
            <h4 style={{ margin: "0 0 15px 0", fontSize: "19px", color: "#3C3C3C", fontWeight: "800" }}>
              Clasificación Global
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 10).map((user, index) => {
                  const isMe = user.fullName === userProfile.fullName;
                  return (
                    <div key={user.userId} className="leaderboard-row" style={{
                      backgroundColor: isMe ? "#DDF4FF" : "transparent",
                      border: isMe ? "2px solid #84D8FF" : "2px solid transparent"
                    }}>
                      {/* Puesto */}
                      <span style={{ 
                        fontWeight: "900", 
                        width: "25px", 
                        color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#AFAFAF" 
                      }}>
                        {index + 1}
                      </span>

                      {/* Avatar con Inicial */}
                      <div style={{ 
                        width: "38px", height: "38px", borderRadius: "50%", 
                        backgroundColor: isMe ? "#1CB0F6" : "#E5E5E5", 
                        color: isMe ? "white" : "#777",
                        display: "flex", justifyContent: "center", alignItems: "center", 
                        fontWeight: "bold", fontSize: "14px", border: "2px solid white"
                      }}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>

                      {/* Nombre del Usuario */}
                      <span style={{ 
                        flex: 1, 
                        fontWeight: "700", 
                        color: "#4B4B4B", 
                        fontSize: "15px" 
                      }}>
                        {isMe ? "Tú" : user.fullName}
                      </span>

                      {/* TOOLTIP: Solo visible al pasar el mouse */}
                      <div className="xp-tooltip">
                        ⭐ {user.xpTotal} XP
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: "center", color: "#AFAFAF" }}>Buscando competidores...</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;