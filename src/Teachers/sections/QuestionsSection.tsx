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

interface Unit {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
}

const confirmDelete = (msg: string) => window.confirm(msg);

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
  const [questionTypeId, setQuestionTypeId] = useState("");

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
  ].includes(questionTypeId);

  const handleSave = async () => {
    if (!selectedLessonId || !questionTypeId) {
      alert("Selecciona lección y tipo de pregunta");
      return;
    }

    const payload = {
      lessonId: selectedLessonId,
      questionTypeId,
      textSource,
      textTarget,
      options: usesOptions ? options.filter(o => o.trim()) : [],
    };

    editingId
      ? await updateQuestion(editingId, payload)
      : await createQuestion(payload);

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

  return (
    <div style={{ maxWidth: "1000px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>
        ❓ Gestión de Preguntas
      </h2>

      {/* SELECTORES */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select
          value={selectedUnitId}
          onChange={e => {
            setSelectedUnitId(e.target.value);
            setSelectedLessonId("");
          }}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        >
          <option value="">Unidad</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>{u.title}</option>
          ))}
        </select>

        <select
          value={selectedLessonId}
          onChange={e => setSelectedLessonId(e.target.value)}
          disabled={!selectedUnitId}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        >
          <option value="">Lección</option>
          {lessons.map(l => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>

      {selectedLessonId && (
        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 16,
            boxShadow: "0 8px 20px rgba(0,0,0,.08)",
            marginBottom: 30,
          }}
        >
          <h3 style={{ marginBottom: 12 }}>
            {editingId ? "✏️ Editar pregunta" : "➕ Nueva pregunta"}
          </h3>

          <input
            placeholder="Texto origen"
            value={textSource}
            onChange={e => setTextSource(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 10 }}
          />

          <input
            placeholder="Respuesta correcta"
            value={textTarget}
            onChange={e => setTextTarget(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 10 }}
          />

          <select
            value={questionTypeId}
            onChange={e => setQuestionTypeId(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 12 }}
          >
            <option value="">Tipo de pregunta</option>
            {questionTypes.map(t => (
              <option key={t.id} value={t.typeName}>{t.typeName}</option>
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
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              ))}
              <button
                onClick={() => setOptions([...options, ""])}
                style={{ marginTop: 10 }}
              >
                ➕ Opción
              </button>
            </>
          )}

          <div style={{ marginTop: 16 }}>
            <button
              onClick={handleSave}
              style={{
                background: "#1cb0f6",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                fontWeight: 700,
              }}
            >
              {editingId ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      )}

      {/* LISTADO */}
      <div style={{ display: "grid", gap: 12 }}>
        {questions.map(q => (
          <div
            key={q.id}
            style={{
              background: "#fff",
              padding: 14,
              borderRadius: 14,
              boxShadow: "0 4px 14px rgba(0,0,0,.06)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{q.textSource} ({q.questionType.typeName})</span>
            <div>
              <button onClick={() => handleEdit(q)}>✏️</button>
              <button onClick={() => deleteQuestion(q.id).then(loadQuestions)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
