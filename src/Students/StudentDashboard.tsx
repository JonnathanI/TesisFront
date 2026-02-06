// src/Students/StudentDashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar";
import { LearnSection } from "./sections/LearnSection";
import SoundsSection from "./sections/SoundsSection";
import GroupsSection from "./sections/GroupsSection";
import ShopSection from "./sections/ShopSection";
import ProfileSection from "./sections/ProfileSection";
import Challenges from "./Challenges";
import { FriendsChat } from "./components/FriendsChat";

// --- CORRECCIÓN DE IMPORTACIONES ---
import { FriendRequests } from "./components/FriendRequests";
import { UserSearch } from "./components/UserSearch";

import { SOUND_DATA } from "../data/soundData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EvaluationsSection } from "./sections/EvaluationsSection";

// Importaciones del Service
import {
  getUserProfile,
  getCourseStatus,
  getCourses,
  getGlobalLeaderboard,
  buyShopItem,
  removeToken,
  getFriendsList,
  getStudentClassrooms,
  getClassroomDetails,
} from "../api/auth.service";
import {
  StudentData,
  LeaderboardEntry,
  UnitWithLessons,
  UserProfileData,
} from "../api/auth.types";

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

  // --- CHAT ENTRE AMIGOS ---
  const [activeChatFriend, setActiveChatFriend] = useState<StudentData | null>(null);

  // --- ESTADOS PARA GRUPOS ---
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null);
  const [fullGroupDetails, setFullGroupDetails] = useState<any>(null);
  const [groupTab, setGroupTab] = useState<"TAREAS" | "COMPAÑEROS">("TAREAS");

  const loadData = useCallback(
    async (isSilent = false): Promise<UserProfileData> => {
      try {
        if (!isSilent) setIsLoading(true);
        setErrorMsg(null);

        const profile = await getUserProfile();
        setUserProfile(profile);
        setHeartTimer(profile.nextHeartRegenTime ?? "");

        const topUsers = await getGlobalLeaderboard();
        setLeaderboard(topUsers);

        const friendsData = await getFriendsList();
        setFriends(friendsData);

        const courses = await getCourses();
        if (courses?.length > 0) {
          const unitsData = await getCourseStatus(String(courses[0].id));
          setUnits(unitsData);
        }

        const groupsData = await getStudentClassrooms();
        setMyGroups(groupsData);

        return profile;
      } catch (error) {
        console.error("Error al sincronizar dashboard:", error);
        if (!isSilent) setErrorMsg("No pudimos conectar con el servidor.");
        throw error;
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 🔥 Carga el detalle real (alumnos/compañeros) al hacer clic
  const handleViewClass = async (id: string | null) => {
    setViewingGroupId(id);
    if (id) {
      try {
        const details = await getClassroomDetails(id);
        setFullGroupDetails(details);
      } catch (error) {
        console.error("Error al obtener detalle del grupo:", error);
        setFullGroupDetails(myGroups.find((g) => String(g.id) === String(id)));
      }
    } else {
      setFullGroupDetails(null);
    }
  };

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

  const dashboardStyles = `
    .leaderboard-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; position: relative; transition: all 0.2s; cursor: pointer; }
    .leaderboard-row:hover { background-color: #f7f7f7; }
    .xp-tooltip { position: absolute; right: 15px; background: #4b4b4b; color: white; padding: 5px 10px; border-radius: 8px; font-size: 12px; opacity: 0; transition: 0.2s; pointer-events: none; }
    .leaderboard-row:hover .xp-tooltip { opacity: 1; }
    .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Poppins', sans-serif; }
    .section-card { padding: 20px; border-radius: 18px; border: 2px solid #E5E5E5; margin-bottom: 20px; background-color: white; }
  `;

  if (isLoading) {
    const rainbowColors = [
      "#FF4B4B", // rojo
      "#FF9600", // naranja
      "#FFD800", // amarillo
      "#58CC02", // verde
      "#1CB0F6", // celeste
      "#906CFF", // violeta
      "#FF6F9F", // rosa
    ];

    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: "3.5rem",
            fontWeight: 900,
            marginBottom: 24,
            letterSpacing: "0.08em",
          }}
        >
          {"Bienvenido".split("").map((char, index) => (
            <motion.span
              key={index}
              animate={{ color: rainbowColors }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.15,
              }}
              style={{
                display: "inline-block",
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <video
          src="/caminando.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: 320,
            height: "auto",
            objectFit: "contain",
            marginBottom: 28,
          }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          style={{
            color: "#1CB0F6",
            fontWeight: 900,
            fontSize: "1.2rem",
          }}
        >
          Cargando...
        </motion.p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "white",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{dashboardStyles}</style>

      <Sidebar
        active={section}
        onChange={setSection}
        onLogout={handleLogout}
        userProfile={userProfile!}
      />

      <div style={{ flex: 1, marginLeft: 260, display: "flex" }}>
        <main
          style={{
            flex: 1,
            padding: "40px 20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: "700px" }}>
            {section === "learn" && (
              <LearnSection
                units={units}
                userProfile={userProfile!}
                heartTimer={heartTimer}
                onUpdateProfile={setUserProfile}
                onRefreshData={loadData}
              />
            )}

            {section === "evaluations" && <EvaluationsSection />}

            {section === "sounds" && (
              <SoundsSection soundItems={SOUND_DATA} />
            )}

            {section === "groups" && (
              <GroupsSection
                theme={{}}
                myGroups={myGroups}
                viewingGroupId={viewingGroupId}
                setViewingGroupId={handleViewClass}
                groupDetails={fullGroupDetails}
                groupTab={groupTab}
                setGroupTab={setGroupTab}
              />
            )}

            {section === "shop" && (
              <ShopSection
                userProfile={userProfile!}
                handlePurchase={handlePurchase}
              />
            )}
            {section === "profile" && <ProfileSection />}
            {section === "challenges" && (
              <div
                style={{
                  backgroundColor: "#131f24",
                  borderRadius: "24px",
                  padding: "10px",
                }}
              >
                <Challenges />
              </div>
            )}
          </div>
        </main>

        <aside
          style={{
            width: 380,
            padding: "30px 20px",
            borderLeft: "2px solid #E5E5E5",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <StatsBar profile={userProfile!} />
          <UserSearch />
          <FriendRequests />

          <div className="section-card">
            <h4
              style={{
                margin: "0 0 15px 0",
                fontSize: "18px",
                fontWeight: "800",
                color: "#4b4b4b",
              }}
            >
              Amigos
            </h4>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="leaderboard-row"
                  onClick={() => setActiveChatFriend(friend)}
                >
                  <div
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      backgroundColor: "#1cb0f6",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                      marginRight: 8,
                    }}
                  >
                    {friend.fullName.charAt(0)}
                  </div>

                  <span
                    style={{
                      flex: 1,
                      fontWeight: 700,
                      color: "#4b4b4b",
                      fontSize: "0.9rem",
                    }}
                  >
                    {friend.fullName}
                  </span>

                  <span
                    style={{
                      color: "#777",
                      fontSize: "13px",
                      marginRight: 8,
                      minWidth: 60,
                      textAlign: "right",
                    }}
                  >
                    {friend.xpTotal} XP
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChatFriend(friend);
                    }}
                    style={{
                      borderRadius: 999,
                      border: "1px solid #1cb0f6",
                      background: "white",
                      color: "#1cb0f6",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      cursor: "pointer",
                      marginRight: 4,
                    }}
                  >
                    💬 Chat
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/friend-profile/${friend.id}`);
                    }}
                    style={{
                      borderRadius: 999,
                      border: "1px solid #e5e5e5",
                      background: "white",
                      color: "#6b7280",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 6px",
                      cursor: "pointer",
                    }}
                  >
                    Ver
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "13px", color: "#999" }}>
                Busca amigos para comparar tu progreso.
              </p>
            )}
          </div>

          {activeChatFriend && userProfile && (
  <FriendsChat
    friend={activeChatFriend}
    currentUserId={userProfile.userId || userProfile.username}
    onClose={() => setActiveChatFriend(null)}
  />
)}


          <div className="section-card">
            <h4
              style={{
                margin: "0 0 15px 0",
                fontSize: "18px",
                fontWeight: "800",
                color: "#4b4b4b",
              }}
            >
              Ranking Global
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {leaderboard.slice(0, 5).map((user, index) => {
                const isMe = user.userId === userProfile?.userId;
                return (
                  <div
                    key={user.userId || index}
                    className="leaderboard-row"
                    style={{
                      backgroundColor: isMe ? "#DDF4FF" : "transparent",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "900",
                        width: "25px",
                        color: index < 3 ? "#1CB0F6" : "#AFAFAF",
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontWeight: "700",
                        fontSize: "0.9rem",
                        color: isMe ? "#1899D6" : "#4b4b4b",
                      }}
                    >
                      {isMe ? "Tú" : user.fullName}
                    </span>
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
