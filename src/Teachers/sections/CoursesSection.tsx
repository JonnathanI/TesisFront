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
    <div>
      <h2>📘 Cursos</h2>

      {/* FORMULARIO */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          placeholder="Nombre del curso"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <button onClick={handleSubmit} style={{ marginLeft: "1rem" }}>
          {editingId ? "Actualizar" : "Crear"}
        </button>

        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", baseLanguage: "ES", targetLanguage: "EN" });
            }}
            style={{ marginLeft: "0.5rem" }}
          >
            Cancelar
          </button>
        )}
      </div>

      {/* LISTA */}
      {courses.length === 0 && <p>No hay cursos</p>}

      {courses.map((course) => (
        <div
          key={course.id}
          style={{
            border: "1px solid #ddd",
            padding: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <strong>{course.title}</strong>

          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={() => onSelectCourse(course.id)}>
              Ver unidades
            </button>

            <button
              onClick={() => handleEdit(course)}
              style={{ marginLeft: "0.5rem" }}
            >
              Editar
            </button>

            <button
              onClick={() => handleDelete(course.id)}
              style={{ marginLeft: "0.5rem", color: "red" }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
