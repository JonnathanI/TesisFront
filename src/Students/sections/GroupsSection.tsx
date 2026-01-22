import React from "react";
import { LeaderboardEntry } from "../../api/auth.service";
import { ChevronLeft, BookOpen, Trophy, Users as UsersIcon } from "lucide-react";

interface Props {
  theme: any;
  joinCode: string;
  setJoinCode: (v: string) => void;
  myGroups: any[];
  viewingGroupId: string | null;
  setViewingGroupId: (id: string | null) => void;
  groupDetails: any;
  groupTab: "TAREAS" | "LIGA";
  setGroupTab: (t: "TAREAS" | "LIGA") => void;
  leaderboard: LeaderboardEntry[];
  handleJoinGroup: () => void;
}

export default function GroupsSection({
  joinCode,
  setJoinCode,
  myGroups,
  viewingGroupId,
  setViewingGroupId,
  groupDetails,
  groupTab,
  setGroupTab,
  leaderboard,
  handleJoinGroup,
}: Props) {
  
  const styles = `
    .group-card {
      background: white;
      border: 2px solid #E5E5E5;
      border-bottom: 5px solid #E5E5E5;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.1s;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .group-card:hover { background-color: #F7F7F7; transform: translateY(-2px); }
    .group-card:active { transform: translateY(2px); border-bottom-width: 2px; }

    .tab-button {
      flex: 1;
      padding: 12px;
      border: none;
      background: none;
      font-weight: 800;
      color: #AFAFAF;
      cursor: pointer;
      border-bottom: 3px solid #E5E5E5;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .tab-button.active {
      color: #1CB0F6;
      border-bottom: 3px solid #1CB0F6;
    }

    .join-input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #E5E5E5;
      border-radius: 12px;
      background: #F7F7F7;
      font-weight: bold;
      margin-bottom: 15px;
      outline: none;
    }
    .join-input:focus { border-color: #1CB0F6; }

    .btn-primary {
      width: 100%;
      padding: 12px;
      background: #1CB0F6;
      color: white;
      border: none;
      border-bottom: 4px solid #1899D6;
      border-radius: 12px;
      font-weight: 800;
      cursor: pointer;
      text-transform: uppercase;
    }
    .btn-primary:active { transform: translateY(2px); border-bottom-width: 0; }
  `;

  // VISTA: LISTA DE MIS CLASES
  if (!viewingGroupId) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "50px" }}>
        <style>{styles}</style>
        
        <h2 style={{ fontWeight: 900, color: "#3C3C3C", marginBottom: "20px" }}>Mis Clases</h2>

        {/* Formulario para unirse */}
        <div style={{ background: "#FFF", border: "2px solid #E5E5E5", padding: "20px", borderRadius: "18px", marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", fontWeight: 800 }}>¿Tienes un código?</h3>
          <input
            className="join-input"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="EJ: ABC123"
          />
          <button className="btn-primary" onClick={handleJoinGroup}>Unirse a la clase</button>
        </div>

        {/* Listado de grupos */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {myGroups.length > 0 ? (
            myGroups.map((g) => (
              <div key={g.id} className="group-card" onClick={() => setViewingGroupId(g.id)}>
                <div style={{ background: "#CEF3FF", padding: "10px", borderRadius: "12px" }}>
                  <UsersIcon color="#1CB0F6" size={30} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#4B4B4B" }}>{g.name}</h4>
                  <p style={{ margin: 0, color: "#AFAFAF", fontSize: "14px", fontWeight: "bold" }}>
                    Profesor: {g.teacherName || "Sin asignar"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#AFAFAF" }}>
              <UsersIcon size={48} style={{ marginBottom: "10px", opacity: 0.5 }} />
              <p style={{ fontWeight: "bold" }}>Aún no perteneces a ninguna clase.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VISTA: DETALLE DEL GRUPO (TAREAS O LIGA)
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <style>{styles}</style>
      
      {/* Header del Grupo */}
      <button 
        onClick={() => setViewingGroupId(null)}
        style={{ background: "none", border: "none", color: "#AFAFAF", display: "flex", alignItems: "center", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" }}
      >
        <ChevronLeft size={20} /> VOLVER A CLASES
      </button>

      <div style={{ marginBottom: "25px" }}>
        <h2 style={{ margin: "0 0 5px 0", fontWeight: 900, color: "#3C3C3C", fontSize: "28px" }}>
          {groupDetails?.name}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#AFAFAF", fontWeight: "bold" }}>
          <UsersIcon size={16} />
          <span>{leaderboard.length} estudiantes</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: "25px" }}>
        <button 
          className={`tab-button ${groupTab === "TAREAS" ? "active" : ""}`}
          onClick={() => setGroupTab("TAREAS")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <BookOpen size={18} /> Tareas
          </div>
        </button>
        <button 
          className={`tab-button ${groupTab === "LIGA" ? "active" : ""}`}
          onClick={() => setGroupTab("LIGA")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Trophy size={18} /> Liga de clase
          </div>
        </button>
      </div>

      {/* Contenido de Tareas */}
      {groupTab === "TAREAS" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {groupDetails?.assignments?.length > 0 ? (
            groupDetails.assignments.map((a: any) => (
              <div key={a.id} className="group-card" style={{ cursor: "default" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 5px 0", color: "#4B4B4B", fontWeight: 800 }}>{a.title}</h4>
                  <p style={{ margin: 0, color: "#777", fontSize: "14px" }}>{a.description}</p>
                </div>
                <div style={{ color: "#58CC02", fontWeight: "bold", fontSize: "14px" }}>
                  PENDIENTE
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#AFAFAF", fontWeight: "bold", marginTop: "20px" }}>
              No tienes tareas pendientes en esta clase. 🙌
            </p>
          )}
        </div>
      ) : (
        /* Contenido de la Liga (Ranking del Grupo) */
        <div style={{ background: "white", border: "2px solid #E5E5E5", borderRadius: "18px", overflow: "hidden" }}>
          {leaderboard.map((u, i) => (
            <div key={u.userId} style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "15px 20px", 
              borderBottom: i === leaderboard.length - 1 ? "none" : "2px solid #E5E5E5",
              gap: "15px"
            }}>
              <span style={{ width: "25px", fontWeight: "900", color: i < 3 ? "#1CB0F6" : "#AFAFAF" }}>{i + 1}</span>
              <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "#E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#777" }}>
                {u.fullName.charAt(0)}
              </div>
              <span style={{ flex: 1, fontWeight: "bold", color: "#4B4B4B" }}>{u.fullName}</span>
              <span style={{ fontWeight: "800", color: "#777" }}>{u.xpTotal} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}