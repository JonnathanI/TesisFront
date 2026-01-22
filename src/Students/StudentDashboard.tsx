import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
// IMPORTACIÓN CORREGIDA: Se usan llaves porque StatsBar no es export default
import StatsBar  from "./components/StatsBar"; 
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

        // CARGAR RANKING GLOBAL REAL
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

  // --- FUNCIÓN DE CIERRE DE SESIÓN ---
  const handleLogout = () => {
    // 1. Limpiar almacenamiento de sesión
    localStorage.removeItem("token");
    localStorage.removeItem("user_id"); 
    
    // 2. Redirigir al inicio/login
    window.location.href = "/login"; 
  };

  if (!userProfile) return <p>Cargando...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "white" }}>
      {/* COLUMNA 1: Sidebar (Izquierda) */}
      <Sidebar active={section} onChange={setSection} onLogout={handleLogout} />
      
      <div style={{ flex: 1, marginLeft: 260, display: "flex" }}>
        
        {/* COLUMNA 2: Centro (Camino de Aprendizaje) */}
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

        {/* COLUMNA 3: Derecha (Info y Ranking) */}
        <aside style={{ 
          width: 380, 
          padding: "30px 20px", 
          borderLeft: `2px solid ${COLORS.gray || "#E5E5E5"}`,
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "25px"
        }}>
          {/* BARRA DE ESTADÍSTICAS (Con animaciones de llama y corazón) */}
          <div style={{ padding: "15px", borderRadius: "15px", border: `2px solid ${COLORS.gray || "#E5E5E5"}` }}>
            <StatsBar profile={userProfile} />
          </div>

          {/* TABLA DE POSICIONES GLOBAL */}
          <div style={{ 
            padding: "20px", 
            borderRadius: "15px", 
            border: `2px solid ${COLORS.gray || "#E5E5E5"}`,
            backgroundColor: "#FFF"
          }}>
            <h4 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#3C3C3C" }}>Clasificación Global</h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 10).map((user, index) => {
                  const isMe = user.fullName === userProfile.fullName;
                  return (
                    <div key={user.userId} style={{
                      display: "flex", alignItems: "center", gap: "12px", padding: "10px",
                      borderRadius: "12px",
                      backgroundColor: isMe ? "#DDF4FF" : "transparent",
                      border: isMe ? "2px solid #84D8FF" : "2px solid transparent"
                    }}>
                      <span style={{ fontWeight: "bold", width: "25px", color: index < 3 ? "#1CB0F6" : "#AFAFAF" }}>
                        {index + 1}
                      </span>
                      <div style={{ 
                        width: "35px", height: "35px", borderRadius: "50%", 
                        backgroundColor: isMe ? "#1CB0F6" : "#CECECE", color: "white",
                        display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", fontSize: "14px"
                      }}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ flex: 1, fontWeight: "bold", color: "#4B4B4B", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isMe ? "Tú" : user.fullName}
                      </span>
                      <span style={{ color: "#777", fontSize: "13px", fontWeight: "bold" }}>
                        {user.xpTotal} XP
                      </span>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#777", fontSize: "14px" }}>Cargando ranking real...</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;