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
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";

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
  const [isActive, setIsActive] = useState(true);

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
    setIsActive(true);
  };

  const selectedType = questionTypes.find(t => t.id === questionTypeId);
  const usesOptions = [
    "IMAGE_SELECT", "LISTENING", "ORDERING", "MATCHING",
    "TRANSLATION_TO_TARGET", "TRANSLATION_TO_SOURCE",
  ].includes(selectedType?.typeName || "");

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
      options: usesOptions ? options.filter(o => o.trim() !== "") : [],
      active: isActive,
    };

    try {
      if (editingId) {
        await updateQuestion(editingId, payload);
      } else {
        await createQuestion(payload);
      }
      resetForm();
      loadQuestions();
    } catch (error: any) {
      alert("Error al guardar la pregunta");
    }
  };

  // --- LÓGICA DE TOGGLE REVISADA ---
  const toggleQuestionStatus = async (q: QuestionData) => {
    // 1. Calculamos el nuevo estado
    const newActiveStatus = !q.active;
    
    // 2. Log para depuración (mira la consola del navegador F12)
    console.log("Cambiando estado de la pregunta:", q.id, "a:", newActiveStatus);

    try {
      // 3. Enviamos el objeto con la estructura exacta que espera Prisma/Backend
      const response = await updateQuestion(q.id, {
        textSource: q.textSource,
        textTarget: q.textTarget,
        questionTypeId: q.questionType.id, // ID del tipo de pregunta
        lessonId: selectedLessonId,        // ID de la lección actual
        active: newActiveStatus,           // El cambio real
        options: q.options || []
      });

      console.log("Respuesta del servidor:", response);

      // 4. ACTUALIZACIÓN MANUAL DEL ESTADO LOCAL
      // Esto fuerza a React a pintar el ojo nuevo sin esperar a recargar todo
      setQuestions(prevQuestions => 
        prevQuestions.map(item => 
          item.id === q.id ? { ...item, active: newActiveStatus } : item
        )
      );

    } catch (error: any) {
      console.error("Error detallado al cambiar estado:", error.response?.data || error.message);
      alert("Error en el servidor: " + (error.response?.data?.message || "No se pudo actualizar"));
    }
  };

  const handleEdit = (q: QuestionData) => {
    setEditingId(q.id);
    setTextSource(q.textSource);
    setTextTarget(q.textTarget || "");
    setOptions(q.options?.length ? q.options : ["", ""]);
    setQuestionTypeId(q.questionType.id);
    setIsActive(q.active ?? true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Casting de iconos para evitar TS2786
  const IconEdit = FiEdit2 as any;
  const IconPlus = FiPlus as any;
  const IconTrash = FiTrash2 as any;
  const IconEye = FiEye as any;
  const IconEyeOff = FiEyeOff as any;
  const IconCheck = FiCheck as any;
  const IconX = FiX as any;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "20px" }}>❓ Gestión de Preguntas</h2>

      <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
        <select value={selectedUnitId} onChange={e => { setSelectedUnitId(e.target.value); setSelectedLessonId(""); }} style={{ padding: "12px", borderRadius: "12px", border: "2px solid #eee", flex: 1 }}>
          <option value="">Seleccionar Unidad</option>
          {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
        </select>
        <select value={selectedLessonId} onChange={e => setSelectedLessonId(e.target.value)} disabled={!selectedUnitId} style={{ padding: "12px", borderRadius: "12px", border: "2px solid #eee", flex: 1 }}>
          <option value="">Seleccionar Lección</option>
          {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
      </div>

      {selectedLessonId && (
        <div style={{ background: "#fff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", marginBottom: "40px", border: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px" }}>
              {editingId ? <IconEdit /> : <IconPlus />}
              {editingId ? "Editar Pregunta" : "Nueva Pregunta Inteligente"}
            </h3>
            <button 
              onClick={() => setIsActive(!isActive)}
              style={{ padding: "8px 16px", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: "pointer", background: isActive ? "#e8f5e9" : "#ffebee", color: isActive ? "#2e7d32" : "#c62828", display: "flex", alignItems: "center", gap: "8px" }}
            >
              {isActive ? <><IconCheck /> Visible para Alumnos</> : <><IconX /> Oculto / Borrador</>}
            </button>
          </div>

          <input placeholder="Texto Fuente" value={textSource} onChange={e => setTextSource(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "10px", border: "1px solid #eee" }} />
          <input placeholder="Traducción" value={textTarget} onChange={e => setTextTarget(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #eee" }} />

          <select value={questionTypeId} onChange={e => setQuestionTypeId(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #eee" }}>
            <option value="">Tipo de pregunta</option>
            {questionTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
          </select>

          {usesOptions && (
            <div style={{ marginBottom: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "15px" }}>
              <button onClick={() => setOptions([...options, ""])} style={{ float: "right", fontSize: "12px", color: "#1cb0f6", border: "none", background: "none", cursor: "pointer" }}>+ Añadir opción</button>
              <p style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "10px" }}>Opciones:</p>
              {options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
                  <input value={opt} onChange={e => { const c = [...options]; c[i] = e.target.value; setOptions(c); }} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }} />
                  <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))} style={{ border: "none", background: "none", color: "#ff4d4f" }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSave} style={{ flex: 1, padding: "15px", background: "#1cb0f6", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>Guardar</button>
            {editingId && <button onClick={resetForm} style={{ padding: "15px", background: "#eee", border: "none", borderRadius: "12px", cursor: "pointer" }}>Cancelar</button>}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: "10px" }}>
        {questions.map(q => (
          <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "#fff", borderRadius: "18px", border: "1px solid #f0f0f0", opacity: q.active ? 1 : 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button 
                onClick={() => toggleQuestionStatus(q)} 
                style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {q.active ? <IconEye style={{ color: "#1cb0f6" }} /> : <IconEyeOff style={{ color: "#aaa" }} />}
              </button>
              <div>
                <div style={{ fontWeight: "bold", color: q.active ? "#333" : "#aaa" }}>{q.textSource}</div>
                <div style={{ fontSize: "11px", color: "#1cb0f6", fontWeight: "bold" }}>{q.questionType.typeName}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleEdit(q)} style={{ padding: "10px", borderRadius: "10px", border: "none", background: "#e3f2fd", color: "#2196f3", cursor: "pointer" }}><IconEdit /></button>
              <button onClick={() => { if(window.confirm("¿Eliminar?")) deleteQuestion(q.id).then(loadQuestions); }} style={{ padding: "10px", borderRadius: "10px", border: "none", background: "#ffebee", color: "#f44336", cursor: "pointer" }}><IconTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}