import { useState } from "react";
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/auth.service";

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

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Título requerido");

    if (editingId) {
      await updateCourse(editingId, form);
    } else {
      await createCourse(form);
    }

    setForm({ title: "", baseLanguage: "ES", targetLanguage: "EN" });
    setEditingId(null);
    onRefresh();
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
    onRefresh();
  };

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
      {courses.length === 0 && (
        <p style={{ color: "#777" }}>No hay cursos registrados</p>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              background: "#fff",
              padding: "18px",
              borderRadius: "16px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
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
        ))}
      </div>
    </div>
  );
};
