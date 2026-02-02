import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiTrash2, FiFileText, FiX, 
  FiUser, FiLayers, FiList, FiType, FiMic 
} from 'react-icons/fi';
import { 
  getQuestionTypes, 
  createFullEvaluation, 
  getTeacherEvaluations,
  getTeacherClassrooms, 
  assignEvaluationToClassroom,
  assignEvaluationToStudent,
  getStudentList 
} from "../../api/auth.service";

// --- CORRECCIÓN TS2786: Casteo de iconos a 'any' ---
const IconPlus = FiPlus as any;
const IconTrash = FiTrash2 as any;
const IconFile = FiFileText as any;
const IconUser = FiUser as any;
const IconLayers = FiLayers as any;
const IconX = FiX as any;
const IconList = FiList as any;
const IconType = FiType as any;
const IconMic = FiMic as any;

export function EvaluationsSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado de preguntas inicializado con campos de evaluación
  const [questions, setQuestions] = useState<any[]>([
    { 
      textSource: "", 
      textTarget: "", 
      questionTypeId: "", 
      options: ["", "", "", ""],
      category: "GRAMMAR",
      difficultyScore: 1.0
    }
  ]);

  const [savedEvaluations, setSavedEvaluations] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<any>(null);
  const [assignmentMode, setAssignmentMode] = useState<"group" | "student">("group");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [types, evals, groups, students] = await Promise.all([
        getQuestionTypes(),
        getTeacherEvaluations(),
        getTeacherClassrooms(),
        getStudentList()
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
    setQuestions([...questions, { 
      textSource: "", 
      textTarget: "", 
      questionTypeId: "", 
      options: ["", "", "", ""],
      category: "GRAMMAR",
      difficultyScore: 1.0
    }]);
  };

  const handleSaveAll = async () => {
    if (!title) return alert("El título es obligatorio");
    if (questions.some(q => !q.questionTypeId)) return alert("Todas las preguntas deben tener un tipo");
    
    setLoading(true);
    try {
      await createFullEvaluation({ title, description, questions });
      alert("¡Evaluación creada con éxito!");
      setTitle("");
      setDescription("");
      setQuestions([{ textSource: "", textTarget: "", questionTypeId: "", options: ["", "", "", ""], category: "GRAMMAR", difficultyScore: 1.0 }]);
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

  const getTypeName = (id: string) => {
    return questionTypes.find(t => t.id === id)?.typeName || "";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-[#f7f7f7] min-h-screen font-sans">
      
      {/* SECCIÓN 1: CREADOR DE EXÁMENES */}
      <div className="bg-white rounded-[2rem] shadow-sm p-8 mb-12 border-2 border-[#e5e5e5]">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#1cb0f6] p-4 rounded-2xl text-white shadow-[0_4px_0_#1899d6]">
            <IconFile size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#3c3c3c] uppercase">Banco de Evaluaciones</h1>
            <p className="text-[#afafaf] font-bold text-xs uppercase tracking-widest">Preguntas sin lección obligatoria</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-8">
                <label className="block text-xs font-black text-[#afafaf] uppercase ml-2 mb-2">General</label>
                <input
                className="w-full p-4 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none font-bold mb-4"
                placeholder="Nombre del Examen"
                value={title}
                onChange={e => setTitle(e.target.value)}
                />
                <textarea
                className="w-full p-4 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none font-medium text-sm min-h-[100px] mb-6"
                placeholder="Descripción o instrucciones..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                />
                <button
                onClick={handleSaveAll}
                disabled={loading}
                className="w-full py-4 bg-[#58cc02] hover:bg-[#61e002] text-white font-black rounded-2xl shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none transition-all uppercase"
                >
                {loading ? "PROCESANDO..." : "PUBLICAR EVALUACIÓN"}
                </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
             <label className="block text-xs font-black text-[#afafaf] uppercase ml-2">Lista de Reactivos ({questions.length})</label>
             {questions.map((q, idx) => {
               const currentType = getTypeName(q.questionTypeId);
               return (
                <div key={idx} className="bg-white border-2 border-[#e5e5e5] rounded-3xl p-6 relative shadow-sm hover:border-[#1cb0f6] transition-colors">
                   <div className="flex justify-between items-center mb-6">
                     <span className="bg-[#ddf4ff] text-[#1cb0f6] px-4 py-1 rounded-full font-black text-xs uppercase">
                        Reactivo #{idx+1} {currentType && `| ${currentType}`}
                     </span>
                     <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-[#afafaf] hover:text-[#ff4b4b] transition-colors">
                        <IconTrash size={20}/>
                     </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#afafaf] ml-2 uppercase">Tipo de Dinámica</label>
                        <select 
                            className="w-full p-3 bg-[#f7f7f7] rounded-xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none font-bold text-sm"
                            value={q.questionTypeId}
                            onChange={e => { const n = [...questions]; n[idx].questionTypeId = e.target.value; setQuestions(n); }}
                        >
                            <option value="">Seleccionar tipo...</option>
                            {questionTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#afafaf] ml-2 uppercase">Puntos / Dificultad</label>
                        <input 
                            type="number"
                            step="0.5"
                            className="w-full p-3 bg-[#f7f7f7] rounded-xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none font-bold text-sm"
                            value={q.difficultyScore}
                            onChange={e => { const n = [...questions]; n[idx].difficultyScore = e.target.value; setQuestions(n); }}
                        />
                      </div>
                   </div>

                   <div className="mb-4">
                    <label className="text-[10px] font-black text-[#afafaf] ml-2 uppercase">Pregunta o Instrucción</label>
                    <input 
                      className="w-full p-4 bg-[#f7f7f7] rounded-xl border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none font-bold text-md" 
                      placeholder="Escribe el enunciado aquí..."
                      value={q.textSource}
                      onChange={e => { const n = [...questions]; n[idx].textSource = e.target.value; setQuestions(n); }}
                    />
                   </div>

                   <div className="mb-6">
                    <label className="text-[10px] font-black text-[#58cc02] ml-2 uppercase">Respuesta Correcta</label>
                    <input 
                        className="w-full p-4 bg-[#f0fff4] rounded-xl border-2 border-[#58cc02] focus:border-[#58cc02] outline-none font-black text-md text-[#2b612b]" 
                        placeholder="La respuesta válida"
                        value={q.textTarget}
                        onChange={e => { const n = [...questions]; n[idx].textTarget = e.target.value; setQuestions(n); }}
                    />
                   </div>

                   {(currentType === "SELECT_ONE" || currentType === "IMAGE_SELECT") && (
                     <div className="space-y-3 p-4 bg-[#fafafa] rounded-2xl border-2 border-dashed border-[#e5e5e5]">
                        <label className="text-[10px] font-black text-[#afafaf] uppercase">Opciones Incorrectas</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt:string, oIdx:number) => (
                            <div key={oIdx} className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-[#ccc]">{oIdx + 1}</span>
                                <input 
                                    className="flex-1 p-3 bg-white border-2 border-[#e5e5e5] rounded-xl text-sm font-bold focus:border-[#1cb0f6] outline-none"
                                    placeholder={`Opción ${oIdx+1}`}
                                    value={opt}
                                    onChange={e => { const n = [...questions]; n[idx].options[oIdx] = e.target.value; setQuestions(n); }}
                                />
                            </div>
                            ))}
                        </div>
                     </div>
                   )}
                </div>
               );
             })}

             <button 
               onClick={addQuestion} 
               className="w-full py-6 border-4 border-dashed border-[#e5e5e5] rounded-[2rem] text-[#afafaf] font-black hover:text-[#1cb0f6] hover:border-[#1cb0f6] hover:bg-[#f0f9ff] transition-all flex items-center justify-center gap-3"
             >
               <IconPlus size={24} /> AÑADIR OTRO REACTIVO
             </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: LISTADO */}
      <div className="bg-white rounded-[2rem] shadow-sm p-8 border-2 border-[#e5e5e5]">
        <h2 className="text-xl font-black text-[#3c3c3c] mb-6 uppercase flex items-center gap-2">
            <IconList className="text-[#1cb0f6]"/> Evaluaciones Disponibles
        </h2>
        {savedEvaluations.length === 0 ? (
            <div className="text-center py-12 text-[#afafaf] font-bold italic">No hay evaluaciones.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvaluations.map((ev) => (
                <div key={ev.id} className="p-6 border-2 border-[#e5e5e5] rounded-[2rem] hover:border-[#1cb0f6] transition-all bg-white shadow-sm">
                <h4 className="font-black text-[#3c3c3c] mb-1 truncate text-lg">{ev.title}</h4>
                <p className="text-[#afafaf] text-xs font-bold uppercase mb-6 flex items-center gap-1">
                    <IconLayers /> {ev.questions?.length || 0} Preguntas
                </p>
                <button 
                    onClick={() => { setSelectedEval(ev); setIsModalOpen(true); }}
                    className="w-full py-3 bg-[#1cb0f6] rounded-2xl text-white font-black text-xs uppercase shadow-[0_4px_0_#1899d6] active:translate-y-1 active:shadow-none"
                >
                    Asignar a Alumnos
                </button>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* MODAL DE ASIGNACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3c3c3ccb] backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[#afafaf] hover:text-[#3c3c3c]"><IconX size={24}/></button>
              <h3 className="text-2xl font-black text-[#3c3c3c] mb-6">Asignar Reto</h3>
              
              <div className="flex gap-2 mb-6 p-1 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5]">
                <button onClick={() => setAssignmentMode("group")} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${assignmentMode === "group" ? "bg-white shadow-md text-[#1cb0f6]" : "text-[#afafaf]"}`}>POR AULA</button>
                <button onClick={() => setAssignmentMode("student")} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${assignmentMode === "student" ? "bg-white shadow-md text-[#58cc02]" : "text-[#afafaf]"}`}>POR ALUMNO</button>
              </div>

              <div className="space-y-4 mb-8">
                {assignmentMode === "group" ? (
                    <select className="w-full p-4 bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl font-bold outline-none" value={selectedClassroom} onChange={e => setSelectedClassroom(e.target.value)}>
                        <option value="">Selecciona Aula...</option>
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                ) : (
                    <select className="w-full p-4 bg-[#f7f7f7] border-2 border-[#e5e5e5] rounded-2xl font-bold outline-none" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                        <option value="">Selecciona Alumno...</option>
                        {allStudents.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                    </select>
                )}
              </div>

              <button onClick={handleAssign} className={`w-full py-4 text-white font-black rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all ${assignmentMode === 'group' ? 'bg-[#1cb0f6]' : 'bg-[#58cc02]'}`}>
                ENVIAR EXAMEN
              </button>
           </div>
        </div>
      )}
    </div>
  );
}