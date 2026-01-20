import { useState } from "react";
import {
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../api/auth.service";

interface Props {
  units: any[];
  lessons: any[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
  onRefresh: () => void;
}

export const LessonsSection = ({
  units,
  lessons,
  selectedUnitId,
  onSelectUnit,
  onRefresh,
}: Props) => {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [xp, setXp] = useState(10);
  const [editing, setEditing] = useState<any | null>(null);

  const submit = async () => {
    if (!selectedUnitId) return alert("Selecciona una unidad");

    if (editing) {
      await updateLesson(editing.id, {
        title,
        lessonOrder: order,
        requiredXp: xp,
      });
    } else {
      await createLesson({
        unitId: selectedUnitId,
        title,
        lessonOrder: order,
        requiredXp: xp,
      });
    }

    setTitle("");
    setOrder(1);
    setXp(10);
    setEditing(null);
    onRefresh();
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>
        📖 Gestión de Lecciones
      </h2>

      <select
        value={selectedUnitId ?? ""}
        onChange={(e) => onSelectUnit(e.target.value)}
        style={{
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      >
        <option value="">-- Selecciona una unidad --</option>
        {units.map((u) => (
          <option key={u.id} value={u.id}>
            {u.title}
          </option>
        ))}
      </select>

      {selectedUnitId && (
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
              {editing ? "✏️ Editar lección" : "➕ Nueva lección"}
            </h3>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                placeholder="Título"
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
                value={order}
                onChange={(e) => setOrder(+e.target.value)}
                style={{
                  width: "120px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />

              <input
                type="number"
                value={xp}
                onChange={(e) => setXp(+e.target.value)}
                style={{
                  width: "140px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />

              <button
                onClick={submit}
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
                {editing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>

          {/* LISTA */}
          <div style={{ display: "grid", gap: "16px" }}>
            {lessons.map((l) => (
              <div
                key={l.id}
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
                  <strong>{l.title}</strong>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    Orden {l.lessonOrder} · XP {l.requiredXp}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setEditing(l);
                      setTitle(l.title);
                      setOrder(l.lessonOrder);
                      setXp(l.requiredXp);
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
                    onClick={() => deleteLesson(l.id).then(onRefresh)}
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
