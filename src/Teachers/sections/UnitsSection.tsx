import { useState, useEffect } from "react";
import {
  createUnit,
  updateUnit,
  deleteUnit,
  getTeacherCourses,
} from "../../api/auth.service";
import { UserRole } from "../../api/auth.types";

interface Props {
  courses: any[];                // cursos que recibe (para admin)
  units: any[];                  // TODAS las unidades del profe (desde el padre)
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string) => void;
  onRefresh: () => void;
}

export const UnitsSection = ({
  courses,
  units,
  selectedCourseId,
  onSelectCourse,
  onRefresh,
}: Props) => {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);

  const role = (localStorage.getItem("user-role") as UserRole | null) ?? null;

  const [ownCourses, setOwnCourses] = useState<any[]>([]);

  // ⭐ NUEVO: estado local con las unidades que realmente pintamos
  const [localUnits, setLocalUnits] = useState<any[]>([]);

  // ⭐ Cada vez que el padre cambie `units`, sincronizamos localUnits
  useEffect(() => {
    setLocalUnits(units || []);
  }, [units]);

  const loadTeacherCourses = async () => {
    if (role !== "TEACHER") return;
    try {
      const data = await getTeacherCourses();
      setOwnCourses(Array.isArray(data) ? data : []);
      console.log("📗 Cursos del profe:", data);
    } catch (e) {
      console.error("Error cargando cursos del profesor en UnitsSection", e);
    }
  };

  useEffect(() => {
    if (role === "TEACHER") {
      loadTeacherCourses();
    }
  }, [role]);

  const handleCreate = async () => {
    if (!selectedCourseId) return alert("Selecciona un curso");

    const created = await createUnit({
      courseId: selectedCourseId,
      title,
      unitOrder: order,
    });

    // ⭐ Actualizamos inmediatamente la lista en el front
    setLocalUnits((prev) => [...prev, created]);

    setTitle("");
    setOrder(1);

    // opcional: recargar desde backend
    onRefresh();
  };

  const handleUpdate = async () => {
    if (!editingUnit) return;

    const updated = await updateUnit(editingUnit.id, {
      title,
      unitOrder: order,
    });

    // ⭐ Reemplazamos en el array local la unidad editada
    setLocalUnits((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    );

    setEditingUnit(null);
    setTitle("");
    setOrder(1);

    // opcional: recargar desde backend
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar unidad?")) return;
    await deleteUnit(id);

    // ⭐ Quitamos del estado local
    setLocalUnits((prev) => prev.filter((u) => u.id !== id));

    onRefresh();
  };

  // Cursos que mostramos en el select
  const coursesToShow = role === "TEACHER" ? ownCourses : courses;

  // ⭐ Usamos localUnits en lugar de `units`
  const filteredUnits = selectedCourseId
    ? localUnits.filter((u) => {
        // Caso 1: unidad trae course anidado
        if (u.course && u.course.id) {
          return u.course.id === selectedCourseId;
        }
        // Caso 2: unidad trae courseId directo
        if (u.courseId) {
          return u.courseId === selectedCourseId;
        }
        // Caso 3: sin course ni courseId -> si solo hay un curso, mostramos todas
        return (
          coursesToShow.length === 1 &&
          coursesToShow[0].id === selectedCourseId
        );
      })
    : [];

  return (
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>
        📗 Gestión de Unidades
      </h2>

      {/* SELECTOR DE CURSO */}
      <select
        value={selectedCourseId ?? ""}
        onChange={(e) => {
          setEditingUnit(null);
          setTitle("");
          setOrder(1);
          onSelectCourse(e.target.value);
        }}
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      >
        <option value="">-- Selecciona un curso --</option>
        {coursesToShow.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {selectedCourseId && (
        <>
          {/* FORMULARIO */}
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>
              {editingUnit ? "✏️ Editar unidad" : "➕ Nueva unidad"}
            </h3>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                placeholder="Nombre de la unidad"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />

              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                style={{
                  width: "120px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />

              <button
                onClick={editingUnit ? handleUpdate : handleCreate}
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
                {editingUnit ? "Actualizar" : "Crear"}
              </button>

              {editingUnit && (
                <button
                  onClick={() => {
                    setEditingUnit(null);
                    setTitle("");
                    setOrder(1);
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

          {/* LISTA DE UNIDADES */}
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredUnits.map((u) => (
              <div
                key={u.id}
                style={{
                  background: "#fff",
                  padding: "16px",
                  borderRadius: "14px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{u.title}</strong>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    Orden: {u.unitOrder}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setEditingUnit(u);
                      setTitle(u.title);
                      setOrder(u.unitOrder);
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#fff3cd",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(u.id)}
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

            {filteredUnits.length === 0 && (
              <p style={{ color: "#777" }}>
                Este curso todavía no tiene unidades.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
