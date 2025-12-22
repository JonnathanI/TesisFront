import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StudentTable from "./StudentTable"; // Componente asumido
import { registerBulk } from "../api/auth.service";

// --- IMPORTS API ---
import {
  getQuestionsByLesson, createQuestion, deleteQuestion,
  createUnit, createLesson, getCourseUnits, getLessonsByUnit,
  getTeacherClassrooms, createClassroom, deleteClassroom,
  getClassroomDetails, addStudentToClassroom, createAssignment, getClassroomAssignments,
  getStudentList, 
  deleteUnit, deleteLesson, updateUnit, updateLesson, updateQuestion, 
  removeToken, 
  ClassroomData, AssignmentData, QuestionData, UnitData, LessonData, StudentData
} from '../api/auth.service';

const DEFAULT_COURSE_ID = "fb7390f6-40d6-4b8e-b770-36e6e2b3d8f9";

// --- DATOS ESTÁTICOS ---
const sidebarNavItems = [
  { label: "DASHBOARD", id: "dashboard", icon: "📊" },
  { label: "GRUPOS", id: "groups", icon: "🏫" },
  { label: "ESTUDIANTES", id: "students", icon: "👨‍🎓" },
  { label: "UNIDADES", id: "units", icon: "📚" },
  { label: "LECCIONES", id: "lessons", icon: "📖" },
  { label: "PREGUNTAS", id: "questions", icon: "❓" },
{ label: "CARGA MASIVA", id: "bulk", icon: "👥" }, 
  { label: "MÁS", id: "more", icon: "⋯" },
];

const BulkRegistrationTab = () => {
  const [rows, setRows] = useState<any[]>([
    { id: Date.now(), fullName: "", email: "", password: "" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Añadir una nueva fila vacía
  const addRow = () => {
    setRows([...rows, { id: Date.now(), fullName: "", email: "", password: "" }]);
  };

  // Eliminar una fila específica
  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  // Actualizar el valor de una celda específica
  const handleInputChange = (id: number, field: string, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleBulkSubmit = async () => {
    // Filtrar filas vacías o incompletas
    const studentsToRegister = rows.filter(r => r.fullName.trim() && r.email.trim());
    
    if (studentsToRegister.length === 0) {
      alert("Por favor, completa al menos una fila con Nombre y Email.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { 
        students: studentsToRegister.map(({ fullName, email, password }) => ({ 
          fullName, 
          email, 
          password: password || "temp123" 
        })) 
      };
      
      const response = await registerBulk(payload);
      setResults(response);
      
      // Limpiar el formulario de registro al cumplir el proceso
      setRows([{ id: Date.now(), fullName: "", email: "", password: "" }]);
      
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#1cb0f6', margin: 0 }}>Carga Masiva de Alumnos</h2>
          <p style={{ opacity: 0.7, margin: '5px 0 0 0' }}>Ingresa los datos en la cuadrícula para registrar múltiples usuarios.</p>
        </div>
        <button 
          onClick={addRow}
          style={{ background: '#58cc02', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>+</span> Añadir Fila
        </button>
      </div>
      
      <div style={{ background: '#1f2a30', borderRadius: '1rem', border: '2px solid #2c363a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#131f24', textAlign: 'left', borderBottom: '2px solid #2c363a' }}>
              <th style={{ padding: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>NOMBRE COMPLETO</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>CORREO ELECTRÓNICO</th>
              <th style={{ padding: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>CONTRASEÑA (OPCIONAL)</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #2c363a' }}>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    type="text"
                    value={row.fullName}
                    onChange={(e) => handleInputChange(row.id, 'fullName', e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    type="email"
                    value={row.email}
                    onChange={(e) => handleInputChange(row.id, 'email', e.target.value)}
                    placeholder="juan@empresa.com"
                    style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input 
                    type="text"
                    value={row.password}
                    onChange={(e) => handleInputChange(row.id, 'password', e.target.value)}
                    placeholder="Por defecto: temp123"
                    style={{ width: '100%', padding: '0.6rem', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => removeRow(row.id)}
                    style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
                    title="Eliminar fila"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button 
          onClick={handleBulkSubmit} 
          disabled={isLoading}
          style={{ width: '250px', padding: '1rem', background: '#1cb0f6', border: 'none', borderRadius: '0.8rem', fontWeight: 'bold', color: 'white', cursor: 'pointer', fontSize: '1rem' }}
        >
          {isLoading ? "Procesando..." : "Guardar Todos los Estudiantes"}
        </button>
      </div>

      {results && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: results.failureCount > 0 ? 'rgba(255, 75, 75, 0.1)' : 'rgba(88, 204, 2, 0.1)', borderRadius: '1rem', border: `2px solid ${results.failureCount > 0 ? '#ff4b4b' : '#58cc02'}` }}>
          <h3 style={{ marginTop: 0, color: results.failureCount > 0 ? '#ff4b4b' : '#58cc02' }}>
            {results.failureCount > 0 ? "⚠️ Proceso completado con advertencias" : "✅ ¡Éxito total!"}
          </h3>
          <p>Se procesaron {results.totalProcessed} registros:</p>
          <ul>
            <li style={{ color: '#58cc02' }}>Éxitos: {results.successCount}</li>
            <li style={{ color: '#ff4b4b' }}>Fallos: {results.failureCount}</li>
          </ul>
          {results.errors.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              <strong>Detalle de errores:</strong>
              {results.errors.map((err: any, i: number) => (
                <div key={i} style={{ opacity: 0.8 }}>• {err.email}: {err.message}</div>
              ))}
            </div>
          )}
          <button 
            onClick={() => setResults(null)}
            style={{ marginTop: '1rem', background: 'transparent', border: '1px solid white', color: 'white', padding: '0.4rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Cerrar Reporte
          </button>
        </div>
      )}
    </div>
  );
};


export default function TeacherDashboard() {
  const navigate = useNavigate();
  
  // --- ESTADOS UI ---
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [subTab, setSubTab] = useState<"menu" | "form" | "list">("menu"); // Controla sub-vistas
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- TEMA ---
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const currentTheme = theme === 'light' 
    ? { background: '#ffffff', text: '#4b4b4b', sidebarBg: '#f7f7f7', border: '#e5e5e5', cardBg: '#ffffff' }
    : { background: '#131f24', text: 'white', sidebarBg: '#131f24', border: '#2c363a', cardBg: '#1f2a30' };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(prefersDark.matches ? 'dark' : 'light');
  }, []);
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // --- ESTADOS DE DATOS ---
  const [units, setUnits] = useState<UnitData[]>([]);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  
  const [allStudents, setAllStudents] = useState<StudentData[]>([]); 
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [studentSearchInput, setStudentSearchInput] = useState(""); 
  
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [groupAssignments, setGroupAssignments] = useState<AssignmentData[]>([]);
  
  // Formularios
  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [newUnitOrder, setNewUnitOrder] = useState(1);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonOrder, setNewLessonOrder] = useState(1);
  const [newGroupName, setNewGroupName] = useState(""); 
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskXP, setNewTaskXP] = useState(10);

  // Preguntas
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- EFECTOS ---
  useEffect(() => {
    fetchUnits();
    fetchClassrooms();
    fetchAllStudents(); 
  }, []);

  useEffect(() => { if (selectedGroupId) { fetchGroupDetails(selectedGroupId); fetchGroupAssignments(selectedGroupId); } }, [selectedGroupId]);
  useEffect(() => { if (selectedUnitId) fetchLessons(selectedUnitId); else { setLessons([]); setSelectedLessonId(""); } }, [selectedUnitId]);
  useEffect(() => { if (selectedLessonId) fetchQuestions(selectedLessonId); else setQuestions([]); }, [selectedLessonId]);

  // --- FETCHERS ---
  const fetchUnits = async () => { try { const data = await getCourseUnits(DEFAULT_COURSE_ID); setUnits(data); if (data.length > 0 && !selectedUnitId) setSelectedUnitId(data[0].id); } catch (err) { console.error("Error fetching units:", err); } };
  const fetchLessons = async (unitId: string) => { try { const data = await getLessonsByUnit(unitId); setLessons(data); if (data.length > 0) setSelectedLessonId(data[0].id); else setSelectedLessonId(""); } catch (err) { console.error("Error fetching lessons:", err); } };
  const fetchQuestions = async (lessonId: string) => { setIsLoading(true); try { const data = await getQuestionsByLesson(lessonId); setQuestions(data); } catch (err) { console.error("Error fetching questions:", err); } finally { setIsLoading(false); } };
  const fetchClassrooms = async () => { try { const data = await getTeacherClassrooms(); setClassrooms(data); } catch(e) { console.error("Error fetching classrooms:", e); } }
  
  const fetchAllStudents = async () => { 
      try { 
          const data = await getStudentList(); 
          setAllStudents(data); 
      } catch (e) { 
          setAllStudents([]); 
          console.error("Error al cargar la lista de estudiantes:", e); 
      } 
  }
  
  const fetchGroupDetails = async (id: string) => { try { const data = await getClassroomDetails(id); setGroupDetails(data); } catch(e) { console.error("Error fetching group details:", e); } }
  const fetchGroupAssignments = async (id: string) => { try { const data = await getClassroomAssignments(id); setGroupAssignments(data); } catch(e) { console.error("Error fetching assignments:", e); } }

  // --- HANDLERS COMUNES ---
  const resetForm = () => {
      setEditingId(null);
      setNewUnitTitle(""); setNewUnitOrder(1);
      setNewLessonTitle(""); setNewLessonOrder(1);
      setNewQuestionText(""); setNewOptions(["", "", "", ""]); setCorrectAnswer("");
  };

  // --- HANDLERS UNIDADES ---
  const handleSaveUnit = async () => {
      if (!newUnitTitle) return alert("Falta título");
      try {
          if (editingId) {
              await updateUnit(editingId, { title: newUnitTitle, unitOrder: Number(newUnitOrder) });
              alert("Unidad actualizada");
          } else {
              await createUnit({ courseId: DEFAULT_COURSE_ID, title: newUnitTitle, unitOrder: Number(newUnitOrder) });
              alert("Unidad creada");
          }
          resetForm(); fetchUnits(); setSubTab('list');
      } catch (err: any) { alert("Error al guardar unidad"); }
  };

  const handleEditUnit = (u: UnitData) => {
      setEditingId(u.id);
      setNewUnitTitle(u.title);
      setNewUnitOrder(u.unitOrder);
      setSubTab('form');
  };

  const handleDeleteUnit = async (id: string) => {
      if(!window.confirm("¿Eliminar unidad? Se borrarán todas sus lecciones.")) return;
      try { await deleteUnit(id); fetchUnits(); } catch(e) { alert("Error al eliminar"); }
  };

  // --- HANDLERS LECCIONES ---
  const handleSaveLesson = async () => {
      if (!selectedUnitId || !newLessonTitle) return alert("Faltan datos");
      try {
          if (editingId) {
              await updateLesson(editingId, { title: newLessonTitle, lessonOrder: Number(newLessonOrder), requiredXp: 15 });
              alert("Lección actualizada");
          } else {
              await createLesson({ unitId: selectedUnitId, title: newLessonTitle, lessonOrder: Number(newLessonOrder), requiredXp: 15 });
              alert("Lección creada");
          }
          resetForm(); fetchLessons(selectedUnitId); setSubTab('list');
      } catch (err: any) { alert("Error al guardar lección"); }
  };

  const handleEditLesson = (l: LessonData) => {
      setEditingId(l.id);
      setNewLessonTitle(l.title);
      setNewLessonOrder(l.lessonOrder);
      setSubTab('form');
  };

  const handleDeleteLesson = async (id: string) => {
      if(!window.confirm("¿Eliminar lección?")) return;
      try { await deleteLesson(id); if(selectedUnitId) fetchLessons(selectedUnitId); } catch(e) { alert("Error al eliminar"); }
  };

  // --- HANDLERS PREGUNTAS ---
  const handleSaveQuestion = async () => {
      if (!selectedLessonId || !newQuestionText || !correctAnswer) return alert("Faltan datos");
      const validOptions = newOptions.filter(o => o.trim());
      if (validOptions.length < 2) return alert("Mínimo 2 opciones");
      
      const payload = { lessonId: selectedLessonId, questionTypeId: "TRANSLATION_TO_TARGET", textSource: newQuestionText, textTarget: correctAnswer, options: validOptions };
      try {
          if (editingId) {
              await updateQuestion(editingId, payload);
              alert("Pregunta actualizada");
          } else {
              await createQuestion(payload);
              alert("Pregunta creada");
          }
          resetForm(); fetchQuestions(selectedLessonId); setSubTab('list');
      } catch (err: any) { alert("Error al guardar pregunta"); }
  };

  const handleEditQuestion = (q: QuestionData) => {
      setEditingId(q.id);
      setNewQuestionText(q.textSource);
      setCorrectAnswer(q.textTarget || "");
      // Rellenar opciones
      const ops = [...q.options];
      while(ops.length < 4) ops.push("");
      setNewOptions(ops);
      setSubTab('form');
  };

  const handleDeleteQuestion = async (id: string) => {
      if(!window.confirm("¿Eliminar pregunta?")) return;
      try { await deleteQuestion(id); if(selectedLessonId) fetchQuestions(selectedLessonId); } catch(e) { alert("Error"); }
  };

  // --- OTROS HANDLERS (GRUPOS/ESTUDIANTES) ---
  const handleCreateGroup = async () => { if(!newGroupName) return alert("Nombre requerido"); try { await createClassroom(newGroupName); setNewGroupName(""); fetchClassrooms(); setSubTab('list'); } catch(e) { alert("Error"); } }
  const handleDeleteGroup = async (id: string) => { if(!window.confirm("¿Eliminar grupo?")) return; await deleteClassroom(id); fetchClassrooms(); }
  const handleCreateAssignment = async () => { if(!newTaskTitle || !selectedGroupId) return; try { await createAssignment(selectedGroupId, { title: newTaskTitle, description: newTaskDesc, xp: Number(newTaskXP), dueDate: new Date().toISOString().split('T')[0] }); alert("Tarea asignada"); setNewTaskTitle(""); setNewTaskDesc(""); fetchGroupAssignments(selectedGroupId); } catch(e) { alert("Error creando tarea"); } }
  
  // CORRECCIÓN: Lógica de búsqueda para encontrar estudiantes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setStudentSearchInput(query);
      
      if (query.length === 0) {
          setFilteredStudents([]);
          setShowSuggestions(false);
          return;
      }

      const studentsToFilter = allStudents || []; 
            
      const filtered = studentsToFilter.filter(s => {
          const searchText = query.toLowerCase();
          const matchesName = s.fullName.toLowerCase().includes(searchText);
          const matchesEmail = (s.email || "").toLowerCase().includes(searchText);
          return matchesName || matchesEmail;
      });

      setFilteredStudents(filtered);
      setShowSuggestions(filtered.length > 0); 
  };
  
  const handleAddStudentFromSearch = async (s: StudentData) => {
      if (!selectedGroupId || !s.email) return alert("Error: Faltan datos (ID del grupo o Email del estudiante)");
      setShowSuggestions(false); setStudentSearchInput("");
      try { await addStudentToClassroom(selectedGroupId, s.email); fetchGroupDetails(selectedGroupId); alert("Estudiante añadido."); } catch (e) { alert("Error al añadir estudiante. Verifique que el email exista y no esté ya en el grupo."); }
  };
  
  const handleAddStudentManual = async () => { 
      if(!studentSearchInput || !selectedGroupId) return; 
      try { 
          await addStudentToClassroom(selectedGroupId, studentSearchInput); 
          setStudentSearchInput(""); 
          fetchGroupDetails(selectedGroupId); 
          alert("Estudiante añadido (por email)."); 
      } catch(e) { 
          alert("Error al añadir estudiante manualmente. Verifique que el email exista."); 
      } 
  }

  const handleLogoutClick = () => { setShowMoreMenu(false); setShowLogoutModal(true); };
  
  const confirmLogout = () => { removeToken(); navigate('/'); }; 
  
  const handleMoreMenuClick = (action: string) => { setShowMoreMenu(false); if (action === 'CONFIGURACION') toggleTheme(); else if (action === 'CERRAR_SESION') handleLogoutClick(); };

  // --- COMPONENTE AUXILIAR: TARJETA DE MENÚ (ActionCard) ---
  const ActionCard = ({ title, icon, color, onClick }: any) => (
      <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={onClick} style={{ 
            background: currentTheme.cardBg, 
            border: `2px solid ${currentTheme.border}`, 
            borderRadius: '1.5rem', 
            padding: '1rem', 
            textAlign: 'center', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '0.8rem', 
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)' 
        }}>
          <div style={{ 
              fontSize: '1.8rem', 
              background: `${color}20`, 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>{icon}</div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: currentTheme.text }}>{title}</h3> 
          <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>Haz clic para acceder</p>
      </motion.div>
  );


  return (
    <div style={{ height: "100vh", background: currentTheme.background, color: currentTheme.text, fontFamily: "'DIN Round', sans-serif", display: "flex", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .form-label { display: block; margin-bottom: 0.5rem; font-weight: bold; opacity: 0.8; }
        .form-select, .form-input { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 0.8rem; font-size: 1rem; background: ${theme==='dark'?'#2c363a':'white'}; color: ${theme==='dark'?'white':'black'}; margin-bottom: 1rem; }
        .btn-primary { background: #1cb0f6; color: white; padding: 0.8rem 2rem; border: none; border-radius: 0.8rem; font-weight: bold; cursor: pointer; }
        .btn-warning { background: #f59e0b; color: white; padding: 0.4rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight:bold; }
        .btn-danger { background: #ef4444; color: white; padding: 0.4rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; }
        .btn-success { background: #58cc02; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight:bold; }
        .group-card { border: 2px solid ${currentTheme.border}; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; background: ${currentTheme.cardBg}; cursor: pointer; }
        .group-code { background: ${theme==='dark'?'#1f2a30':'#eef2ff'}; color: #3b82f6; padding: 0.5rem 1rem; border-radius: 0.5rem; font-family: monospace; font-weight: bold; border: 1px dashed #3b82f6; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .student-item, .task-item { padding: 1rem; border-bottom: 1px solid ${currentTheme.border}; display: flex; justify-content: space-between; align-items: center; }
        .xp-badge { background: #ffc800; color: #7a4b04; padding: 0.2rem 0.6rem; borderRadius: 1rem; font-size: 0.8rem; font-weight: bold; }
        .suggestions-box { position: absolute; top: 100%; left: 0; right: 0; background: ${currentTheme.cardBg}; border: 1px solid ${currentTheme.border}; border-radius: 0.5rem; max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .suggestion-item { padding: 0.8rem; cursor: pointer; border-bottom: 1px solid ${currentTheme.border}; text-align: left; }
        .suggestion-item:hover { background: ${theme==='dark'?'#37464f':'#f0f9ff'}; color: #2563eb; }
        .section-card { background: ${currentTheme.cardBg}; padding: 2rem; border-radius: 1rem; border: 2px solid ${currentTheme.border}; }
        .back-btn { background: none; border: none; color: ${currentTheme.text}; cursor: pointer; margin-bottom: 1rem; opacity: 0.7; font-size: 1rem; display: flex; alignItems: center; gap: 0.5rem; }
        .grid-menu { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 800px; margin: 0 auto; }
        .list-item { padding: 1rem; border-bottom: 1px solid ${currentTheme.border}; display: flex; justify-content: space-between; align-items: center; }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside style={{ 
            width: "260px", 
            borderRight: `2px solid ${currentTheme.border}`, 
            padding: "1.5rem 0", 
            background: currentTheme.sidebarBg, 
            zIndex: 10, 
            display:'flex', 
            flexDirection:'column', 
            gap:'0.5rem',
            overflowY: "auto", // AGREGADO: Scroll vertical para el menú lateral
            height: "100vh" // Asegura que el aside ocupe toda la altura para que el scroll funcione
        }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1cb0f6", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>Panel Docente</h1>
        {sidebarNavItems.map((item) => (
          <div key={item.id} style={{ position: 'relative' }}>
             <div onClick={() => { if (item.id === "more") setShowMoreMenu(!showMoreMenu); else { setActiveTab(item.id); setSubTab('menu'); setSelectedGroupId(null); resetForm(); setShowMoreMenu(false); } }} style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "0.8rem 1.5rem", borderRadius: "0.8rem", cursor: "pointer", backgroundColor: activeTab === item.id ? "rgba(28, 176, 246, 0.15)" : "transparent", border: activeTab === item.id ? "2px solid #1cb0f6" : `2px solid transparent`, color: activeTab === item.id ? "#1cb0f6" : currentTheme.text }}>
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                <span style={{ fontWeight: 700, fontSize:'0.9rem' }}>{item.label}</span>
             </div>
             {item.id === "more" && showMoreMenu && (
                  <div style={{ position: 'absolute', top: 0, left: '100%', width: '220px', background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`, borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 20 }}>
                      <div onClick={() => handleMoreMenuClick('CONFIGURACION')} style={{ padding: '1rem', cursor: 'pointer', borderBottom:`1px solid ${currentTheme.border}` }}>{theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}</div>
                      <div onClick={() => handleMoreMenuClick('CERRAR_SESION')} style={{ padding: '1rem', cursor: 'pointer', color: 'red', fontWeight:'bold' }}>❌ Cerrar Sesión</div>
                  </div>
             )}
          </div>
        ))}
      </aside>

      {/* --- CONTENIDO (Scrollable) --- */}
      <div style={{ flex: 1, display: "block", overflowY: "auto" }}>
        <main style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
            <AnimatePresence mode="wait">
                
                {/* DASHBOARD */}
                {activeTab === "dashboard" && <motion.div key="dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="section-card"><h2>👋 Bienvenido</h2><p>Selecciona una opción del menú para comenzar.</p></motion.div>}

                {/* GRUPOS */}
{activeTab === "groups" && (
  <motion.div
    key="groups"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="section-card"
  >
    {/* MENÚ */}
    {subTab === "menu" && !selectedGroupId && (
      <div className="grid-menu">
        <ActionCard
          title="Crear Grupo"
          icon="➕"
          color="#58cc02"
          onClick={() => {
            resetForm();
            setSubTab("form");
          }}
        />
        <ActionCard
          title="Ver Grupos"
          icon="📋"
          color="#1cb0f6"
          onClick={() => setSubTab("list")}
        />
      </div>
    )}

    {/* FORMULARIO */}
    {subTab === "form" && (
      <div>
        <button className="back-btn" onClick={() => setSubTab("menu")}>
          ⬅ Volver
        </button>
        <h2>Crear Grupo</h2>

        <div style={{ maxWidth: "500px" }}>
          <label className="form-label">Nombre</label>
          <input
            className="form-input"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button className="btn-primary" onClick={handleCreateGroup}>
            Guardar
          </button>
        </div>
      </div>
    )}

    {/* LISTA DE GRUPOS O DETALLE */}
    {(subTab === "list" || selectedGroupId) && (
      <div>
        {!selectedGroupId ? (
          <>
            <button className="back-btn" onClick={() => setSubTab("menu")}>
              ⬅ Volver
            </button>
            <h2>Mis Grupos</h2>

            <div
              style={{
                display: "grid",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              {classrooms.map((c: any) => (
                <div
                  key={c.id}
                  className="group-card"
                  onClick={() => setSelectedGroupId(c.id)}
                >
                  <div>
                    <h3>{c.name}</h3>
                    <span>{c.code}</span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(c.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              className="back-btn"
              onClick={() => setSelectedGroupId(null)}
            >
              ⬅ Volver
            </button>

            <div
              style={{
                borderBottom: `2px solid ${currentTheme.border}`,
                paddingBottom: "1rem",
                marginBottom: "2rem",
              }}
            >
              <h1>{groupDetails?.name}</h1>
              <p>
                Código:{" "}
                <span className="group-code">{groupDetails?.code}</span>
              </p>
            </div>

            <div className="detail-grid">
              {/* ESTUDIANTES */}
              <div>
                <h3>Estudiantes</h3>

                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    className="form-input"
                    style={{ marginBottom: 0 }}
                    placeholder="Buscar estudiante (nombre o email)..."
                    value={studentSearchInput}
                    onChange={handleSearchChange}
                  />
                  <button
                    className="btn-success"
                    onClick={handleAddStudentManual}
                  >
                    +
                  </button>
                </div>

                {/* SUGERENCIAS */}
                {showSuggestions && filteredStudents.length > 0 && (
                  <div className="suggestions-box">
                    {filteredStudents.map((s: any) => (
                      <div
                        key={s.id}
                        className="suggestion-item"
                        onClick={() => handleAddStudentFromSearch(s)}
                      >
                        {s.fullName} ({s.email})
                      </div>
                    ))}
                  </div>
                )}

                {/* LISTA DE ESTUDIANTES */}
                <div
                  style={{
                    background: currentTheme.background,
                    borderRadius: "0.5rem",
                    border: `1px solid ${currentTheme.border}`,
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {groupDetails?.students?.map((s: any) => (
                    <div key={s.id} className="student-item">
                      <span>{s.fullName}</span>
                      <span className="xp-badge">{s.xpTotal} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TAREAS */}
              <div>
                <h3>Tareas</h3>

                <div
                  style={{
                    background: currentTheme.background,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${currentTheme.border}`,
                    marginBottom: "1rem",
                  }}
                >
                  <h4>Nueva Tarea</h4>

                  <input
                    className="form-input"
                    placeholder="Título"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      className="form-input"
                      placeholder="Desc"
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: "80px" }}
                      value={newTaskXP}
                      onChange={(e) =>
                        setNewTaskXP(Number(e.target.value))
                      }
                    />
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: "100%" }}
                    onClick={handleCreateAssignment}
                  >
                    Asignar
                  </button>
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {groupAssignments.map((a: any) => (
                    <div key={a.id} className="task-item">
                      <span>{a.title}</span>
                      <span className="xp-badge">
                        +{a.xpReward}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )}
  </motion.div>
)}


                {/* --- UNIDADES --- */}
                {activeTab === "units" && (
                    <motion.div key="units" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="section-card">
                        {subTab === 'menu' && <div className="grid-menu"><ActionCard title="Nueva Unidad" icon="📘" color="#ff9600" onClick={()=>{resetForm(); setSubTab('form')}} /><ActionCard title="Ver Unidades" icon="👀" color="#ce82ff" onClick={()=>setSubTab('list')} /></div>}
                        {subTab === 'form' && (<div><button className="back-btn" onClick={()=>setSubTab('menu')}>⬅ Volver</button><h2>{editingId?'Editar':'Crear'} Unidad</h2><div className="form-group"><label className="form-label">Título</label><input className="form-input" value={newUnitTitle} onChange={e=>setNewUnitTitle(e.target.value)} /></div><div className="form-group"><label className="form-label">Orden</label><input type="number" className="form-input" value={newUnitOrder} onChange={e=>setNewUnitOrder(Number(e.target.value))} /></div><button className="btn-primary" onClick={handleSaveUnit}>{editingId?'Actualizar':'Guardar'}</button></div>)}
                        {subTab === 'list' && (<div><button className="back-btn" onClick={()=>setSubTab('menu')}>⬅ Volver</button><h2>Lista de Unidades</h2><ul>{units.map(u=>(<li key={u.id} className="list-item"><span><strong>{u.unitOrder}.</strong> {u.title}</span><div><button className="btn-warning" style={{marginRight:'10px'}} onClick={()=>handleEditUnit(u)}>✏️</button><button className="btn-danger" onClick={()=>handleDeleteUnit(u.id)}>🗑️</button></div></li>))}</ul></div>)}
                    </motion.div>
                )}
                
                {/* --- LECCIONES --- */}
                {activeTab === "lessons" && (
                    <motion.div key="lessons" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="section-card">
                        {subTab === 'menu' && <div className="grid-menu"><ActionCard title="Nueva Lección" icon="📝" color="#58cc02" onClick={()=>{resetForm(); setSubTab('form')}} /><ActionCard title="Ver Lecciones" icon="📂" color="#1cb0f6" onClick={()=>setSubTab('list')} /></div>}
                        {(subTab === 'form' || subTab === 'list') && (
                            <div>
                                <button className="back-btn" onClick={()=>setSubTab('menu')}>⬅ Volver</button>
                                <h2>{subTab==='form' ? (editingId?'Editar Lección':'Nueva Lección') : 'Gestionar Lecciones'}</h2>
                                <div className="form-group"><label className="form-label">Unidad</label><select className="form-select" value={selectedUnitId} onChange={e=>setSelectedUnitId(e.target.value)}><option value="">-- Seleccionar --</option>{units.map(u=><option key={u.id} value={u.id}>{u.title}</option>)}</select></div>
                                {subTab==='form' && selectedUnitId && (<><div className="form-group"><label className="form-label">Título</label><input className="form-input" value={newLessonTitle} onChange={e=>setNewLessonTitle(e.target.value)} /></div><div className="form-group"><label className="form-label">Orden</label><input type="number" className="form-input" value={newLessonOrder} onChange={e=>setNewLessonOrder(Number(e.target.value))} /></div><button className="btn-primary" onClick={handleSaveLesson}>{editingId?'Actualizar':'Guardar'}</button></>)}
                                {subTab==='list' && selectedUnitId && (<ul>{lessons.map(l=><li key={l.id} className="list-item"><span>{l.lessonOrder}. {l.title}</span><div><button className="btn-warning" style={{marginRight:'10px'}} onClick={()=>handleEditLesson(l)}>✏️</button><button className="btn-danger" onClick={()=>handleDeleteLesson(l.id)}>🗑️</button></div></li>)}</ul>)}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* --- PREGUNTAS --- */}
                {activeTab === "questions" && (
                    <motion.div key="questions" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="section-card">
                        {subTab === 'menu' && <div className="grid-menu"><ActionCard title="Nueva Pregunta" icon="❓" color="#ff4b4b" onClick={()=>{resetForm(); setSubTab('form')}} /><ActionCard title="Ver Banco" icon="🗃️" color="#eab308" onClick={()=>setSubTab('list')} /></div>}
                        {(subTab === 'form' || subTab === 'list') && (
                            <div>
                                <button className="back-btn" onClick={()=>setSubTab('menu')}>⬅ Volver</button>
                                <h2>{subTab==='form'?(editingId?'Editar Pregunta':'Nueva Pregunta'):'Banco de Preguntas'}</h2>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}><div><label className="form-label">Unidad</label><select className="form-select" value={selectedUnitId} onChange={e=>setSelectedUnitId(e.target.value)}><option value="">--</option>{units.map(u=><option key={u.id} value={u.id}>{u.title}</option>)}</select></div><div><label className="form-label">Lección</label><select className="form-select" value={selectedLessonId} onChange={e=>setSelectedLessonId(e.target.value)} disabled={!selectedUnitId}><option value="">--</option>{lessons.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></div></div>
                                {selectedLessonId && subTab==='form' && (<><input className="form-input" placeholder="Pregunta (Texto Fuente)" value={newQuestionText} onChange={e=>setNewQuestionText(e.target.value)} /><div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>{newOptions.map((opt, i)=><input key={i} className="form-input" placeholder={`Opción ${i+1}`} value={opt} onChange={e=>{const n=[...newOptions];n[i]=e.target.value;setNewOptions(n)}} />)}</div><input className="form-input" placeholder="Respuesta Correcta (Texto Destino)" value={correctAnswer} onChange={e=>setCorrectAnswer(e.target.value)} /><button className="btn-primary" onClick={handleSaveQuestion}>{editingId?'Actualizar':'Guardar'}</button></>)}
                                {selectedLessonId && subTab==='list' && (<div>{questions.map(q=><div key={q.id} className="list-item"><div><strong>{q.textSource}</strong></div><div><button className="btn-warning" style={{marginRight:'10px'}} onClick={()=>handleEditQuestion(q)}>✏️</button><button className="btn-danger" onClick={()=>handleDeleteQuestion(q.id)}>🗑️</button></div></div>)}</div>)}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* --- ESTUDIANTES --- */}
                {activeTab === "students" && <motion.div key="students" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="section-card"><h2>Estudiantes</h2><StudentTable /></motion.div>}
              {activeTab === "bulk" && (
  <motion.div key="bulk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-card">
    <BulkRegistrationTab />
  </motion.div>
)}
            </AnimatePresence>
        </main>
      </div>

      {/* Modal de Cerrar Sesión */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.8 }} 
              style={{ background: currentTheme.cardBg, padding: '2rem', borderRadius: '1rem', border: `2px solid ${currentTheme.border}`, width: '300px', textAlign: 'center' }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
              <h2 style={{ marginBottom: '1rem', color: currentTheme.text }}>¿Cerrar Sesión?</h2>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  style={{ padding: '0.8rem 1.5rem', borderRadius: '0.8rem', border: `2px solid ${currentTheme.border}`, background: 'transparent', color: currentTheme.text, fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmLogout} 
                  style={{ padding: '0.8rem 1.5rem', borderRadius: '0.8rem', border: 'none', background: '#ff4b4b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
