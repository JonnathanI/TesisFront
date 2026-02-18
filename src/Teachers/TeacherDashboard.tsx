// src/Teachers/TeacherDashboard.tsx
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { removeToken, getCourses, getCourseUnits, getLessonsByUnit } from "../api/auth.service";
import { useNavigate } from "react-router-dom";

// --- SECCIONES ---
import { UnitsSection } from "./sections/UnitsSection";
import { LessonsSection } from "./sections/LessonsSection";
import { GroupsSection } from "./sections/GroupsSection";
import { GenerateCodeSection } from "./sections/GenerateCodeSection";
import { QuestionsSection } from "./sections/QuestionsSection";
import { EvaluationsSection } from "./sections/EvaluationsSection";
import { StudentsSection } from "./sections/StudentsSection";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("units");

  // --- DATOS ---
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  // --- SELECCIÓN ---
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // ✅ RESPONSIVE
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Cierra sidebar si pasas a desktop
  useEffect(() => {
    if (!isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  // ==========================================
  // CARGA DE DATOS
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
      setLessons([]);
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

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // ==========================================
  // UI
  // ==========================================
  const sidebarWidth = 260;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7f8",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* ✅ Botón hamburguesa (móvil/tablet) */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            position: "fixed",
            left: 12,
            top: 12,
            zIndex: 1300,
            background: "white",
            borderRadius: 999,
            border: "2px solid #E5E5E5",
            padding: "8px 12px",
            fontWeight: 900,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      )}

      {/* ✅ Sidebar Desktop (normal) */}
      {!isMobile && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            width: sidebarWidth,
            zIndex: 20,
          }}
        >
          <Sidebar
            sidebarNavItems={[
              { id: "units", label: "Unidades", icon: "📚" },
              { id: "lessons", label: "Lecciones", icon: "📖" },
              { id: "questions", label: "Preguntas", icon: "❓" },
              { id: "students", label: "Estudiantes", icon: "🎓" },
              { id: "groups", label: "Grupos", icon: "👥" },
              { id: "code", label: "Código", icon: "🔐" },
              { id: "evaluations", label: "Evaluaciones", icon: "📝" },
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
        </div>
      )}

      {/* ✅ Sidebar Mobile/Tablet (overlay) */}
      {isMobile && isSidebarOpen && (
        <>
          {/* backdrop */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 1200,
            }}
          />

          {/* panel */}
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              width: sidebarWidth,
              zIndex: 1250,
              background: "white",
              boxShadow: "10px 0 30px rgba(0,0,0,0.15)",
            }}
          >
            {/* botón cerrar dentro */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                zIndex: 1260,
                border: "none",
                background: "transparent",
                fontSize: 18,
                fontWeight: 900,
                cursor: "pointer",
                color: "#6b7280",
              }}
              aria-label="Cerrar menú"
            >
              ✕
            </button>

            <Sidebar
              sidebarNavItems={[
                { id: "units", label: "Unidades", icon: "📚" },
                { id: "lessons", label: "Lecciones", icon: "📖" },
                { id: "questions", label: "Preguntas", icon: "❓" },
                { id: "students", label: "Estudiantes", icon: "🎓" },
                { id: "groups", label: "Grupos", icon: "👥" },
                { id: "code", label: "Código", icon: "🔐" },
                { id: "evaluations", label: "Evaluaciones", icon: "📝" },
              ]}
              activeTab={activeTab}
              setActiveTab={(tab: string) => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              setSubTab={() => {}}
              resetForm={() => {}}
              currentTheme={{ border: "#e5e5e5", sidebarBg: "#ffffff" }}
              theme="light"
              handleMoreMenuClick={() => {}}
              showMoreMenu={false}
              setShowMoreMenu={() => {}}
            />
          </div>
        </>
      )}

      {/* ✅ MAIN */}
      <main
        style={{
          // en desktop deja espacio para sidebar fijo
          marginLeft: isMobile ? 0 : sidebarWidth,
          // en móvil dejamos espacio SOLO para el botón hamburguesa (no más)
          paddingTop: isMobile ? 56 : 24,
          paddingLeft: isMobile ? 12 : 32,
          paddingRight: isMobile ? 12 : 32,
          paddingBottom: 16,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1200 }}>
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 12 : 0,
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "center",
              marginBottom: 18,
            }}
          >
            <h2 style={{ margin: 0, color: "#3c3c3c", fontWeight: 800 }}>
              Panel de Control del Profesor
            </h2>

            <button
              onClick={() => setShowLogoutModal(true)}
              style={{
                background: "#ff4b4b",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 0 #d33131",
                width: isMobile ? "100%" : "auto",
              }}
            >
              Cerrar sesión
            </button>
          </div>

          {/* CONTENEDOR */}
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: isMobile ? 14 : 25,
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              minHeight: isMobile ? "auto" : "calc(100vh - 170px)",
            }}
          >
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

            {activeTab === "students" && <StudentsSection />}
            {activeTab === "questions" && <QuestionsSection />}
            {activeTab === "groups" && <GroupsSection />}
            {activeTab === "code" && <GenerateCodeSection />}
            {activeTab === "evaluations" && <EvaluationsSection />}
          </div>
        </div>
      </main>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 12,
          }}
        >
          <div
            style={{
              background: "white",
              padding: isMobile ? 18 : 30,
              borderRadius: 20,
              textAlign: "center",
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>¿Cerrar sesión?</h3>
            <p style={{ color: "#777", marginBottom: 18 }}>
              Tendrás que volver a ingresar tus credenciales para acceder.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  background: "#ff4b4b",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 12,
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "100%",
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
                  borderRadius: 12,
                  fontWeight: "bold",
                  cursor: "pointer",
                  width: "100%",
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
