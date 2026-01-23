import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar";
import { LearnSection } from "./sections/LearnSection";
import SoundsSection from "./sections/SoundsSection";
import GroupsSection from "./sections/GroupsSection";
import ShopSection from "./sections/ShopSection";
import ProfileSection from "./sections/ProfileSection";
import Challenges from "./Challenges";
import { SOUND_DATA } from "../data/soundData";
import { motion } from "framer-motion";

// Importaciones del Service
import {
  UserProfileData,
  getUserProfile,
  getCourseStatus,
  UnitWithLessons,
  getCourses,
  getGlobalLeaderboard,
  LeaderboardEntry,
  buyShopItem,
  removeToken
} from "../api/auth.service";

const StudentDashboard = () => {
  // --- ESTADOS PRINCIPALES ---
  const [section, setSection] = useState("learn");
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [heartTimer, setHeartTimer] = useState<string>("");
  
  // --- ESTADOS DE CONTROL ---
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- ESTADOS PARA GRUPOS (Mock o iniciales) ---
  const [joinCode, setJoinCode] = useState("");
  const [myGroups, setMyGroups] = useState([
    { id: "1", name: "Inglés Técnico I", teacherName: "Dra. Smith" }
  ]);
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null);
  const [groupTab, setGroupTab] = useState<"TAREAS" | "LIGA">("TAREAS");

  // --- CARGA DE DATOS (Manejo robusto) ---
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      // 1. Obtener Perfil (Si falla aquí con 401, el service redirige)
      const profile = await getUserProfile();
      setUserProfile(profile);
      setHeartTimer(profile.nextHeartRegenTime ?? "");

      // 2. Cargar Ranking
      const topUsers = await getGlobalLeaderboard();
      setLeaderboard(topUsers);

      // 3. Cargar Unidades del curso actual
      const courses = await getCourses();
      if (courses && courses.length > 0) {
        // Usamos el primer curso por defecto
        const unitsData = await getCourseStatus(String(courses[0].id));
        setUnits(unitsData);
      }

    } catch (error: any) {
      console.error("Error al sincronizar dashboard:", error);
      setErrorMsg("No pudimos conectar con el servidor. Verifica tu conexión.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- ACCIONES ---
  const handlePurchase = async (type: string, cost: number) => {
    if (userProfile && userProfile.lingots >= cost) {
      try {
        await buyShopItem(type);
        const freshProfile = await getUserProfile();
        setUserProfile(freshProfile);
        alert("¡Compra exitosa!");
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert("No tienes suficientes lingotes.");
    }
  };

  const handleLogout = () => {
    removeToken(); // Limpia JWT y Role
    localStorage.clear();
    window.location.href = "/login";
  };

  // --- ESTILOS DINÁMICOS ---
  const dashboardStyles = `
    .leaderboard-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; position: relative; transition: all 0.2s; }
    .leaderboard-row:hover { background-color: #f7f7f7; }
    .xp-tooltip { position: absolute; right: 15px; background: #4b4b4b; color: white; padding: 5px 10px; border-radius: 8px; font-size: 12px; opacity: 0; transition: 0.2s; pointer-events: none; }
    .leaderboard-row:hover .xp-tooltip { opacity: 1; }
    .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Poppins', sans-serif; }
  `;

  // --- PANTALLAS DE CARGA O ERROR ---
  if (isLoading) {
    return (
      <div className="loader-container">
        <style>{dashboardStyles}</style>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ fontSize: "40px" }}>
          🌀
        </motion.div>
        <p style={{ marginTop: "20px", color: "#666", fontWeight: "bold" }}>Sincronizando progreso...</p>
      </div>
    );
  }

  if (errorMsg || !userProfile) {
    return (
      <div className="loader-container">
        <style>{dashboardStyles}</style>
        <h2 style={{ color: "#ff4d4f" }}>¡Ups! Algo salió mal</h2>
        <p>{errorMsg || "Sesión no válida"}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "#278DCE", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "white", fontFamily: "'Poppins', sans-serif" }}>
      <style>{dashboardStyles}</style>
      
      <Sidebar active={section} onChange={setSection} onLogout={handleLogout} />
      
      <div style={{ flex: 1, marginLeft: 260, display: "flex" }}>
        
        {/* PANEL CENTRAL DINÁMICO */}
        <main style={{ flex: 1, padding: "40px 20px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "700px" }}>
            
            {section === "learn" && (
              <LearnSection 
                units={units} 
                userProfile={userProfile} 
                heartTimer={heartTimer} 
                onUpdateProfile={setUserProfile} 
              />
            )}

            {section === "sounds" && (
              <SoundsSection soundItems={SOUND_DATA} />
            )}

            {section === "groups" && (
              <GroupsSection 
                theme={{}} joinCode={joinCode} setJoinCode={setJoinCode}
                myGroups={myGroups} viewingGroupId={viewingGroupId}
                setViewingGroupId={setViewingGroupId} groupDetails={null}
                groupTab={groupTab} setGroupTab={setGroupTab}
                leaderboard={leaderboard} handleJoinGroup={() => {}}
              />
            )}

            {section === "shop" && (
              <ShopSection 
                userProfile={userProfile} 
                handlePurchase={handlePurchase} 
              />
            )}

            {section === "profile" && (
              <ProfileSection />
            )}

            {section === "challenges" && (
              <div style={{ backgroundColor: "#131f24", borderRadius: "24px", padding: "10px" }}>
                <Challenges />
              </div>
            )}

            {section === "settings" && (
              <div style={{ textAlign: "center", paddingTop: "50px" }}>
                <h2 style={{ color: "#CCC" }}>Configuración próximamente</h2>
              </div>
            )}
          </div>
        </main>

        {/* BARRA LATERAL DERECHA (ESTADÍSTICAS Y RANKING) */}
        <aside style={{ 
          width: 380, padding: "30px 20px", borderLeft: "2px solid #E5E5E5",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "25px"
        }}>
          
          {/* Componente de Stats (Racha, Lingotes, Vidas) */}
          <div style={{ padding: "15px", borderRadius: "18px", border: "2px solid #E5E5E5" }}>
            <StatsBar profile={userProfile} />
          </div>

          {/* Ranking Global */}
          <div style={{ padding: "20px", borderRadius: "18px", border: "2px solid #E5E5E5" }}>
            <h4 style={{ margin: "0 0 15px 0", fontSize: "19px", fontWeight: "800" }}>Ranking Global</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 10).map((user, index) => {
                  const isMe = user.userId === userProfile.userId || user.fullName === userProfile.fullName;
                  return (
                    <div key={user.userId || index} className="leaderboard-row" style={{
                      backgroundColor: isMe ? "#DDF4FF" : "transparent"
                    }}>
                      <span style={{ fontWeight: "900", width: "25px", color: index < 3 ? "#1CB0F6" : "#AFAFAF" }}>{index + 1}</span>
                      <div style={{ 
                        width: "38px", height: "38px", borderRadius: "50%", 
                        backgroundColor: isMe ? "#1CB0F6" : "#E5E5E5", 
                        color: "white", display: "flex", justifyContent: "center", 
                        alignItems: "center", fontWeight: "bold" 
                      }}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ flex: 1, fontWeight: "700", fontSize: "0.95rem" }}>{isMe ? "Tú" : user.fullName}</span>
                      <div className="xp-tooltip">⭐ {user.xpTotal} XP</div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: "0.8rem", color: "#999" }}>No hay datos de ranking disponibles.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;