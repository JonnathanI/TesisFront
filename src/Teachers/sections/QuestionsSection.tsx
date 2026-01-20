import { useEffect, useState } from "react";
import {
  getAllUnits,
  getLessonsByUnit,
  getQuestionsByLesson,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionTypes,
  QuestionData,
  QuestionType,
} from "../../api/auth.service";

/* =========================
   TIPOS
========================= */

interface Unit {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
}

const confirmDelete = (msg: string) => window.confirm(msg);

/* =========================
   COMPONENTE
========================= */

export function QuestionsSection() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);

  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [textSource, setTextSource] = useState("");
  const [textTarget, setTextTarget] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [questionTypeId, setQuestionTypeId] = useState(""); // typeName

  /* =========================
     LOADERS
  ========================= */

  useEffect(() => {
    getAllUnits().then(setUnits);
    getQuestionTypes().then(setQuestionTypes);
  }, []);

  useEffect(() => {
    if (!selectedUnitId) return;
    getLessonsByUnit(selectedUnitId).then(setLessons);
  }, [selectedUnitId]);

  useEffect(() => {
    if (!selectedLessonId) return;
    loadQuestions();
  }, [selectedLessonId]);

  const loadQuestions = async () => {
    const data = await getQuestionsByLesson(selectedLessonId);
    setQuestions(data);
  };

  /* =========================
     HELPERS
  ========================= */

  const resetForm = () => {
    setEditingId(null);
    setTextSource("");
    setTextTarget("");
    setOptions(["", ""]);
    setQuestionTypeId("");
  };

  const usesOptions = [
    "IMAGE_SELECT",
    "LISTENING",
    "ORDERING",
    "MATCHING",
    "TRANSLATION_TO_TARGET",
    "TRANSLATION_TO_SOURCE",
    "SPEAKING",
    "WRITING",
  ].includes(questionTypeId);

  /* =========================
     CRUD
  ========================= */

  const handleSave = async () => {
    if (!selectedLessonId || !questionTypeId) {
      alert("Selecciona lección y tipo de pregunta");
      return;
    }

    if (usesOptions && options.filter(o => o.trim()).length < 2) {
      alert("Debes ingresar al menos 2 opciones");
      return;
    }

    const payload = {
      lessonId: selectedLessonId,
      questionTypeId, // STRING (typeName)
      textSource,
      textTarget,
      options: usesOptions ? options.filter(o => o.trim()) : [],
    };

    if (editingId) {
      await updateQuestion(editingId, payload);
    } else {
      await createQuestion(payload);
    }

    resetForm();
    loadQuestions();
  };

  const handleEdit = (q: QuestionData) => {
    setEditingId(q.id);
    setTextSource(q.textSource);
    setTextTarget(q.textTarget || "");
    setOptions(q.options?.length ? q.options : ["", ""]);
    setQuestionTypeId(q.questionType.typeName);
  };

  const handleDelete = async (id: string) => {
    if (!confirmDelete("¿Eliminar esta pregunta?")) return;
    await deleteQuestion(id);
    loadQuestions();
  };

  /* =========================
     UI
  ========================= */

  return (
    <div>
      <h2>❓ Gestión de Preguntas</h2>

      {/* SELECTORES */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <select
          value={selectedUnitId}
          onChange={e => {
            setSelectedUnitId(e.target.value);
            setSelectedLessonId("");
            setQuestions([]);
          }}
        >
          <option value="">Selecciona unidad</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>{u.title}</option>
          ))}
        </select>

        <select
          value={selectedLessonId}
          onChange={e => setSelectedLessonId(e.target.value)}
          disabled={!selectedUnitId}
        >
          <option value="">Selecciona lección</option>
          {lessons.map(l => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>

      {/* FORMULARIO */}
      {selectedLessonId && (
        <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 15 }}>
          <input
            placeholder="Texto origen"
            value={textSource}
            onChange={e => setTextSource(e.target.value)}
          />

          <input
            placeholder="Respuesta correcta"
            value={textTarget}
            onChange={e => setTextTarget(e.target.value)}
          />

          <select
            value={questionTypeId}
            onChange={e => setQuestionTypeId(e.target.value)}
          >
            <option value="">Tipo de pregunta</option>
            {questionTypes.map(t => (
              <option key={t.id} value={t.typeName}>
                {t.typeName}
              </option>
            ))}
          </select>

          {usesOptions && (
            <>
              <strong>Opciones</strong>
              {options.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={e => {
                    const copy = [...options];
                    copy[i] = e.target.value;
                    setOptions(copy);
                  }}
                  placeholder={`Opción ${i + 1}`}
                />
              ))}
              <button onClick={() => setOptions([...options, ""])}>➕ Opción</button>
            </>
          )}

          <div>
            <button onClick={handleSave}>
              {editingId ? "Actualizar" : "Crear"}
            </button>
            {editingId && <button onClick={resetForm}>Cancelar</button>}
          </div>
        </div>
      )}

      {/* LISTADO */}
      <ul>
        {questions.map(q => (
          <li key={q.id}>
            {q.textSource} ({q.questionType.typeName})
            <button onClick={() => handleEdit(q)}>✏️</button>
            <button onClick={() => handleDelete(q.id)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
