import { useState, useEffect } from "react";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllUsersAdmin,
  assignCourseToTeacher,
  assignCourseToStudent,
  getTeacherCourses,        // ✅ cursos del profe
  createCourseAsTeacher,    // ✅ NUEVO: crear curso como profe
} from "../../api/auth.service";
import { StudentData, UserRole } from "../../api/auth.types";

interface Props {
  courses: any[];
  onSelectCourse: (id: string) => void;
  onRefresh: () => void;
}

export const CoursesSection = ({
  courses,
  onSelectCourse,
  onRefresh,
}: Props) => {
  const [form, setForm] = useState({
    title: "",
    baseLanguage: "ES",
    targetLanguage: "EN",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // 🔹 usuarios para asignar (profes / estudiantes)
  const [users, setUsers] = useState<StudentData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // selección por curso (diccionario courseId -> userId)
  const [selectedTeacher, setSelectedTeacher] = useState<Record<string, string>>(
    {}
  );
  const [selectedStudent, setSelectedStudent] = useState<Record<string, string>>(
    {}
  );

  // 🔹 rol del usuario actual (guardado en localStorage como "user-role")
  const role = (localStorage.getItem("user-role") as UserRole | null) ?? null;

  // 🔹 cursos propios del profesor (cuando el rol es TEACHER)
  const [ownCourses, setOwnCourses] = useState<any[]>([]);

  // helper para recargar cursos del profe
  const loadTeacherCourses = async () => {
    if (role !== "TEACHER") return;
    try {
      const data = await getTeacherCourses();
      setOwnCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando cursos del profesor", e);
    }
  };

  // Cargar usuarios (solo para admin / gestión asignación)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await getAllUsersAdmin();
        setUsers(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("Error cargando usuarios para cursos", e);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Cargar cursos propios si es profe
  useEffect(() => {
    if (role === "TEACHER") {
      loadTeacherCourses();
    }
  }, [role]);

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Título requerido");

    try {
      if (editingId) {
        // Editar curso existente
        await updateCourse(editingId, form);
      } else {
        // Crear curso nuevo
        if (role === "TEACHER") {
          // 👉 El profesor crea curso por su propio endpoint
          await createCourseAsTeacher(form);
        } else {
          // 👉 Admin u otros usan el endpoint global
          await createCourse(form);
        }
      }

      setForm({ title: "", baseLanguage: "ES", targetLanguage: "EN" });
      setEditingId(null);

      // 👇 Si es profe, recarga sus cursos; si no, usa onRefresh (admin)
      if (role === "TEACHER") {
        await loadTeacherCourses();
      } else {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      alert("Error al guardar curso");
    }
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      baseLanguage: course.baseLanguage || "ES",
      targetLanguage: course.targetLanguage || "EN",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar curso?")) return;
    await deleteCourse(id);

    if (role === "TEACHER") {
      await loadTeacherCourses();
    } else {
      onRefresh();
    }
  };

  // listas separadas
  const teachers = users.filter(
    (u) =>
      (u.role as UserRole | undefined) === "TEACHER" ||
      (u.role as UserRole | undefined) === "ADMIN"
  );
  const students = users.filter(
    (u) => (u.role as UserRole | undefined) === "STUDENT" || !u.role
  );

  const handleAssignTeacher = async (courseId: string) => {
    const teacherId = selectedTeacher[courseId];
    if (!teacherId) {
      alert("Selecciona un profesor para asignar");
      return;
    }
    try {
      await assignCourseToTeacher(courseId, teacherId);
      alert("Profesor asignado al curso 🎓");
      if (role === "TEACHER") {
        await loadTeacherCourses();
      } else {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      alert("Error asignando profesor");
    }
  };

  const handleAssignStudent = async (courseId: string) => {
    const studentId = selectedStudent[courseId];
    if (!studentId) {
      alert("Selecciona un estudiante para asignar");
      return;
    }
    try {
      await assignCourseToStudent(courseId, studentId);
      alert("Estudiante asignado al curso 📚");
      if (role === "TEACHER") {
        await loadTeacherCourses();
      } else {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      alert("Error asignando estudiante");
    }
  };

  // 🔹 Lista que realmente vamos a mostrar
  const displayCourses = role === "TEACHER" ? ownCourses : courses;

  return (
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>
        📘 Gestión de Cursos
      </h2>

      {/* FORMULARIO */}
      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>
          {editingId ? "✏️ Editar curso" : "➕ Nuevo curso"}
        </h3>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            placeholder="Nombre del curso"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "15px",
            }}
          />

          <button
            onClick={handleSubmit}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#1cb0f6",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {editingId ? "Actualizar" : "Crear"}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm({
                  title: "",
                  baseLanguage: "ES",
                  targetLanguage: "EN",
                });
              }}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "none",
                background: "#e0e0e0",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* LISTA */}
      {displayCourses.length === 0 && (
        <p style={{ color: "#777" }}>No hay cursos registrados</p>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {displayCourses.map((course) => (
          <div
            key={course.id}
            style={{
              background: "#fff",
              padding: "18px",
              borderRadius: "16px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Cabecera curso */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: "16px" }}>{course.title}</strong>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  Idioma base: {course.baseLanguage} → {course.targetLanguage}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => onSelectCourse(course.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#e8f5fe",
                    color: "#1cb0f6",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Unidades
                </button>

                <button
                  onClick={() => handleEdit(course)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#fff3cd",
                    color: "#856404",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(course.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#fdecea",
                    color: "#d93025",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>

            {/* Asignación profesor / estudiante */}
            <div
              style={{
                borderTop: "1px solid #eee",
                paddingTop: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
                gap: "10px",
              }}
            >
              {/* PROFESOR */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#999" }}>
                  Profesor asignado
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <select
                    disabled={loadingUsers}
                    value={selectedTeacher[course.id] || ""}
                    onChange={(e) =>
                      setSelectedTeacher((prev) => ({
                        ...prev,
                        [course.id]: e.target.value,
                      }))
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  >
                    <option value="">
                      {loadingUsers ? "Cargando..." : "Seleccionar profesor"}
                    </option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignTeacher(course.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: "#1cb0f6",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✔
                  </button>
                </div>
              </div>

              {/* ESTUDIANTE */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#999" }}>
                  Añadir estudiante
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <select
                    disabled={loadingUsers}
                    value={selectedStudent[course.id] || ""}
                    onChange={(e) =>
                      setSelectedStudent((prev) => ({
                        ...prev,
                        [course.id]: e.target.value,
                      }))
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  >
                    <option value="">
                      {loadingUsers ? "Cargando..." : "Seleccionar alumno"}
                    </option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignStudent(course.id)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: "#58cc02",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ➕
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
