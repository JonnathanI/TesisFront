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
    <div>
      <h2>📖 Lecciones</h2>

      {/* SOLO UNIDADES */}
      <select
        value={selectedUnitId ?? ""}
        onChange={(e) => onSelectUnit(e.target.value)}
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
          <input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(+e.target.value)}
          />
          <input
            type="number"
            value={xp}
            onChange={(e) => setXp(+e.target.value)}
          />
          <button onClick={submit}>
            {editing ? "Actualizar" : "Crear"}
          </button>
        </>
      )}

      <ul>
        {lessons.map((l) => (
          <li key={l.id}>
            {l.title}
            <button
              onClick={() => {
                setEditing(l);
                setTitle(l.title);
                setOrder(l.lessonOrder);
                setXp(l.requiredXp);
              }}
            >
              ✏️
            </button>
            <button onClick={() => deleteLesson(l.id).then(onRefresh)}>
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
