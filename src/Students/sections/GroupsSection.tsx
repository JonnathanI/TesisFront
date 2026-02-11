import React from "react";
import { ChevronLeft, BookOpen, Users as UsersIcon } from "lucide-react";

interface Props {
  theme: any;
  myGroups: any[];
  viewingGroupId: string | null;
  setViewingGroupId: (id: string | null) => void;
  groupDetails: any;
  groupTab: "TAREAS" | "COMPAÑEROS"; // Cambiado de LIGA a COMPAÑEROS
  setGroupTab: (t: "TAREAS" | "COMPAÑEROS") => void;
}

export default function GroupsSection({
  myGroups,
  viewingGroupId,
  setViewingGroupId,
  groupDetails,
  groupTab,
  setGroupTab,
}: Props) {
  const styles = `
    .group-card {
      background: white;
      border: 2px solid #E5E5E5;
      border-bottom: 5px solid #E5E5E5;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.1s;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .group-card:hover { background-color: #F7F7F7; transform: translateY(-2px); border-color: #1CB0F6; }
    .group-card:active { transform: translateY(2px); border-bottom-width: 2px; }

    .tab-button {
      flex: 1;
      padding: 15px;
      border: none;
      background: none;
      font-weight: 800;
      color: #AFAFAF;
      cursor: pointer;
      border-bottom: 3px solid #E5E5E5;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.2s;
    }
    .tab-button.active {
      color: #1CB0F6;
      border-bottom: 3px solid #1CB0F6;
    }

    .badge-status {
      padding: 4px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }
  `;

  // VISTA 1: LISTA DE MIS CLASES
  if (!viewingGroupId) {
    return (
      <div
        style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "50px" }}
      >
        <style>{styles}</style>

        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              fontWeight: 900,
              color: "#3C3C3C",
              fontSize: "32px",
              margin: "0 0 8px 0",
            }}
          >
            Mis Clases
          </h2>
          <p style={{ color: "#AFAFAF", fontWeight: "bold" }}>
            Aquí aparecen los grupos donde estás inscrito.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {myGroups && myGroups.length > 0 ? (
            myGroups.map((g) => (
              <div
                key={g.id}
                className="group-card"
                onClick={() => setViewingGroupId(g.id)}
              >
                <div
                  style={{
                    background: "#DDF4FF",
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UsersIcon color="#1CB0F6" size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: 900,
                      color: "#4B4B4B",
                    }}
                  >
                    {g.name}
                  </h4>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#AFAFAF",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Profesor:{" "}
                    <span style={{ color: "#777" }}>
                      {g.teacherName || "Tu profesor"}
                    </span>
                  </p>
                </div>
                <div style={{ color: "#1CB0F6", fontWeight: "900" }}>→</div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#F7F7F7",
                borderRadius: "24px",
              }}
            >
              <p style={{ color: "#AFAFAF", fontWeight: "bold" }}>
                No tienes grupos registrados.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  console.log("DEBUG: Mi grupo actual es:", groupDetails);

  // 👇 Aquí probamos varios nombres posibles para el array de tareas
  const assignments =
    groupDetails?.assignments ||
    groupDetails?.tasks ||
    groupDetails?.classroomAssignments ||
    groupDetails?.homeworks ||
    [];

  // VISTA 2: DETALLE DEL GRUPO (TAREAS O COMPAÑEROS)
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <style>{styles}</style>

      <button
        onClick={() => setViewingGroupId(null)}
        style={{
          background: "none",
          border: "none",
          color: "#AFAFAF",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: "800",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        <ChevronLeft size={18} /> VOLVER A MIS CLASES
      </button>

      <div style={{ marginBottom: "30px" }}>
        <h2
          style={{
            margin: "0 0 5px 0",
            fontWeight: 900,
            color: "#3C3C3C",
            fontSize: "32px",
          }}
        >
          {groupDetails?.name}
        </h2>
        <div
          style={{
            color: "#1CB0F6",
            fontWeight: "bold",
            fontSize: "14px",
            textTransform: "uppercase",
          }}
        >
          Detalle de la Clase
        </div>
      </div>

      {/* Tabs Actualizados */}
      <div style={{ display: "flex", marginBottom: "30px", gap: "10px" }}>
        <button
          className={`tab-button ${groupTab === "TAREAS" ? "active" : ""}`}
          onClick={() => setGroupTab("TAREAS")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <BookOpen size={20} /> Tareas
          </div>
        </button>
        <button
          className={`tab-button ${
            groupTab === "COMPAÑEROS" ? "active" : ""
          }`}
          onClick={() => setGroupTab("COMPAÑEROS")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <UsersIcon size={20} /> Compañeros
          </div>
        </button>
      </div>

      {groupTab === "TAREAS" ? (
        /* LISTADO DE TAREAS */
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {assignments.length > 0 ? (
            assignments.map((a: any, idx: number) => (
              <div
                key={a.id || idx}
                className="group-card"
                style={{ cursor: "default", borderBottomWidth: "4px" }}
              >
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: "0 0 5px 0",
                      color: "#4B4B4B",
                      fontWeight: 900,
                      fontSize: "18px",
                    }}
                  >
                    {a.title || a.name || "Tarea"}
                  </h4>
                  {(a.description || a.instructions) && (
                    <p
                      style={{
                        margin: 0,
                        color: "#777",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      {a.description || a.instructions}
                    </p>
                  )}

                  {a.dueDate && (
                    <p
                      style={{
                        marginTop: 6,
                        color: "#AFAFAF",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      Vence:{" "}
                      {new Date(a.dueDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div
                  className="badge-status"
                  style={{ background: "#E5FFD1", color: "#58CC02" }}
                >
                  Activa
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#AFAFAF", fontWeight: "bold" }}>
                No hay tareas asignadas.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* LISTADO DE COMPAÑEROS DE CLASE */
        <div
          style={{
            background: "white",
            border: "2px solid #E5E5E5",
            borderRadius: "24px",
            overflow: "hidden",
            borderBottomWidth: "5px",
          }}
        >
          {groupDetails?.students && groupDetails.students.length > 0 ? (
            groupDetails.students.map((student: any, i: number) => (
              <div
                key={student.userId || i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "20px",
                  borderBottom:
                    i === groupDetails.students.length - 1
                      ? "none"
                      : "2px solid #E5E5E5",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#E5E5E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    color: "#777",
                  }}
                >
                  {student.fullName?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontWeight: "800",
                      color: "#4B4B4B",
                      display: "block",
                    }}
                  >
                    {student.fullName}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#AFAFAF",
                      fontWeight: "bold",
                    }}
                  >
                    Estudiante
                  </span>
                </div>
                <div style={{ fontWeight: "900", color: "#1CB0F6" }}>
                  {student.xpTotal || 0}{" "}
                  <span style={{ fontSize: "10px" }}>XP</span>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#AFAFAF",
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                No hay otros alumnos en esta clase.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
