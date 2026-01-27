import { useEffect, useState } from "react";
import {
  getAllUnits,
  getLessonsByUnit,
  getQuestionsByLesson,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionTypes,
} from "../../api/auth.service";

// Definición de interfaces para evitar errores de tipado
interface QuestionType {
  id: string;
  typeName: string;
}

interface QuestionData {
  id: string;
  textSource: string;
  textTarget: string;
  options: string[];
  questionType: QuestionType;
  isActive?: boolean;
}

interface Unit { id: string; title: string; }
interface Lesson { id: string; title: string; }

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
    getAllUnits().then(setUnits).catch(console.error);
    getQuestionTypes().then(setQuestionTypes).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedUnitId) { setLessons([]); return; }
    getLessonsByUnit(selectedUnitId).then(setLessons);
  }, [selectedUnitId]);

  useEffect(() => {
    if (!selectedLessonId) { setQuestions([]); return; }
    loadQuestions();
  }, [selectedLessonId]);

  const loadQuestions = async () => {
    try {
      const data = await getQuestionsByLesson(selectedLessonId);
      // CORRECCIÓN DE ERROR: Aserción de tipo para que TS acepte los datos
      setQuestions(data as QuestionData[]);
    } catch (error) {
      console.error("Error cargando preguntas", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTextSource("");
    setTextTarget("");
    setOptions(["", ""]);
    setQuestionTypeId("");
  };

  // Función para activar/desactivar individualmente
  const toggleQuestionStatus = async (q: QuestionData) => {
    try {
      const newStatus = !q.isActive;
      await updateQuestion(q.id, {
        ...q,
        lessonId: selectedLessonId,
        questionTypeId: q.questionType.id,
        isActive: newStatus
      });
      loadQuestions(); // Recargar lista para ver el cambio
    } catch (error) {
      alert("No se pudo cambiar el estado de la pregunta");
    }
  };

  const handleSave = async () => {
    if (!selectedLessonId || !questionTypeId) return alert("Faltan datos");

    const payload = {
      lessonId: selectedLessonId,
      questionTypeId,
      textSource,
      textTarget,
      options: options.filter(o => o.trim() !== ""),
      isActive: true, // Por defecto al crear
    };

    try {
      editingId ? await updateQuestion(editingId, payload) : await createQuestion(payload);
      resetForm();
      loadQuestions();
    } catch (error) {
      alert("Error al guardar");
    }
  };

  const handleEdit = (q: QuestionData) => {
    setEditingId(q.id);
    setTextSource(q.textSource);
    setTextTarget(q.textTarget || "");
    setOptions(q.options?.length ? q.options : ["", ""]);
    setQuestionTypeId(q.questionType.id);
  };

  return (
    <div style={{ maxWidth: "1000px", padding: "20px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>❓ Gestión de Preguntas</h2>

      {/* SELECTORES DE UNIDAD Y LECCIÓN */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select value={selectedUnitId} onChange={e => { setSelectedUnitId(e.target.value); setSelectedLessonId(""); }} style={{ padding: 12, borderRadius: 10, flex: 1, border: "1px solid #ccc" }}>
          <option value="">Seleccionar Unidad</option>
          {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
        </select>

        <select value={selectedLessonId} onChange={e => setSelectedLessonId(e.target.value)} disabled={!selectedUnitId} style={{ padding: 12, borderRadius: 10, flex: 1, border: "1px solid #ccc" }}>
          <option value="">Seleccionar Lección</option>
          {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
      </div>

      {/* FORMULARIO DE CREACIÓN/EDICIÓN */}
      {selectedLessonId && (
        <div style={{ background: "#fff", padding: 25, borderRadius: 16, boxShadow: "0 8px 20px rgba(0,0,0,.08)", marginBottom: 30 }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "✏️ Editar Pregunta" : "➕ Nueva Pregunta"}</h3>
          <input placeholder="Texto origen" value={textSource} onChange={e => setTextSource(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 10, border: "1px solid #eee" }} />
          <input placeholder="Respuesta correcta" value={textTarget} onChange={e => setTextTarget(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 10, border: "1px solid #eee" }} />
          <select value={questionTypeId} onChange={e => setQuestionTypeId(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 15, border: "1px solid #eee" }}>
            <option value="">Tipo de pregunta</option>
            {questionTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} style={{ background: "#1cb0f6", color: "#fff", padding: "12px", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer", flex: 2 }}>
                {editingId ? "Guardar Cambios" : "Crear Pregunta"}
            </button>
            {editingId && <button onClick={resetForm} style={{ background: "#eee", padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", flex: 1 }}>Cancelar</button>}
          </div>
        </div>
      )}

      {/* LISTADO DE PREGUNTAS CON TOGGLE INDIVIDUAL */}
      <div style={{ display: "grid", gap: 12 }}>
        {questions.map(q => (
          <div key={q.id} style={{ 
            background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #f0f0f0", 
            display: "flex", justifyContent: "space-between", alignItems: "center",
            opacity: q.isActive === false ? 0.6 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: q.isActive === false ? "#999" : "#333" }}>{q.textSource}</div>
              <div style={{ fontSize: "12px", color: "#1cb0f6" }}>{q.questionType.typeName}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              {/* TOGGLE INDIVIDUAL */}
              <div 
                onClick={() => toggleQuestionStatus(q)}
                style={{
                  width: 40, height: 20, background: q.isActive ? '#1cb0f6' : '#ccc',
                  borderRadius: 20, position: 'relative', cursor: 'pointer', transition: '0.3s'
                }}
                title={q.isActive ? "Desactivar pregunta" : "Activar pregunta"}
              >
                <div style={{
                  width: 16, height: 16, background: '#fff', borderRadius: '50%',
                  position: 'absolute', top: 2, left: q.isActive ? 22 : 2, transition: '0.2s'
                }} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleEdit(q)} style={{ background: "#e3f2fd", border: "none", padding: 8, borderRadius: 8, cursor: 'pointer' }}>✏️</button>
                <button onClick={() => window.confirm("¿Eliminar?") && deleteQuestion(q.id).then(loadQuestions)} style={{ background: "#fff1f0", border: "none", padding: 8, borderRadius: 8, cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}