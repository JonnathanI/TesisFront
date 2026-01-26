import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar";
import { LearnSection } from "./sections/LearnSection";
import SoundsSection from "./sections/SoundsSection";
import GroupsSection from "./sections/GroupsSection";
import ShopSection from "./sections/ShopSection";
import ProfileSection from "./sections/ProfileSection";
import Challenges from "./Challenges";

// --- CORRECCIÓN DE IMPORTACIONES ---
// Usamos llaves { } porque los definimos como "export const"
import { FriendRequests } from "./components/FriendRequests"; 
import { UserSearch } from "./components/UserSearch"; 

import { SOUND_DATA } from "../data/soundData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  removeToken,
  getFriendsList,
  StudentData
} from "../api/auth.service";

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS PRINCIPALES ---
  const [section, setSection] = useState("learn");
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<StudentData[]>([]);
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [heartTimer, setHeartTimer] = useState<string>("");
  
  // --- ESTADOS DE CONTROL ---
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- ESTADOS PARA GRUPOS ---
  const [joinCode, setJoinCode] = useState("");
  const [myGroups, setMyGroups] = useState([
    { id: "1", name: "Inglés Técnico I", teacherName: "Dra. Smith" }
  ]);
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null);
  const [groupTab, setGroupTab] = useState<"TAREAS" | "LIGA">("TAREAS");

  // --- CARGA DE DATOS ---
  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      setErrorMsg(null);

      // 1. Obtener Perfil
      const profile = await getUserProfile();
      setUserProfile(profile);
      setHeartTimer(profile.nextHeartRegenTime ?? "");

      // 2. Cargar Ranking Global
      const topUsers = await getGlobalLeaderboard();
      setLeaderboard(topUsers);

      // 3. Cargar Amigos Aceptados
      const friendsData = await getFriendsList();
      setFriends(friendsData);

      // 4. Cargar Unidades
      const courses = await getCourses();
      if (courses && courses.length > 0) {
        const unitsData = await getCourseStatus(String(courses[0].id));
        setUnits(unitsData);
      }

    } catch (error: any) {
      console.error("Error al sincronizar dashboard:", error);
      if (!isSilent) setErrorMsg("No pudimos conectar con el servidor.");
    } finally {
      if (!isSilent) setIsLoading(false);
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
    removeToken();
    localStorage.clear();
    window.location.href = "/login";
  };

  // --- ESTILOS DINÁMICOS ---
  const dashboardStyles = `
    .leaderboard-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; position: relative; transition: all 0.2s; cursor: pointer; }
    .leaderboard-row:hover { background-color: #f7f7f7; }
    .xp-tooltip { position: absolute; right: 15px; background: #4b4b4b; color: white; padding: 5px 10px; border-radius: 8px; font-size: 12px; opacity: 0; transition: 0.2s; pointer-events: none; }
    .leaderboard-row:hover .xp-tooltip { opacity: 1; }
    .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Poppins', sans-serif; }
    .section-card { padding: 20px; border-radius: 18px; border: 2px solid #E5E5E5; margin-bottom: 20px; background-color: white; }
  `;

  if (isLoading) {
    return (
      <div className="loader-container">
        <style>{dashboardStyles}</style>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ fontSize: "40px" }}>🌀</motion.div>
        <p style={{ marginTop: "20px", color: "#666", fontWeight: "bold" }}>Sincronizando progreso...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "white", fontFamily: "'Poppins', sans-serif" }}>
      <style>{dashboardStyles}</style>
      
      <Sidebar active={section} onChange={setSection} onLogout={handleLogout} userProfile={userProfile!} />
      
      <div style={{ flex: 1, marginLeft: 260, display: "flex" }}>
        
        {/* PANEL CENTRAL DINÁMICO */}
        <main style={{ flex: 1, padding: "40px 20px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "700px" }}>
            
            {section === "learn" && (
              <LearnSection units={units} userProfile={userProfile!} heartTimer={heartTimer} onUpdateProfile={setUserProfile} onRefreshData={loadData} />
            )}

            {section === "sounds" && <SoundsSection soundItems={SOUND_DATA} />}

            {section === "groups" && (
              <GroupsSection 
                theme={{}} joinCode={joinCode} setJoinCode={setJoinCode}
                myGroups={myGroups} viewingGroupId={viewingGroupId}
                setViewingGroupId={setViewingGroupId} groupDetails={null}
                groupTab={groupTab} setGroupTab={setGroupTab}
                leaderboard={leaderboard} handleJoinGroup={() => {}}
              />
            )}

            {section === "shop" && <ShopSection userProfile={userProfile!} handlePurchase={handlePurchase} />}

            {section === "profile" && <ProfileSection />}

            {section === "challenges" && (
              <div style={{ backgroundColor: "#131f24", borderRadius: "24px", padding: "10px" }}>
                <Challenges />
              </div>
            )}
          </div>
        </main>

        {/* BARRA LATERAL DERECHA */}
        <aside style={{ 
          width: 380, padding: "30px 20px", borderLeft: "2px solid #E5E5E5",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "20px"
        }}>
          
          <StatsBar profile={userProfile!} />

          {/* 1. BUSCADOR DE USUARIOS */}
          <UserSearch />

          {/* 2. SOLICITUDES PENDIENTES */}
          <FriendRequests />

          {/* 3. LISTA DE AMIGOS */}
          <div className="section-card">
            <h4 style={{ margin: "0 0 15px 0", fontSize: "18px", fontWeight: "800", color: "#4b4b4b" }}>Amigos</h4>
            {friends.length > 0 ? (
              friends.map(friend => (
                <div 
                  key={friend.id} 
                  className="leaderboard-row" 
                  onClick={() => navigate(`/friend-profile/${friend.id}`)}
                >
                  <div style={{ 
                    width: "35px", height: "35px", borderRadius: "50%", 
                    backgroundColor: "#1cb0f6", color: "white",
                    display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" 
                  }}>
                    {friend.fullName.charAt(0)}
                  </div>
                  <span style={{ flex: 1, fontWeight: "700", color: "#4b4b4b" }}>{friend.fullName}</span>
                  <span style={{ color: "#777", fontSize: "13px" }}>{friend.xpTotal} XP</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "13px", color: "#999" }}>Busca amigos para comparar tu progreso.</p>
            )}
          </div>

          {/* 4. RANKING GLOBAL */}
          <div className="section-card">
            <h4 style={{ margin: "0 0 15px 0", fontSize: "18px", fontWeight: "800", color: "#4b4b4b" }}>Ranking Global</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {leaderboard.slice(0, 5).map((user, index) => {
                const isMe = user.userId === userProfile?.userId;
                return (
                  <div key={user.userId || index} className="leaderboard-row" style={{ backgroundColor: isMe ? "#DDF4FF" : "transparent" }}>
                    <span style={{ fontWeight: "900", width: "25px", color: index < 3 ? "#1CB0F6" : "#AFAFAF" }}>{index + 1}</span>
                    <span style={{ flex: 1, fontWeight: "700", fontSize: "0.9rem", color: isMe ? "#1899D6" : "#4b4b4b" }}>{isMe ? "Tú" : user.fullName}</span>
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