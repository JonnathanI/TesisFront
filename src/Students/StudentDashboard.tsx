import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar"; 
import { LearnSection } from "./sections/LearnSection";
import SoundsSection from "./sections/SoundsSection"; 
import GroupsSection from "./sections/GroupsSection";
import ShopSection from "./sections/ShopSection";
import ProfileSection from "./sections/ProfileSection";
import Challenges from "./Challenges"; // 1. IMPORTACIÓN DEL COMPONENTE
import { SOUND_DATA } from "../data/soundData";

// Importamos las funciones necesarias de tu auth.service.ts
import {
  UserProfileData,
  getUserProfile,
  getCourseStatus,
  UnitWithLessons,
  getCourses,
  getGlobalLeaderboard, 
  LeaderboardEntry,
  buyShopItem 
} from "../api/auth.service";

const StudentDashboard = () => {
  // --- ESTADOS ---
  const [section, setSection] = useState("learn");
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]); 
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [heartTimer, setHeartTimer] = useState<string>("");

  // --- ESTADOS PARA GRUPOS ---
  const [joinCode, setJoinCode] = useState("");
  const [myGroups, setMyGroups] = useState([
    { id: "1", name: "Inglés Técnico I", teacherName: "Dra. Smith" }
  ]);
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null);
  const [groupTab, setGroupTab] = useState<"TAREAS" | "LIGA">("TAREAS");

  // --- CARGA DE DATOS AL INICIAR O RECARGAR ---
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
      console.error("Error al cargar datos del servidor:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- LÓGICA DE COMPRA PERSISTENTE ---
  const handlePurchase = async (type: string, cost: number) => {
    if (userProfile && userProfile.lingots >= cost) {
      try {
        await buyShopItem(type); 
        const freshProfile = await getUserProfile();
        setUserProfile(freshProfile);
        alert("¡Compra exitosa!");
      } catch (error: any) {
        alert(error.message); 
        console.error("Detalle técnico:", error);
      }
    } else {
      alert("No tienes suficientes gemas.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login"; 
  };

  const dashboardStyles = `
    .leaderboard-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; position: relative; transition: all 0.2s; }
    .leaderboard-row:hover { background-color: #f7f7f7; }
    .xp-tooltip { position: absolute; right: 15px; background: #4b4b4b; color: white; padding: 5px 10px; border-radius: 8px; font-size: 12px; opacity: 0; transition: 0.2s; pointer-events: none; }
    .leaderboard-row:hover .xp-tooltip { opacity: 1; }
  `;

  if (!userProfile) return <div style={{ textAlign: "center", marginTop: "100px" }}>Cargando datos del servidor...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "white" }}>
      <style>{dashboardStyles}</style>
      
      <Sidebar active={section} onChange={setSection} onLogout={handleLogout} />
      
      <div style={{ flex: 1, marginLeft: 260, display: "flex" }}>
        
        {/* PANEL CENTRAL */}
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

            {/* 2. SECCIÓN DE DESAFÍOS INTEGRADA */}
            {section === "challenges" && (
              <div style={{ backgroundColor: "#131f24", borderRadius: "24px", padding: "10px" }}>
                <Challenges />
              </div>
            )}

            {/* 3. SOLO SETTINGS SE MANTIENE COMO PRÓXIMAMENTE */}
            {section === "settings" && (
              <div style={{ textAlign: "center", paddingTop: "50px" }}>
                <h2 style={{ color: "#CCC" }}>Sección {section.toUpperCase()} próximamente</h2>
              </div>
            )}
          </div>
        </main>

        {/* BARRA LATERAL DERECHA (ESTADÍSTICAS) */}
        <aside style={{ 
          width: 380, padding: "30px 20px", borderLeft: "2px solid #E5E5E5",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "25px"
        }}>
          
          <div style={{ padding: "15px", borderRadius: "18px", border: "2px solid #E5E5E5" }}>
            <StatsBar profile={userProfile} />
          </div>

          <div style={{ padding: "20px", borderRadius: "18px", border: "2px solid #E5E5E5" }}>
            <h4 style={{ margin: "0 0 15px 0", fontSize: "19px", fontWeight: "800" }}>Ranking Global</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {leaderboard.slice(0, 10).map((user, index) => {
                const isMe = user.fullName === userProfile.fullName;
                return (
                  <div key={user.userId} className="leaderboard-row" style={{
                    backgroundColor: isMe ? "#DDF4FF" : "transparent"
                  }}>
                    <span style={{ fontWeight: "900", width: "25px", color: index < 3 ? "#1CB0F6" : "#AFAFAF" }}>{index + 1}</span>
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: isMe ? "#1CB0F6" : "#E5E5E5", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, fontWeight: "700" }}>{isMe ? "Tú" : user.fullName}</span>
                    <div className="xp-tooltip">⭐ {user.xpTotal} XP</div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;