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

  // CORRECCIÓN: Buscamos el objeto del tipo de pregunta para validar el nombre
  const selectedType = questionTypes.find(t => t.id === questionTypeId);
  
  const usesOptions = [
    "IMAGE_SELECT",
    "LISTENING",
    "ORDERING",
    "MATCHING",
    "TRANSLATION_TO_TARGET",
    "TRANSLATION_TO_SOURCE",
  ].includes(selectedType?.typeName || "");

  const handleSave = async () => {
    if (!selectedLessonId || !questionTypeId) {
      alert("Selecciona lección y tipo de pregunta");
      return;
    }

    const payload = {
      lessonId: selectedLessonId,
      questionTypeId, // Ahora envía el UUID/ID correctamente
      textSource,
      textTarget,
      options: usesOptions ? options.filter(o => o.trim() !== "") : [],
    };

    try {
      editingId
        ? await updateQuestion(editingId, payload)
        : await createQuestion(payload);

      resetForm();
      loadQuestions();
    } catch (error: any) {
      console.error("Error al guardar la pregunta:", error);
      alert("Error al guardar: " + (error.response?.data?.message || "Verifica los datos enviados"));
    }
  };

  const handleEdit = (q: QuestionData) => {
    setEditingId(q.id);
    setTextSource(q.textSource);
    setTextTarget(q.textTarget || "");
    setOptions(q.options?.length ? q.options : ["", ""]);
    // CORRECCIÓN: Seteamos el ID del tipo de pregunta para que el select lo reconozca
    setQuestionTypeId(q.questionType.id); 
  };

  return (
    <div style={{ maxWidth: "1000px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>
        ❓ Gestión de Preguntas
      </h2>

      {/* SELECTORES DE JERARQUÍA */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select
          value={selectedUnitId}
          onChange={e => {
            setSelectedUnitId(e.target.value);
            setSelectedLessonId("");
            setQuestions([]);
          }}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        >
          <option value="">Seleccionar Unidad</option>
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
          <option value="">Seleccionar Lección</option>
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
            placeholder="Texto origen (ej: Hello)"
            value={textSource}
            onChange={e => setTextSource(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 10, border: "1px solid #eee" }}
          />

          <input
            placeholder="Respuesta correcta (ej: Hola)"
            value={textTarget}
            onChange={e => setTextTarget(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 10, border: "1px solid #eee" }}
          />

          <select
            value={questionTypeId}
            onChange={e => setQuestionTypeId(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 12, border: "1px solid #eee" }}
          >
            <option value="">Seleccionar Tipo de pregunta</option>
            {questionTypes.map(t => (
              // CORRECCIÓN: El value es t.id para que el backend lo procese
              <option key={t.id} value={t.id}>{t.typeName}</option>
            ))}
          </select>

          {usesOptions && (
            <div style={{ marginBottom: 15 }}>
              <strong style={{ display: "block", marginBottom: 8 }}>Opciones de respuesta</strong>
              {options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input
                    value={opt}
                    onChange={e => {
                      const copy = [...options];
                      copy[i] = e.target.value;
                      setOptions(copy);
                    }}
                    placeholder={`Opción ${i + 1}`}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #eee" }}
                  />
                  {options.length > 2 && (
                    <button 
                      onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                      style={{ background: "#ff4d4f", color: "white", border: "none", borderRadius: 8, padding: "0 10px" }}
                    >✕</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setOptions([...options, ""])}
                style={{ 
                  marginTop: 5, padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                  border: "1px dashed #1cb0f6", color: "#1cb0f6", background: "none"
                }}
              >
                ➕ Añadir Opción
              </button>
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              onClick={handleSave}
              style={{
                background: "#1cb0f6", color: "#fff", padding: "12px 24px",
                borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer"
              }}
            >
              {editingId ? "Guardar Cambios" : "Crear Pregunta"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                style={{ background: "#eee", padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer" }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* LISTADO DE PREGUNTAS EXISTENTES */}
      <div style={{ display: "grid", gap: 12 }}>
        {questions.length === 0 && selectedLessonId && (
          <p style={{ textAlign: "center", color: "#999", padding: "20px" }}>No hay preguntas en esta lección.</p>
        )}
        {questions.map(q => (
          <div
            key={q.id}
            style={{
              background: "#fff", padding: 16, borderRadius: 14,
              boxShadow: "0 4px 14px rgba(0,0,0,.06)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid #f0f0f0"
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{q.textSource}</div>
              <div style={{ fontSize: "12px", color: "#1cb0f6" }}>{q.questionType.typeName}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={() => handleEdit(q)}
                style={{ background: "#e3f2fd", border: "none", padding: "8px", borderRadius: 8, cursor: "pointer" }}
              >✏️</button>
              <button 
                onClick={() => {
                  if(window.confirm("¿Eliminar esta pregunta?")) {
                    deleteQuestion(q.id).then(loadQuestions);
                  }
                }}
                style={{ background: "#fff1f0", border: "none", padding: "8px", borderRadius: 8, cursor: "pointer" }}
              >🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}