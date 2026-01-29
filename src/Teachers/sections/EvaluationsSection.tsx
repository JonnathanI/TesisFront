import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiTrash2, FiFileText, FiUsers, FiX, 
  FiCalendar, FiUser, FiLayers, FiSave 
} from 'react-icons/fi';
import { 
  getQuestionTypes, 
  createFullEvaluation, 
  getTeacherEvaluations,
  getTeacherClassrooms, 
  assignEvaluationToClassroom,
  assignEvaluationToStudent,
  getStudentList // Usaremos esta para listar todos los estudiantes directamente
} from "../../api/auth.service";

const IconPlus = FiPlus as any;
const IconTrash = FiTrash2 as any;
const IconFile = FiFileText as any;
const IconUser = FiUser as any;
const IconLayers = FiLayers as any;
const IconX = FiX as any;
const IconCalendar = FiCalendar as any;

export function EvaluationsSection() {
  // --- ESTADOS DE CREACIÓN ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([
    { textSource: "", textTarget: "", questionTypeId: "", options: ["", "", "", ""] }
  ]);

  // --- ESTADOS DE GESTIÓN Y ASIGNACIÓN ---
  const [savedEvaluations, setSavedEvaluations] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<any>(null);
  
  const [assignmentMode, setAssignmentMode] = useState<"group" | "student">("group");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [types, evals, groups, students] = await Promise.all([
        getQuestionTypes(),
        getTeacherEvaluations(),
        getTeacherClassrooms(),
        getStudentList() // Trae todos los alumnos sin filtrar por aula
      ]);
      setQuestionTypes(types);
      setSavedEvaluations(evals);
      setClassrooms(groups);
      setAllStudents(students);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { textSource: "", textTarget: "", questionTypeId: "", options: ["", "", "", ""] }]);
  };

  const handleSaveAll = async () => {
    if (!title) return alert("El título es obligatorio");
    setLoading(true);
    try {
      await createFullEvaluation({ title, description, questions });
      alert("¡Evaluación creada con éxito!");
      setTitle("");
      setDescription("");
      setQuestions([{ textSource: "", textTarget: "", questionTypeId: "", options: ["", "", "", ""] }]);
      fetchInitialData();
    } catch (err) {
      alert("Error al guardar la evaluación.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEval) return;
    try {
      if (assignmentMode === "group") {
        if (!selectedClassroom) return alert("Selecciona un aula");
        await assignEvaluationToClassroom(selectedEval.id, selectedClassroom);
      } else {
        if (!selectedStudent) return alert("Selecciona un alumno");
        await assignEvaluationToStudent(selectedEval.id, selectedStudent);
      }
      alert("Asignación completada");
      setIsModalOpen(false);
    } catch (err) {
      alert("Error en la asignación");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-[#f7f7f7] min-h-screen font-sans">
      
      {/* SECCIÓN 1: FORMULARIO DE CREACIÓN (RESTAURADO) */}
      <div className="bg-white rounded-[2rem] shadow-sm p-8 mb-12 border-2 border-[#e5e5e5]">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#58cc02] p-4 rounded-2xl text-white shadow-[0_4px_0_#46a302]">
            <IconFile size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#3c3c3c] uppercase tracking-tighter">Creador de Exámenes</h1>
            <p className="text-[#afafaf] font-bold text-xs uppercase tracking-widest">Diseña retos para tus alumnos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <label className="block text-xs font-black text-[#afafaf] uppercase ml-2">Información Básica</label>
            <input
              className="w-full p-4 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none font-bold transition-all"
              placeholder="Título del examen"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              className="w-full p-4 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none font-medium text-sm min-h-[100px]"
              placeholder="Instrucciones adicionales..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="w-full py-4 bg-[#ffc800] hover:bg-[#ffdf00] text-[#7a5a00] font-black rounded-2xl shadow-[0_4px_0_#e5a500] active:translate-y-1 active:shadow-none transition-all uppercase"
            >
              {loading ? "GUARDANDO..." : "GUARDAR EVALUACIÓN"}
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6">
             <label className="block text-xs font-black text-[#afafaf] uppercase ml-2">Preguntas ({questions.length})</label>
             {questions.map((q, idx) => (
               <div key={idx} className="bg-white border-2 border-[#e5e5e5] rounded-3xl p-6 relative shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#1cb0f6] font-black text-sm uppercase italic">Pregunta #{idx+1}</span>
                    {questions.length > 1 && (
                      <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-[#afafaf] hover:text-[#ff4b4b]"><IconTrash /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input 
                      className="p-3 bg-[#f7f7f7] rounded-xl border-2 border-transparent focus:border-[#1cb0f6] outline-none font-bold text-sm" 
                      placeholder="Texto Pregunta" 
                      value={q.textSource}
                      onChange={e => { const n = [...questions]; n[idx].textSource = e.target.value; setQuestions(n); }}
                    />
                    <select 
                      className="p-3 bg-[#f7f7f7] rounded-xl border-2 border-transparent focus:border-[#1cb0f6] outline-none font-bold text-sm"
                      value={q.questionTypeId}
                      onChange={e => { const n = [...questions]; n[idx].questionTypeId = e.target.value; setQuestions(n); }}
                    >
                      <option value="">Tipo...</option>
                      {questionTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                    </select>
                  </div>
                  <input 
                    className="w-full p-3 bg-[#f0fff4] rounded-xl border-2 border-[#c6f6d5] focus:border-[#58cc02] outline-none font-bold text-sm text-[#2b612b] mb-3" 
                    placeholder="Respuesta Correcta" 
                    value={q.textTarget}
                    onChange={e => { const n = [...questions]; n[idx].textTarget = e.target.value; setQuestions(n); }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt:string, oIdx:number) => (
                      <input 
                        key={oIdx}
                        className="p-2 bg-white border border-[#e5e5e5] rounded-lg text-xs font-medium focus:border-[#1cb0f6] outline-none"
                        placeholder={`Distractor ${oIdx+1}`}
                        value={opt}
                        onChange={e => { const n = [...questions]; n[idx].options[oIdx] = e.target.value; setQuestions(n); }}
                      />
                    ))}
                  </div>
               </div>
             ))}
             <button onClick={addQuestion} className="w-full py-4 border-4 border-dashed border-[#e5e5e5] rounded-3xl text-[#afafaf] font-black hover:text-[#1cb0f6] transition-all text-xs">
               + AÑADIR OTRA PREGUNTA
             </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: MIS EVALUACIONES */}
      <div className="bg-white rounded-[2rem] shadow-sm p-8 border-2 border-[#e5e5e5]">
        <h2 className="text-xl font-black text-[#3c3c3c] mb-6 uppercase">Mis Evaluaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedEvaluations.map((ev) => (
            <div key={ev.id} className="p-6 border-2 border-[#e5e5e5] rounded-3xl hover:border-[#1cb0f6] transition-all group">
              <h4 className="font-black text-[#3c3c3c] mb-1 truncate">{ev.title}</h4>
              <p className="text-[#afafaf] text-xs font-bold uppercase mb-6">{ev.questions?.length || 0} Preguntas</p>
              <button 
                onClick={() => { setSelectedEval(ev); setIsModalOpen(true); }}
                className="w-full py-2 bg-white border-2 border-[#1cb0f6] rounded-xl text-[#1cb0f6] font-black text-xs uppercase hover:bg-[#1cb0f6] hover:text-white transition-all shadow-[0_3px_0_#1cb0f6] active:translate-y-1 active:shadow-none"
              >
                Asignar Reto
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE ASIGNACIÓN (MODIFICADO: Estudiantes directos) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3c3c3ccb] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#3c3c3c]">Asignar Evaluación</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#afafaf] hover:text-[#3c3c3c]"><IconX size={24}/></button>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5]">
              <button 
                onClick={() => setAssignmentMode("group")}
                className={`flex-1 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${assignmentMode === "group" ? "bg-white shadow-md text-[#1cb0f6]" : "text-[#afafaf]"}`}
              >
                <IconLayers /> POR AULA
              </button>
              <button 
                onClick={() => setAssignmentMode("student")}
                className={`flex-1 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${assignmentMode === "student" ? "bg-white shadow-md text-[#58cc02]" : "text-[#afafaf]"}`}
              >
                <IconUser /> POR ALUMNO
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {assignmentMode === "group" ? (
                <div>
                  <label className="block text-[10px] font-black text-[#afafaf] uppercase ml-2 mb-1">Selecciona el Aula</label>
                  <select 
                    className="w-full p-4 bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl font-bold outline-none focus:border-[#1cb0f6]"
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                  >
                    <option value="">Elegir...</option>
                    {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-[#afafaf] uppercase ml-2 mb-1">Selecciona al Estudiante</label>
                  <select 
                    className="w-full p-4 bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl font-bold outline-none focus:border-[#58cc02]"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Buscar estudiante...</option>
                    {allStudents.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-[#afafaf] uppercase ml-2 mb-1">Fecha de Entrega (Opcional)</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-4 bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl font-bold outline-none focus:border-[#1cb0f6]" 
                />
              </div>
            </div>

            <button 
              onClick={handleAssign}
              className={`w-full py-4 text-white font-black rounded-2xl transition-all uppercase shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none ${assignmentMode === 'group' ? 'bg-[#1cb0f6]' : 'bg-[#58cc02]'}`}
            >
              CONFIRMAR ASIGNACIÓN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}