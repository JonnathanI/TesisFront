import { useState } from "react";
import {
  createUnit,
  updateUnit,
  deleteUnit
} from "../../api/auth.service";

interface Props {
  courses: any[];
  units: any[];
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

  const handleCreate = async () => {
    if (!selectedCourseId) return alert("Selecciona un curso");

    await createUnit({
      courseId: selectedCourseId,
      title,
      unitOrder: order,
    });

    setTitle("");
    setOrder(1);
    onRefresh();
  };

  const handleUpdate = async () => {
    await updateUnit(editingUnit.id, {
      title,
      unitOrder: order,
    });

    setEditingUnit(null);
    setTitle("");
    setOrder(1);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar unidad?")) return;
    await deleteUnit(id);
    onRefresh();
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>
        📗 Gestión de Unidades
      </h2>

      {/* SELECTOR */}
      <select
        value={selectedCourseId ?? ""}
        onChange={(e) => onSelectCourse(e.target.value)}
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      >
        <option value="">-- Selecciona un curso --</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {selectedCourseId && (
        <>
          {/* FORM */}
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
                  onClick={() => setEditingUnit(null)}
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
          <div style={{ display: "grid", gap: "16px" }}>
            {units.map((u) => (
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
          </div>
        </>
      )}
    </div>
  );
};
