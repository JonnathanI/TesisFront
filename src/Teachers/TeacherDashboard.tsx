import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { removeToken } from "../api/auth.service";
import { useNavigate } from "react-router-dom";

// --- SECCIONES ---
import { CoursesSection } from "./sections/CoursesSection";
import { UnitsSection } from "./sections/UnitsSection";
import { LessonsSection } from "./sections/LessonsSection";
import { GroupsSection } from "./sections/GroupsSection";
import { GenerateCodeSection } from "./sections/GenerateCodeSection";
import { QuestionsSection } from "./sections/QuestionsSection";
import { EvaluationsSection } from "./sections/EvaluationsSection";
import { StudentsSection } from "./sections/StudentsSection"; // ✅ Nueva sección

import {
  getCourses,
  getCourseUnits,
  getLessonsByUnit,
  getTeacherClassrooms
} from "../api/auth.service";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("courses");

  // --- ESTADOS DE DATOS ---
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // --- ESTADOS DE SELECCIÓN ---
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // ==========================================
  // LÓGICA DE CARGA DE DATOS
  // ==========================================

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  const loadUnits = async (courseId: string) => {
    setSelectedCourseId(courseId);
    try {
      const data = await getCourseUnits(courseId);
      setUnits(data);
      setLessons([]); // Reset lecciones al cambiar curso
      setSelectedUnitId(null);
    } catch (error) {
      console.error("Error al cargar unidades:", error);
    }
  };

  const loadLessons = async (unitId: string) => {
    setSelectedUnitId(unitId);
    try {
      const data = await getLessonsByUnit(unitId);
      setLessons(data);
    } catch (error) {
      console.error("Error al cargar lecciones:", error);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await getTeacherClassrooms();
      setGroups(data);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  // Carga inicial
  useEffect(() => {
    loadCourses();
    loadGroups();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f6f7f8",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* SIDEBAR */}
      <Sidebar
        sidebarNavItems={[
          { id: "courses", label: "Cursos", icon: "📘" },
          { id: "units", label: "Unidades", icon: "📚" },
          { id: "lessons", label: "Lecciones", icon: "📖" },
          { id: "questions", label: "Preguntas", icon: "❓" },
          { id: "students", label: "Estudiantes", icon: "🎓" }, // ✅ Agregado
          { id: "groups", label: "Grupos", icon: "👥" },
          { id: "code", label: "Código", icon: "🔐" },
          { id: "evaluations", label: "Evaluaciones", icon: "📝" }
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSubTab={() => {}}
        resetForm={() => {}}
        currentTheme={{ border: "#e5e5e5", sidebarBg: "#ffffff" }}
        theme="light"
        handleMoreMenuClick={() => {}}
        showMoreMenu={false}
        setShowMoreMenu={() => {}}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px"
          }}
        >
          <h2 style={{ margin: 0, color: "#3c3c3c", fontWeight: 800 }}>
            Panel de Control del Profesor
          </h2>

          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              background: "#ff4b4b", // Rojo Duolingo para salir
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 0 #d33131",
              transition: "transform 0.1s"
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
          >
            Cerrar sesión
          </button>
        </div>

        {/* CONTENEDOR DE SECCIONES */}
        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            minHeight: "calc(100vh - 150px)"
          }}
        >
          {activeTab === "courses" && (
            <CoursesSection
              courses={courses}
              onSelectCourse={loadUnits}
              onRefresh={loadCourses}
            />
          )}

          {activeTab === "units" && (
            <UnitsSection
              courses={courses}
              units={units}
              selectedCourseId={selectedCourseId}
              onSelectCourse={loadUnits}
              onRefresh={() => selectedCourseId && loadUnits(selectedCourseId)}
            />
          )}

          {activeTab === "lessons" && (
            <LessonsSection
              units={units}
              lessons={lessons}
              selectedUnitId={selectedUnitId}
              onSelectUnit={loadLessons}
              onRefresh={() => selectedUnitId && loadLessons(selectedUnitId)}
            />
          )}

          {/* ✅ NUEVA SECCIÓN DE ESTUDIANTES */}
          {activeTab === "students" && <StudentsSection />}

          {activeTab === "questions" && <QuestionsSection />}
          
          {activeTab === "groups" && (
            <GroupsSection 
              groups={groups} 
              onRefresh={loadGroups} 
            />
          )}

          {activeTab === "code" && <GenerateCodeSection />}
          
          {activeTab === "evaluations" && <EvaluationsSection />}
        </div>
      </main>

      {/* MODAL DE CIERRE DE SESIÓN */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              textAlign: "center",
              minWidth: "320px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}
          >
            <h3 style={{ marginTop: 0 }}>¿Cerrar sesión?</h3>
            <p style={{ color: "#777", marginBottom: "25px" }}>
              Tendrás que volver a ingresar tus credenciales para acceder.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={handleLogout}
                style={{
                  background: "#ff4b4b",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Cerrar Sesión
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  background: "#e5e5e5",
                  color: "#4b4b4b",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}