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

  const [showLogoutModal, setShowLogoutModal] = useState(false); // 🔹 Control del modal

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
    <div style={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
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
        currentTheme={{ border: "#ddd", sidebarBg: "#f9f9f9" }}
        theme="light"
        handleMoreMenuClick={() => {}}
        showMoreMenu={false}
        setShowMoreMenu={() => {}}
      />

      {/* CONTENIDO */}
      <main style={{ flex: 1, padding: "20px", overflowY: "auto", position: "relative" }}>
        <button
          onClick={() => setShowLogoutModal(true)} // 🔹 Abrir modal en vez de cerrar directo
          style={{
            position: "absolute",
            top: 10,
            right: 20,
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>

        {/* MODAL DE CONFIRMACIÓN */}
        {showLogoutModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "10px",
                textAlign: "center",
                minWidth: "300px",
              }}
            >
              <p style={{ marginBottom: "20px" }}>¿De verdad quieres cerrar sesión?</p>
              <button
                onClick={handleLogout}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  marginRight: "10px",
                  cursor: "pointer",
                  borderRadius: "5px"
                }}
              >
                Sí, cerrar sesión
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  background: "#ccc",
                  color: "#333",
                  border: "none",
                  padding: "8px 16px",
                  cursor: "pointer",
                  borderRadius: "5px"
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Pestañas */}
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
      </main>
    </div>
  );
}
