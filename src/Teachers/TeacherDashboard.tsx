import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { removeToken } from "../api/auth.service";
import { useNavigate } from "react-router-dom";

import { CoursesSection } from "./sections/CoursesSection";
import { UnitsSection } from "./sections/UnitsSection";
import { LessonsSection } from "./sections/LessonsSection";
import { GroupsSection } from "./sections/GroupsSection";
import { GenerateCodeSection } from "./sections/GenerateCodeSection";
import { QuestionsSection } from "./sections/QuestionsSection";
import { EvaluationsSection } from "./sections/EvaluationsSection";

import {
  getCourses,
  getCourseUnits,
  getLessonsByUnit,
  getTeacherClassrooms
} from "../api/auth.service";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("courses");

  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data);
  };

  const loadUnits = async (courseId: string) => {
    setSelectedCourseId(courseId);
    const data = await getCourseUnits(courseId);
    setUnits(data);
    setLessons([]);
    setSelectedUnitId(null);
  };

  const loadLessons = async (unitId: string) => {
    setSelectedUnitId(unitId);
    const data = await getLessonsByUnit(unitId);
    setLessons(data);
  };

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  useEffect(() => {
    loadCourses();
    getTeacherClassrooms().then(setGroups);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f6f7f8"
      }}
    >
      {/* SIDEBAR (SIN TOCAR LÓGICA) */}
      <Sidebar
        sidebarNavItems={[
          { id: "courses", label: "Cursos", icon: "📘" },
          { id: "units", label: "Unidades", icon: "📚" },
          { id: "lessons", label: "Lecciones", icon: "📖" },
          { id: "questions", label: "Preguntas", icon: "❓" },
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

      {/* CONTENIDO */}
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
          <h2 style={{ margin: 0, color: "#333" }}>
            Panel del Profesor
          </h2>

          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              background: "#58CC02",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* CARD CONTENEDORA */}
        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
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

          {activeTab === "questions" && <QuestionsSection />}
          {activeTab === "groups" && <GroupsSection groups={groups} />}
          {activeTab === "code" && <GenerateCodeSection />}
          {activeTab === "evaluations" && <EvaluationsSection />}
        </div>
      </main>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "16px",
              textAlign: "center",
              minWidth: "300px"
            }}
          >
            <p style={{ marginBottom: "20px" }}>
              ¿De verdad quieres cerrar sesión?
            </p>
            <button
              onClick={handleLogout}
              style={{
                background: "#e74c3c",
                color: "white",
                border: "none",
                padding: "8px 16px",
                marginRight: "10px",
                borderRadius: "8px"
              }}
            >
              Sí
            </button>
            <button
              onClick={() => setShowLogoutModal(false)}
              style={{
                background: "#ccc",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
