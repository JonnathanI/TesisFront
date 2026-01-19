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
    <div>
      <h2>📗 Unidades</h2>

      {/* Selector de curso */}
      <select
        value={selectedCourseId ?? ""}
        onChange={(e) => onSelectCourse(e.target.value)}
      >
        <option value="">-- Selecciona un curso --</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* Formulario */}
      {selectedCourseId && (
        <>
          <div style={{ marginTop: "1rem" }}>
            <input
              placeholder="Nombre de la unidad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />

            {editingUnit ? (
              <button onClick={handleUpdate}>Actualizar</button>
            ) : (
              <button onClick={handleCreate}>Crear</button>
            )}

            {editingUnit && (
              <button onClick={() => setEditingUnit(null)}>Cancelar</button>
            )}
          </div>

          {/* Lista */}
          <ul style={{ marginTop: "1rem" }}>
            {units.map((u) => (
              <li key={u.id}>
                {u.title} (Orden {u.unitOrder})

                <button
                  onClick={() => {
                    setEditingUnit(u);
                    setTitle(u.title);
                    setOrder(u.unitOrder);
                  }}
                >
                  ✏️
                </button>

                <button onClick={() => handleDelete(u.id)}>🗑</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
