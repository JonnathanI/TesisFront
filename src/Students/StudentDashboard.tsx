// src/Students/StudentDashboard.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar";
import { LearnSection } from "./sections/LearnSection";
import SoundsSection from "./sections/SoundsSection";
import GroupsSection from "./sections/GroupsSection";
import ShopSection from "./sections/ShopSection";
import ProfileSection from "./sections/ProfileSection";
import Challenges from "./Challenges";
import { FriendsChat } from "./components/FriendsChat";
import { BadgesSection } from "./sections/BadgesSection";
import { FriendRequests } from "./components/FriendRequests";
import { UserSearch } from "./components/UserSearch";
import { SOUND_DATA } from "../data/soundData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EvaluationsSection } from "./sections/EvaluationsSection";

// ⬇️ NUEVO IMPORT
import { NotificationsBell } from "./components/NotificationsBell";
import { requestNotificationPermissionAndToken } from "../firebase";
import { registerFcmToken } from "../api/auth.service";

import {
  getUserProfile,
  getCourses,
  getGlobalLeaderboard,
  buyShopItem,
  removeToken,
  getFriendsList,
  getStudentClassrooms,
  getStudentClassroomDetails,
  getCourseUnits,
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
  const [activeChatFriend, setActiveChatFriend] =
    useState<StudentData | null>(null);

  // --- ESTADOS PARA GRUPOS ---
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null);
  const [fullGroupDetails, setFullGroupDetails] = useState<any>(null);
  const [groupTab, setGroupTab] = useState<"TAREAS" | "COMPAÑEROS">("TAREAS");

  // 🔥 RESPONSIVE BREAKPOINTS
  const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  // Drawer Izquierdo (sidebar) y Drawer Derecho (panel)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 768) setScreen("mobile");
      else if (w < 1024) setScreen("tablet");
      else setScreen("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isDesktop = screen === "desktop";

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

        // 🔹 1) Traer todos los cursos visibles
        const courses = await getCourses();
        console.log("📚 Cursos visibles para el alumno:", courses);

        let foundUnits: UnitWithLessons[] = [];
        let usedCourseId: string | null = null;

        // 🔹 2) Probar curso por curso hasta encontrar uno con unidades
        for (const c of courses) {
          const cid = String(c.id);
          const unitsData = await getCourseUnits(cid);
          console.log(
            "🔎 Probando curso:",
            c.title,
            cid,
            " -> units:",
            unitsData.length
          );

          if (unitsData.length > 0) {
            foundUnits = unitsData;
            usedCourseId = cid;
            break;
          }
        }

        if (usedCourseId) {
          console.log("✅ Usando courseId para LearnSection:", usedCourseId);
          setUnits(foundUnits);
        } else {
          console.warn("⚠️ Ningún curso con unidades visibles para este alumno");
          setUnits([]);
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

    // 🔥 Registrar token FCM en el backend (solo una vez al entrar)
  useEffect(() => {
    const setupFcm = async () => {
      try {
        const token = await requestNotificationPermissionAndToken();
        if (!token) {
          console.log("Usuario no aceptó notificaciones o no hay token");
          return;
        }
        await registerFcmToken(token);
        console.log("✅ FCM token registrado en backend:", token);
      } catch (e) {
        console.error("Error registrando FCM token:", e);
      }
    };

    setupFcm();
  }, []);

  // 🔥 Carga el detalle real (alumnos/compañeros) al hacer clic
  const handleViewClass = async (id: string | null) => {
    setViewingGroupId(id);

    if (!id) {
      setFullGroupDetails(null);
      return;
    }

    try {
      const details = await getStudentClassroomDetails(id);
      console.log("DETALLE DEL GRUPO (ALUMNO):", details);
      setFullGroupDetails(details);
    } catch (error) {
      console.error("Error al obtener detalle del grupo:", error);
      setFullGroupDetails(
        myGroups.find((g) => String(g.id) === String(id)) || null
      );
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

  // ✅ Cerrar drawers al ir a desktop
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(false);
      setIsRightPanelOpen(false);
    }
  }, [isDesktop]);

  // ✅ ESC para cerrar drawers
  useEffect(() => {
    const anyOpen = isSidebarOpen || isRightPanelOpen;
    if (!anyOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
        setIsRightPanelOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen, isRightPanelOpen]);

  // ✅ Evitar scroll del body cuando hay drawer abierto
  useEffect(() => {
    const anyOpen = isSidebarOpen || isRightPanelOpen;
    if (!anyOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSidebarOpen, isRightPanelOpen]);

  // 🔥 Panel derecho reutilizable (evita duplicar)
  const RightPanel = useMemo(() => {
    if (!userProfile) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <StatsBar profile={userProfile} />

        {/* 🔔 CAMPANA DE NOTIFICACIONES */}
        <NotificationsBell />

        <UserSearch />
        <FriendRequests />

        {/* Amigos */}
        <div className="section-card">
          <h4
            style={{
              margin: "0 0 15px 0",
              fontSize: 18,
              fontWeight: 800,
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
                style={{ flexWrap: "wrap" }}
              >
                <div
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    backgroundColor: "#1cb0f6",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    marginRight: 8,
                    flexShrink: 0,
                  }}
                >
                  {friend.fullName.charAt(0)}
                </div>

                <span
                  style={{
                    flex: 1,
                    minWidth: 120,
                    fontWeight: 700,
                    color: "#4b4b4b",
                    fontSize: "0.95rem",
                  }}
                >
                  {friend.fullName}
                </span>

                <span
                  style={{
                    color: "#777",
                    fontSize: 13,
                    marginRight: 8,
                    minWidth: 70,
                    textAlign: "right",
                  }}
                >
                  {friend.xpTotal} XP
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginLeft: "auto",
                  }}
                >
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
                      padding: "6px 10px",
                      cursor: "pointer",
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
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Ver
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13, color: "#999" }}>
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

        {/* Ranking */}
        <div className="section-card">
          <h4
            style={{
              margin: "0 0 15px 0",
              fontSize: 18,
              fontWeight: 800,
              color: "#4b4b4b",
            }}
          >
            Ranking Global
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                      fontWeight: 900,
                      width: 25,
                      color: index < 3 ? "#1CB0F6" : "#AFAFAF",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: isMe ? "#1899D6" : "#4b4b4b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={isMe ? "Tú" : user.fullName}
                  >
                    {isMe ? "Tú" : user.fullName}
                  </span>

                  <div className="xp-tooltip">⭐ {user.xpTotal} XP</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [userProfile, friends, leaderboard, activeChatFriend, navigate]);

  const dashboardStyles = `
    .leaderboard-row { display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; position:relative; transition:all .2s; cursor:pointer; }
    .leaderboard-row:hover { background-color:#f7f7f7; }
    .xp-tooltip { position:absolute; right:15px; background:#4b4b4b; color:white; padding:5px 10px; border-radius:8px; font-size:12px; opacity:0; transition:.2s; pointer-events:none; }
    .leaderboard-row:hover .xp-tooltip { opacity:1; }
    .section-card { padding:20px; border-radius:18px; border:2px solid #E5E5E5; margin-bottom:20px; background-color:white; }
    * { box-sizing:border-box; }
    body { overflow-x:hidden; }

    /* ✅ Overlay compartido */
    .drawer-overlay{
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      z-index: 110;
    }

    /* ✅ Drawer Izquierdo */
    .sidebar-drawer{
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 280px;
      background: white;
      z-index: 130;
      box-shadow: 8px 0 30px rgba(0,0,0,.12);
      overflow-y: auto;
    }

    /* ✅ Drawer Derecho (panel) */
    .rightpanel-drawer{
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 320px;
      max-width: 92vw;
      background: white;
      z-index: 130;
      box-shadow: -8px 0 30px rgba(0,0,0,.12);
      overflow-y: auto;
      padding: 16px;
    }
  `;

  if (isLoading) {
    const rainbowColors = [
      "#FF4B4B",
      "#FF9600",
      "#FFD800",
      "#58CC02",
      "#1CB0F6",
      "#906CFF",
      "#FF6F9F",
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
            textAlign: "center",
            padding: "0 12px",
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
              style={{ display: "inline-block" }}
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
            maxWidth: "85vw",
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
        minHeight: "100vh",
        backgroundColor: "white",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>{dashboardStyles}</style>

      {/* ✅ Mensaje de error arriba (si existe) */}
      {errorMsg && (
        <div
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 200,
            background: "#fff1f2",
            border: "2px solid #fecdd3",
            color: "#9f1239",
            padding: "10px 12px",
            borderRadius: 12,
            fontWeight: 800,
            maxWidth: 360,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* 🔥 BOTÓN MENÚ IZQUIERDO */}
      {!isDesktop && (
        <button
          onClick={() => {
            setIsSidebarOpen(true);
            setIsRightPanelOpen(false);
          }}
          style={{
            position: "fixed",
            left: 12,
            top: 12,
            zIndex: 140,
            background: "white",
            borderRadius: 999,
            border: "2px solid #E5E5E5",
            padding: "8px 12px",
            fontWeight: 900,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      )}

      {/* 🔥 BOTÓN MENÚ DERECHO (PANEL) */}
      {!isDesktop && (
        <button
          onClick={() => {
            setIsRightPanelOpen(true);
            setIsSidebarOpen(false);
          }}
          style={{
            position: "fixed",
            right: 12,
            top: 12,
            zIndex: 140,
            background: "white",
            borderRadius: 999,
            border: "2px solid #E5E5E5",
            padding: "8px 12px",
            fontWeight: 900,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
        >
          ☰ Panel
        </button>
      )}

      {/* ✅ Desktop: sidebar fijo */}
      {isDesktop && userProfile && (
        <Sidebar
          active={section}
          onChange={(sec) => setSection(sec)}
          onLogout={handleLogout}
          userProfile={userProfile}
        />
      )}

      {/* ✅ Overlay (si cualquier drawer está abierto) */}
      {(isSidebarOpen || isRightPanelOpen) && !isDesktop && (
        <div
          className="drawer-overlay"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsRightPanelOpen(false);
          }}
        />
      )}

      {/* ✅ Drawer Izquierdo */}
      {!isDesktop && isSidebarOpen && userProfile && (
        <div className="sidebar-drawer">
          <Sidebar
            active={section}
            onChange={(sec) => {
              setSection(sec);
              setIsSidebarOpen(false);
            }}
            onLogout={handleLogout}
            userProfile={userProfile}
          />
        </div>
      )}

      {/* ✅ Drawer Derecho */}
      {!isDesktop && isRightPanelOpen && userProfile && (
        <div className="rightpanel-drawer">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setIsRightPanelOpen(false)}
              style={{
                borderRadius: 999,
                border: "2px solid #E5E5E5",
                background: "white",
                padding: "6px 10px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginTop: 12 }}>{RightPanel}</div>
        </div>
      )}

      {/* CONTENEDOR CENTRAL */}
      <div
        style={{
          marginLeft: isDesktop ? 260 : 0,
          padding: isDesktop ? "24px 32px" : "56px 12px 16px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* GRID: Desktop 2 columnas / Mobile-Tablet 1 columna */}
        <div
          style={{
            width: "100%",
            maxWidth: isDesktop ? 1200 : 900,
            display: "grid",
            gridTemplateColumns: isDesktop ? "minmax(0, 720px) 360px" : "1fr",
            gap: isDesktop ? 24 : 16,
          }}
        >
          {/* ==================== MAIN (SECCIONES) ==================== */}
          <main style={{ width: "100%", minWidth: 0 }}>
            {section === "learn" && userProfile && (
              <LearnSection
                units={units}
                userProfile={userProfile}
                heartTimer={heartTimer}
                onUpdateProfile={setUserProfile}
                onRefreshData={loadData}
              />
            )}

            {section === "evaluations" && <EvaluationsSection />}

            {section === "sounds" && <SoundsSection soundItems={SOUND_DATA} />}

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

            {section === "shop" && userProfile && (
              <ShopSection
                userProfile={userProfile}
                handlePurchase={handlePurchase}
              />
            )}

            {section === "profile" && <ProfileSection />}

            {section === "badges" && (
              <>
                <pre style={{ fontSize: 10, color: "gray" }}>
                  DEBUG badges – section: {section} – userId:{" "}
                  {userProfile?.userId}
                </pre>
                <BadgesSection />
              </>
            )}

            {section === "challenges" && (
              <div
                style={{
                  backgroundColor: "#131f24",
                  borderRadius: 24,
                  padding: 10,
                }}
              >
                <Challenges />
              </div>
            )}
          </main>

          {/* ==================== ASIDE SOLO EN DESKTOP ==================== */}
          {isDesktop && userProfile && (
            <aside
              style={{
                width: "100%",
                minWidth: 0,
                paddingLeft: 24,
                borderLeft: "2px solid #E5E5E5",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {RightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;