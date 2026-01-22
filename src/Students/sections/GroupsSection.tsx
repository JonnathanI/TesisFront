import React from "react";
import { LeaderboardEntry } from "../../api/auth.service";

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
  theme,
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
  if (!viewingGroupId) {
    return (
      <>
        <div style={{ background: theme.cardBg, padding: "2rem", borderRadius: "1rem" }}>
          <h2>Únete a una clase</h2>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="CÓDIGO"
          />
          <button onClick={handleJoinGroup}>UNIRSE</button>
        </div>

        <h3>Mis Clases</h3>
        {myGroups.map((g) => (
          <div key={g.id} onClick={() => setViewingGroupId(g.id)}>
            <h4>{g.name}</h4>
            <p>Profesor: {g.teacherName}</p>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <button onClick={() => setViewingGroupId(null)}>⬅ Volver</button>
      <h2>{groupDetails?.name}</h2>

      <button onClick={() => setGroupTab("TAREAS")}>Tareas</button>
      <button onClick={() => setGroupTab("LIGA")}>Liga</button>

      {groupTab === "TAREAS"
        ? groupDetails?.assignments?.map((a: any) => (
            <div key={a.id}>
              <h4>{a.title}</h4>
              <small>{a.description}</small>
            </div>
          ))
        : leaderboard.map((u, i) => (
            <div key={u.userId}>
              #{i + 1} {u.fullName} - {u.xpTotal} XP
            </div>
          ))}
    </>
  );
}
