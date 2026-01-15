import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

// --- IMPORTS COMPONENTES ---
import LearningPathSVG from '../Components/LearningPathSVG'; 
import { QuizModal } from '../Components/QuizModal'; 
import UserProfile from './UserProfile'; 
import Challenges from './Challenges'; 

// --- IMPORTS API ---
import {
  getCourseStatus, 
  getUnitProgress,
  getLessonQuestions,
  completeLesson,
  joinClassroom,
  getStudentClassrooms, 
  getStudentClassroomDetails, 
  getClassroomLeaderboard, 
  getUserProfile,
  getGlobalLeaderboard,
  buyShopItem,
  UnitWithLessons,
  QuestionDTO,
  LeaderboardEntry,
  UserProfileData,
} from '../api/auth.service'; 
import type { Lesson } from '../api/auth.service';

// --- TIPOS LOCALES ---
type PathNodeStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';
const COURSE_ID = "f23e5216-dec7-4c6f-9ce9-95064bf3e4ac";


interface PathNode {
  lessonId: string;
  type: 'lesson' | 'checkpoint';
  icon: string;
  title: string;
  color: string;
  status: PathNodeStatus;
  totalQuestions?: number; 
  currentProgress?: number;
}

interface SoundItemBase {
    icon: string;
    name: string;
    pronunciation?: string; 
}

// --- DATOS ESTÁTICOS ---
const sidebarNavItems = [
  { label: "APRENDER", icon: "🏠" },
  { label: "SONIDOS", icon: "👄" },
  { label: "DESAFÍOS", icon: "🏆" },
  { label: "GRUPOS", icon: "🏫" }, 
  { label: "TIENDA", icon: "🛍️" },
  { label: "PERFIL", icon: "👤" },
  { label: "CERRAR SESIÓN", icon: "🚪" }
];

const cards = [
  { title: "Compite en Ligas", icon: "🛡️", description: "Completa lecciones y gana puntos" },
  { title: "Desafíos Diarios", icon: "⚡", description: "Gana XP completando retos diarios" },
  { title: "Crea tu Perfil", icon: "👤", description: "Guarda tu progreso y personaliza tu avatar" },
];

const soundItems: { category: string, items: SoundItemBase[] }[] = [
    { category: "Alfabeto", items: [
        { icon: "🅰️", name: "A", pronunciation: "ei" }, { icon: "🅱️", name: "B", pronunciation: "bi" }, { icon: "🇨", name: "C", pronunciation: "si" }, 
        { icon: "🇩", name: "D", pronunciation: "di" }, { icon: "🇪", name: "E", pronunciation: "i" }, { icon: "🇫", name: "F", pronunciation: "ef" },
        { icon: "🇬", name: "G", pronunciation: "yi" }, { icon: "🇭", name: "H", pronunciation: "eich" }, { icon: "🇮", name: "I", pronunciation: "ai" }
    ]},
    { category: "Verbos Comunes", items: [
        { icon: "🏃", name: "Run" }, { icon: "🍽️", name: "Eat" }, { icon: "😴", name: "Sleep" }, 
        { icon: "✍️", name: "Write" }, { icon: "🗣️", name: "Speak" }, { icon: "🚶", name: "Walk" }
    ]},
    { category: "Colores", items: [
        { icon: "🔴", name: "Red" }, { icon: "🔵", name: "Blue" }, { icon: "🟢", name: "Green" },
        { icon: "🟡", name: "Yellow" }, { icon: "⚫", name: "Black" }, { icon: "⚪", name: "White" }
    ]}
];

// --- HELPERS ---
const getIconForTitle = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('repaso')) return '🏆';
  if (lower.includes('intro') || lower.includes('hola')) return '👋';
  return '📚';
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function StudentDashboard() {
  
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("APRENDER");
  const [isLoading, setIsLoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false); 
  
  // --- NUEVO ESTADO PARA EL MODAL DE SALIR ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- TEMA ---
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const themeRef = useRef<HTMLDivElement>(null);
  
  const currentTheme = theme === 'light' 
    ? { background: '#ffffff', text: '#4b4b4b', sidebarBg: '#f7f7f7', border: '#e5e5e5', cardBg: '#ffffff' }
    : { background: '#131f24', text: 'white', sidebarBg: '#131f24', border: '#2c363a', cardBg: '#1f2a30' };

  const mapOverlayColor = theme === 'dark' ? 'rgba(19, 31, 36, 0.85)' : 'rgba(255, 255, 255, 0.4)';

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(prefersDark.matches ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // --- ESTADOS DE DATOS ---
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null); 
  const [selectedUnitTitle, setSelectedUnitTitle] = useState("");
  const [pathData, setPathData] = useState<PathNode[]>([]);
  
  const [quizQuestions, setQuizQuestions] = useState<QuestionDTO[] | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const [joinCode, setJoinCode] = useState(""); 
  const [myGroups, setMyGroups] = useState<any[]>([]); 
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [groupTab, setGroupTab] = useState<'TAREAS' | 'LIGA'>('TAREAS');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [globalLeague, setGlobalLeague] = useState<LeaderboardEntry[]>([]);
const [isPathLoading, setIsPathLoading] = useState(false);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]); 
  const [hasInitialized, setHasInitialized] = useState(false);
  // AÑADE ESTO AQUÍ:
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

useEffect(() => {
  const loadCourse = async () => {
    try {
      const data = await getCourseStatus(COURSE_ID);
      setUnits(data);
    } catch (e) {
      console.error('Error cargando unidades', e);
    }
  };

  loadCourse();
}, []);


  // --- CARGA INICIAL ---
 useEffect(() => {
  fetchUserData();
  if (activeSection === "GRUPOS" && !viewingGroupId) {
    fetchMyGroups();
  }
}, [activeSection, viewingGroupId]);


  useEffect(() => { if (selectedUnitId) fetchPathData(selectedUnitId); }, [selectedUnitId]

);
  useEffect(() => { if (viewingGroupId) { fetchGroupDetails(viewingGroupId); fetchLeaderboard(viewingGroupId); } }, [viewingGroupId]);
useEffect(() => {
  // Solo marcamos que ya se cargaron las unidades para evitar bucles,
  // pero NO llamamos a setSelectedUnitId.
  if (units.length > 0 && !hasInitialized) {
    setHasInitialized(true); 
    // Al no poner nada aquí, selectedUnitId se queda en null
    // y React mostrará el listado de unidades por defecto.
  }
}, [units, hasInitialized]);


  // --- FETCHERS ---
  const fetchUserData = async () => {
      try {
          const profile = await getUserProfile();
          setUserProfile(profile);
          if (profile.totalXp > 0) {
              const leagueData = await getGlobalLeaderboard();
              setGlobalLeague(leagueData);
          }
      } catch(e) { console.error(e); }
  }

  const fetchMyGroups = async () => { try { const g = await getStudentClassrooms(); setMyGroups(g); } catch (e) {} }
  const fetchGroupDetails = async (id: string) => { setIsLoading(true); try { const d = await getStudentClassroomDetails(id); setGroupDetails(d); } catch (e) {} finally { setIsLoading(false); } }
  const fetchLeaderboard = async (id: string) => { try { const d = await getClassroomLeaderboard(id); setLeaderboard(d); } catch (e) {} }
  
const fetchPathData = async (unitId: string) => {
  if (!unitId) return;
  
  // Limpiamos los nodos actuales para que no haya rastro de la unidad anterior
  setPathData([]); 
  setIsLoading(true);
  nodeRefs.current = [];

  try {
    // Buscamos en el estado local (que ya actualizamos en handleQuizComplete)
    const unit = units.find(u => u.id === unitId);
    if (!unit || !unit.lessons) return;

    let foundActive = false;
    const newPathData: PathNode[] = unit.lessons.map((lesson) => {
      let status: PathNodeStatus = 'LOCKED';
      const progressPercent = lesson.isCompleted ? 100 : 0; 

      if (lesson.isCompleted) {
        status = 'COMPLETED';
      } else if (!foundActive) {
        status = 'ACTIVE';
        foundActive = true;
      }

      return {
        type: 'lesson',
        lessonId: lesson.id,
        title: lesson.title,
        icon: '📘',
        color: '#58cc02',
        status,
        progress: progressPercent,
      };
    });

    setPathData(newPathData);
  } catch (e) {
    console.error(e);
  } finally {
    // IMPORTANTE: Un pequeño delay de 100ms evita el parpadeo 
    // y da tiempo a que el SVG calcule las posiciones de las líneas.
    setTimeout(() => {
      setIsLoading(false);
    }, 150);
  }
};
  // --- HANDLERS ---
const startLesson = async (lessonId: string) => {
  if (isLoading) return;
  setIsLoading(true);

  try {
    const q = await getLessonQuestions(lessonId); // 1. Primero pedimos las preguntas
    if (q && q.length > 0) {
      setQuizQuestions(q);       // 2. Guardamos las preguntas
      setActiveLessonId(lessonId); // 3. Guardamos el ID
      setShowQuizModal(true);    // 4. ¡Recién ahora abrimos el modal!
    } else {
      alert("Esta lección no tiene preguntas aún.");
    }
  } catch (e) {
    console.error("Error al cargar lección", e);
  } finally {
    setIsLoading(false);
  }
};
  
const handleQuizComplete = async (lessonId: string, count: number) => {
  try {
    // 1. Guardamos en la base de datos
    await completeLesson(lessonId, count);

    // 2. Actualizamos el estado de las UNIDADES
    setUnits(prevUnits => {
      return prevUnits.map(unit => ({
        ...unit,
        lessons: unit.lessons?.map(lesson => 
          lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
        )
      }));
    });

    // 3. ACTUALIZACIÓN INMEDIATA DEL MAPA (pathData)
    // Esto hace que el nodo cambie a amarillo y el siguiente se active sin esperar al fetch
    setPathData(prevPath => {
      let foundActive = false;
      return prevPath.map((node) => {
        // Si es la lección terminada -> COMPLETADA (Amarillo)
        if (node.lessonId === lessonId) {
          return { ...node, status: 'COMPLETED' };
        }
        
        // Lógica para desbloquear la siguiente lección si estaba bloqueada
        if (node.status === 'COMPLETED') return node;
        
        if (!foundActive && node.status === 'LOCKED') {
          foundActive = true;
          return { ...node, status: 'ACTIVE' };
        }
        return node;
      });
    });

    // 4. Actualizamos el perfil del usuario (para ver las gemas/XP ganadas)
    fetchUserData();

    setShowQuizModal(false);
  } catch (error) {
    console.error("Error al completar la lección:", error);
    alert("Hubo un error al guardar tu progreso.");
  }
};

  const openLevelModal = (idx: number) => {
    const node = pathData[idx];
    if (node.status === 'LOCKED') return;
    if (node.type === 'lesson') {
      if (node.status === 'COMPLETED' && !window.confirm(`Repasar "${node.title}"?`)) return;
      startLesson(node.lessonId);
    } else alert("¡Checkpoint!");
  };

  const handleJoinGroup = async () => { if (!joinCode) return alert("Código requerido"); try { await joinClassroom(joinCode); alert(`¡Unido!`); setJoinCode(""); fetchMyGroups(); } catch (err) { alert("Error al unirse."); } };
  
  // --- HANDLERS DE CIERRE DE SESIÓN (ACTUALIZADOS PARA MODAL) ---
  
  // 1. Solo abre el modal
  const handleLogoutClick = () => { 
      setShowMoreMenu(false); // Cierra el menú "MÁS"
      setShowLogoutModal(true); // Abre el modal de confirmación
  };

  // 2. Ejecuta la acción real
  const confirmLogout = () => {
      // Aquí puedes limpiar localStorage si guardas tokens:
      // localStorage.removeItem('jwt-token');
      navigate('/'); 
  };

  const speak = (t: string) => { const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; speechSynthesis.speak(u); };
  
  const handleMoreMenuClick = (a: any) => { 
      setShowMoreMenu(false); 
      setSelectedUnitId(null); 
      if (a === 'GRUPOS') { setActiveSection("GRUPOS"); setViewingGroupId(null); } 
      else if (a === 'CONFIGURACION') setActiveSection("CONFIGURACION"); 
      else if (a === 'CERRAR_SESION') handleLogoutClick(); // <--- Llama a la nueva función
  };

  const handlePurchase = async (itemType: string, cost: number) => {
      if (!userProfile) return;
      if (userProfile.lingots < cost) return alert("¡No tienes suficientes gemas!");
      if (itemType === 'HEART_REFILL' && userProfile.heartsCount >= 3) return alert("¡Vidas llenas!");
      
      if (!window.confirm(`¿Comprar por ${cost} gemas?`)) return;

      try {
          await buyShopItem(itemType);
          alert("¡Compra exitosa!");
          fetchUserData();
      } catch (e) { alert("Error al comprar."); }
  };

  // --- ANIMACIONES ---
  const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } } };
  const nodeVariants: Variants = { hidden: { opacity: 0, y: 30, scale: 0.8 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 12 } } };

  // --- VARIABLES UI ---
  const isWideSection = activeSection === "PERFIL" || activeSection === "DESAFÍOS";

  // ============================================================
  // RENDER
  // ============================================================
  console.log('selectedUnitId:', selectedUnitId);
console.log('units:', units);
console.log('pathData:', pathData);

  return (
    <div style={{ height: "100vh", background: currentTheme.background, color: currentTheme.text, fontFamily: "'DIN Round', sans-serif", display: "flex", overflow: "hidden" }}>
      <style>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
      
      {/* SIDEBAR IZQUIERDA */}
      {/* Busca esta sección dentro del return de tu componente */}
<aside style={{ width: "260px", borderRight: `2px solid ${currentTheme.border}`, padding: "1.5rem", background: currentTheme.sidebarBg, zIndex: 10 }}>
  <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#58cc02", marginBottom: "1.5rem", paddingLeft: "1rem" }}>Peek</h1>
  
  {sidebarNavItems.map((item) => (
    <div key={item.label}>
      <div 
        onClick={() => { 
          if (item.label === "CERRAR SESIÓN") {
            // Esta es la función que activa el modal que ya tienes al final del código
            setShowLogoutModal(true); 
          } else {
            setActiveSection(item.label); 
            setSelectedUnitId(null); 
            setViewingGroupId(null); 
          }
        }} 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "1.2rem", 
          padding: "0.8rem 1rem", 
          borderRadius: "0.8rem", 
          cursor: "pointer", 
          marginBottom: "0.5rem",
          backgroundColor: activeSection === item.label ? "rgba(28, 176, 246, 0.15)" : "transparent", 
          color: item.label === "CERRAR SESIÓN" ? "#ff4b4b" : (activeSection === item.label ? "#1cb0f6" : currentTheme.text) 
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
        <span style={{ fontWeight: 700 }}>{item.label}</span>
      </div>
    </div>
  ))}
</aside>

      {/* CONTENIDO CENTRAL */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", overflowY: "auto" }}>
        <main style={{ 
            width: "100%", maxWidth: "700px", padding: "0",
            backgroundImage: `linear-gradient(${mapOverlayColor}, ${mapOverlayColor}), url("https://euroingles.com/theme/edly/pix/euro-02.png")`,
            backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center top',
            minHeight: '100%', display: 'flex', flexDirection: 'column'
        }}>
          
          <div style={{ flex: 1, padding: "2rem 1rem" }}>

           {/* SECCIÓN: APRENDER */}
{activeSection === "APRENDER" && (
  <div style={{ width: "100%" }}>
    {!selectedUnitId ? (
      /* --- VISTA 1: LISTADO DE TODAS LAS UNIDADES --- */
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: currentTheme.text, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          Ruta de Aprendizaje
        </h2>
        
        {units.map((unit, idx) => {
  // Calculamos el progreso. 
  // Si la unidad está bloqueada es 0, si no, calculamos lecciones completadas / totales
  const totalLessons = unit.lessons?.length || 0;
  const completedLessons = unit.lessons?.filter(l => l.isCompleted).length || 0;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  return (
    <motion.div
      key={unit.id}
      whileHover={!unit.isLocked ? { scale: 1.02 } : {}}
      onClick={() => {
        if (!unit.isLocked) {
          setSelectedUnitId(unit.id);
          setSelectedUnitTitle(unit.title);
          fetchPathData(unit.id);
        }
      }}
      style={{
        background: unit.isLocked 
          ? (theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)') 
          : `linear-gradient(135deg, ${idx % 2 === 0 ? '#58cc02' : '#ce82ff'}, ${idx % 2 === 0 ? '#46a302' : '#a562ff'})`,
        padding: '1.5rem 2rem',
        borderRadius: '1rem',
        cursor: unit.isLocked ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column', // Cambiado a columna para que la barra vaya abajo
        gap: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        border: unit.isLocked ? `2px solid ${currentTheme.border}` : 'none',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: unit.isLocked ? currentTheme.text : 'white' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Unidad {unit.unitOrder}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>{unit.title}</p>
        </div>
        <div style={{ fontSize: '1.5rem', color: unit.isLocked ? currentTheme.text : 'white' }}>
          {unit.isLocked ? '🔒' : '▶'}
        </div>
      </div>

      {/* --- BARRA DE PROGRESO NUEVA --- */}
      {!unit.isLocked && (
        <div style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            color: 'white', 
            marginBottom: '4px',
            fontWeight: 'bold' 
          }}>
            <span>Progreso</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '10px', 
            backgroundColor: 'rgba(255,255,255,0.3)', 
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              style={{ 
                height: '100%', 
                backgroundColor: 'white', 
                borderRadius: '10px' 
              }} 
            />
          </div>
        </div>
      )}
    </motion.div>
  );
})}
      </div>
    ) : (
      /* --- VISTA 2: MAPA DE LECCIONES DE LA UNIDAD SELECCIONADA --- */
      <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* BOTÓN VOLVER: Limpia los estados para regresar al listado */}
        <button 
          onClick={() => {
            setSelectedUnitId(null);
            setSelectedUnitTitle("");
            setPathData([]); // Limpiamos las lecciones actuales
            setHasInitialized(true); // Evita que el useEffect te meta a la fuerza a una unidad
          }} 
          style={{ 
            background: 'rgba(0,0,0,0.3)', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer', 
            marginBottom: '1rem', 
            padding: '0.5rem 1rem', 
            borderRadius: '2rem', 
            fontWeight: 'bold', 
            backdropFilter: 'blur(5px)' 
          }}
        >
          ⬅ Volver a Unidades
        </button>

        {/* CABECERA DE LA UNIDAD SELECCIONADA */}
        <div style={{ 
          background: "#58cc02", 
          padding: "1.5rem", 
          borderRadius: "1rem", 
          marginBottom: "3rem", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          position: 'relative', 
          zIndex: 10, 
          boxShadow: '0 5px 0 #46a302' 
        }}>
          <div>
            <h2 style={{ margin: 0, color: 'white' }}>{selectedUnitTitle}</h2>
          </div>
          <span style={{ fontSize: "2rem" }}>📖</span>
        </div>

        {/* CAMINO DE LECCIONES (MAPA) */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* SVG que dibuja las líneas conectoras */}
          {!isLoading && <LearningPathSVG nodeRefs={nodeRefs} pathDataLength={pathData.length} />}
          
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            style={{ width: '100%', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}
          >
            {/* Indicador de carga de nodos */}
            <p style={{ color: 'white', opacity: 0.6, fontSize: '0.8rem' }}>
              Nodos cargados: {pathData.length}
            </p>

           {pathData.map((lvl, idx) => {
  // --- AJUSTES RESPONSIVOS DINÁMICOS ---
  // Reducimos la amplitud de 120 a 50 en móviles para que no se corte
  const amplitude = isMobile ? 40 : 80; 
  const xOffset = Math.sin(idx * 0.8) * amplitude; 
  
  // Tamaño del círculo más pequeño en móvil
  const circleSize = isMobile ? 68 : 85; 

 return (
    <motion.div 
      key={`${lvl.lessonId}-${idx}`} 
      ref={(el) => { nodeRefs.current[idx] = el; }} 
      variants={nodeVariants} 
      whileHover={lvl.status !== 'LOCKED' ? { scale: 1.05 } : {}} 
      onClick={() => lvl.status !== 'LOCKED' && openLevelModal(idx)} 
      style={{ 
        marginBottom: isMobile ? '40px' : '60px', 
        transform: `translateX(${xOffset}px)`, 
        cursor: lvl.status === 'LOCKED' ? 'not-allowed' : 'pointer', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Etiqueta EMPEZAR con estilo mejorado */}
      {lvl.status === 'ACTIVE' && (
        <motion.div 
          initial={{ y: 0 }} 
          animate={{ y: -8 }} 
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }} 
          style={{ 
            position: 'absolute', 
            top: isMobile ? '-35px' : '-45px', 
            background: 'white', 
            color: '#58cc02', 
            padding: '5px 12px', 
            borderRadius: '12px', 
            fontWeight: '900', 
            fontSize: isMobile ? '0.65rem' : '0.8rem', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
            border: '2px solid #e5e5e5'
          }}
        >
          EMPEZAR
          <div style={{ 
            position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', 
            width: 0, height: 0, borderLeft: '6px solid transparent', 
            borderRight: '6px solid transparent', borderTop: '6px solid white' 
          }} />
        </motion.div>
      )}

{/* CONTENEDOR DEL NODO */}
<div style={{ position: 'relative', width: `${circleSize + 25}px`, height: `${circleSize + 25}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  
  {/* ANILLO DE PROGRESO SEGMENTADO (REQ-004) */}
  {lvl.status !== 'LOCKED' && (
    <svg 
      width={circleSize + 25} 
      height={circleSize + 25} 
      style={{ position: 'absolute', transform: 'rotate(-90deg)', zIndex: 1 }}
    >
      {(() => {
        const radius = (circleSize / 2) + 8;
        const circumference = 2 * Math.PI * radius;
        
        // 1. Usamos lessonId (que es lo que tiene tu objeto) para buscar el progreso
        const saved = localStorage.getItem(`lesson_progress_${(lvl as any).lessonId}`);
        const progressData = saved ? JSON.parse(saved) : { lastIndex: 0 };
        
        // 2. Configuración de segmentos
        const totalSegments = (lvl as any).totalQuestions || 6; 
        const gap = 8; 
        const segmentLength = (circumference / totalSegments) - gap;
        
        // 3. Lógica de color: cuántos trozos verdes dibujamos
        const activeSegments = lvl.status === 'COMPLETED' ? totalSegments : progressData.lastIndex;

        return (
          <>
            {/* Círculo Base: GRIS (Representa lo que falta o la lección vacía) */}
            <circle
              cx={(circleSize + 25) / 2}
              cy={(circleSize + 25) / 2}
              r={radius}
              fill="transparent"
              stroke="#e5e5e5" 
              strokeWidth="12" 
              strokeDasharray={`${segmentLength} ${gap}`}
            />
            
            {/* Círculo de Avance: VERDE (Se dibuja encima segmento por segmento) */}
            {activeSegments > 0 && (
              <circle
                cx={(circleSize + 25) / 2}
                cy={(circleSize + 25) / 2}
                r={radius}
                fill="transparent"
                stroke="#6691ee" 
                strokeWidth="12"
                strokeDasharray={`${segmentLength} ${gap}`}
                // El offset oculta los segmentos de la línea verde que aún no se completan
                strokeDashoffset={circumference - (activeSegments * (segmentLength + gap))}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
              />
            )}
          </>
        );
      })()}
    </svg>
  )}

  {/* BOTÓN CENTRAL (El icono de la lección) */}
  <div style={{ 
    width: `${circleSize}px`, 
    height: `${circleSize}px`, 
    borderRadius: '50%', 
    background: lvl.status === 'COMPLETED' ? '#ffc800' : (lvl.status === 'ACTIVE' ? '#58cc02' : '#e5e5e5'), 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    boxShadow: lvl.status === 'COMPLETED' ? '0 8px 0 #d9a500' : 
               lvl.status === 'ACTIVE' ? '0 8px 0 #46a302' : '0 8px 0 #afafaf', 
    border: `4px solid white`,
    zIndex: 2,
    position: 'relative'
  }}>
    <span style={{ fontSize: '2rem' }}>
       {lvl.status === 'COMPLETED' ? '✓' : lvl.icon || '⭐'}
    </span>
  </div>
</div>

      {/* Título de la Lección - Más limpio */}
      <span style={{ 
        marginTop: '10px', 
        fontWeight: '800', 
        color: lvl.status === 'LOCKED' ? '#afafaf' : currentTheme.text, 
        fontSize: isMobile ? '0.75rem' : '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {lvl.title}
      </span>
    </motion.div>
  );
})}
          </motion.div>
        </div>
      </div>
    )}
  </div>
)}
            {activeSection === "SONIDOS" && soundItems.map((c, i) => <div key={i} style={{marginBottom:'2rem', background: currentTheme.cardBg, padding:'1.5rem', borderRadius:'1rem', backdropFilter:'blur(10px)', border:`1px solid ${currentTheme.border}`}}><h3>{c.category}</h3><div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:'1rem'}}>{c.items.map((it, j)=><button key={j} onClick={()=>speak(it.name)} style={{padding:'1rem', borderRadius:'0.5rem', border:`1px solid ${currentTheme.border}`, background:currentTheme.background, color:currentTheme.text, cursor:'pointer'}}><div style={{fontSize:'1.5rem'}}>{it.icon}</div><div>{it.name}</div></button>)}</div></div>)}

            {activeSection === "GRUPOS" && (
                <div style={{ width: "100%", display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!viewingGroupId ? (
                        <>
                            <div style={{ background: currentTheme.cardBg, borderRadius: '1.5rem', border: `2px solid ${currentTheme.border}`, padding: '3rem 2rem', textAlign: 'center', backdropFilter:'blur(10px)' }}>
                                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏫</div>
                                <h2>Únete a una clase</h2>
                                <div style={{ display: 'flex', gap: '10px', justifyContent:'center' }}>
                                    <input placeholder="CÓDIGO" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} style={{ padding: '1rem', borderRadius: '1rem', textAlign: 'center', border: `2px solid ${currentTheme.border}`, width:'200px', background: currentTheme.background, color: currentTheme.text }} />
                                    <button onClick={handleJoinGroup} style={{ background: '#1cb0f6', color: 'white', border: 'none', padding: '1rem', borderRadius: '1rem' }}>UNIRSE</button>
                                </div>
                            </div>
                            <h3 style={{color: currentTheme.text, textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>Mis Clases</h3>
                            {myGroups.map(g => (
                                <div key={g.id} onClick={() => setViewingGroupId(g.id)} style={{ background: currentTheme.cardBg, border: `2px solid ${currentTheme.border}`, borderRadius: '1rem', padding: '1.5rem', cursor: 'pointer', marginBottom:'1rem', backdropFilter:'blur(10px)' }}>
                                    <h4>{g.name}</h4><p>Profesor: {g.teacherName}</p>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div style={{ background: currentTheme.cardBg, borderRadius: '1.5rem', border: `2px solid ${currentTheme.border}`, padding: '2rem', backdropFilter:'blur(10px)' }}>
                            <button onClick={() => setViewingGroupId(null)} style={{background:'none', border:'none', color:currentTheme.text, cursor:'pointer', marginBottom:'1.5rem', fontSize:'1rem'}}>⬅ Volver a Mis Clases</button>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
                                <div><h2 style={{margin:0, color:'#1cb0f6'}}>{groupDetails?.name}</h2></div>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button onClick={()=>setGroupTab('TAREAS')} style={{padding:'0.5rem', borderRadius:'1rem', background: groupTab==='TAREAS'?'#1cb0f6':'transparent', color:groupTab==='TAREAS'?'white':currentTheme.text, border:'none', cursor:'pointer'}}>Tareas</button>
                                    <button onClick={()=>setGroupTab('LIGA')} style={{padding:'0.5rem', borderRadius:'1rem', background: groupTab==='LIGA'?'#ffc800':'transparent', color:groupTab==='LIGA'?'black':currentTheme.text, border:'none', cursor:'pointer'}}>Liga 🏆</button>
                                </div>
                            </div>
                            {groupTab === 'TAREAS' ? (
                                groupDetails?.assignments?.map((a:any) => (
                                    <div key={a.id} style={{padding:'1rem', border:`1px solid ${currentTheme.border}`, borderRadius:'1rem', marginBottom:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center', background: currentTheme.background}}>
                                        <div><h4>{a.title}</h4><small>{a.description}</small></div><div style={{background:'#ffc800', color:'black', padding:'0.5rem', borderRadius:'1rem', fontWeight:'bold'}}>+{a.xpReward} XP</div>
                                    </div>
                                ))
                            ) : (
                                leaderboard.map((user, idx) => (
                                    <div key={user.userId} style={{display:'flex', alignItems:'center', padding:'1rem', marginBottom:'0.5rem', borderRadius:'1rem', background: idx<3 ? '#e5e5e5' : currentTheme.background, color: 'black'}}>
                                        <div style={{fontWeight:'bold', width:'30px'}}>#{idx+1}</div><div style={{flex:1}}>{user.fullName}</div><div>{user.xpTotal} XP</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeSection === "TIENDA" && (
                <div style={{ textAlign:'center' }}>
                    <h2 style={{marginBottom:'2rem', color: currentTheme.text}}>Tienda de Gemas 💎</h2>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}>
                        <motion.div whileHover={{y:-5}} style={{background: currentTheme.cardBg, padding:'2rem', borderRadius:'1rem', border:`2px solid ${currentTheme.border}`, backdropFilter:'blur(10px)'}}>
                            <div style={{fontSize:'4rem', marginBottom:'1rem'}}>❤️</div>
                            <h3>Rellenar Vidas</h3>
                            <p style={{color: currentTheme.text, opacity:0.8, marginBottom:'1.5rem'}}>Recupera todos tus corazones al instante.</p>
                            <button 
                                onClick={() => handlePurchase('HEART_REFILL', 50)}
                                disabled={userProfile?.heartsCount === 3}
                                style={{
                                    background: userProfile?.heartsCount === 3 ? '#e5e5e5' : '#1cb0f6',
                                    color: userProfile?.heartsCount === 3 ? '#aaa' : 'white',
                                    border:'none', padding:'1rem 2rem', borderRadius:'1rem', fontWeight:'bold', cursor: userProfile?.heartsCount === 3 ? 'not-allowed' : 'pointer',
                                    boxShadow: userProfile?.heartsCount === 3 ? 'none' : '0 4px 0 #1899d6'
                                }}
                            >
                                {userProfile?.heartsCount === 3 ? 'LLENO' : '50 💎'}
                            </button>
                        </motion.div>

                        <motion.div whileHover={{y:-5}} style={{background: currentTheme.cardBg, padding:'2rem', borderRadius:'1rem', border:`2px solid ${currentTheme.border}`, backdropFilter:'blur(10px)'}}>
                            <div style={{fontSize:'4rem', marginBottom:'1rem'}}>🛡️</div>
                            <h3>Protector de Racha</h3>
                            <p style={{color: currentTheme.text, opacity:0.8, marginBottom:'1.5rem'}}>Evita perder tu racha si olvidas practicar.</p>
                            <button 
                                onClick={() => handlePurchase('STREAK_FREEZE', 200)}
                                style={{
                                    background: '#1cb0f6', color:'white',
                                    border:'none', padding:'1rem 2rem', borderRadius:'1rem', fontWeight:'bold', cursor:'pointer',
                                    boxShadow: '0 4px 0 #1899d6'
                                }}
                            >
                                200 💎
                            </button>
                        </motion.div>
                    </div>
                </div>
            )}

            {activeSection === "CONFIGURACION" && (
                <div style={{ width: "100%", maxWidth: "500px", padding: '2rem', background: currentTheme.cardBg, borderRadius: '1rem', border: `2px solid ${currentTheme.border}`, backdropFilter:'blur(10px)', margin:'0 auto' }}>
                    <h2>Configuración</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <span>Tema</span>
                        <button onClick={toggleTheme} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>{theme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}</button>
                    </div>
                </div>
            )}

            {activeSection === "PERFIL" && <UserProfile />}
            {activeSection === "DESAFÍOS" && <Challenges />}
          
          </div>
        </main>
      </div>
      
      {/* SIDEBAR DERECHA */}
      {!isWideSection && (
        <aside style={{ width: "350px", padding: "2rem", background: currentTheme.sidebarBg, borderLeft: `2px solid ${currentTheme.border}`, flexShrink: 0 }}>
          
          {/* BARRA DE ESTADÍSTICAS */}
          {userProfile && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0.8rem', background: currentTheme.cardBg, border: `2px solid ${currentTheme.border}`, borderRadius: '1rem', alignItems: 'center' }}>
                  <div style={{display:'flex', alignItems:'center', gap:'0.2rem'}}><span style={{fontSize:'1.2rem'}}>🔥</span><span style={{color:'#ff9600', fontWeight:'bold'}}>{userProfile.currentStreak}</span></div>
                  <div style={{display:'flex', alignItems:'center', gap:'0.2rem'}}><span style={{fontSize:'1.2rem'}}>💎</span><span style={{color:'#1cb0f6', fontWeight:'bold'}}>{userProfile.lingots}</span></div>
                  <div style={{display:'flex', alignItems:'center', color:'#ff4b4b', fontSize:'1.2rem'}}>{'❤️'.repeat(userProfile.heartsCount)}</div>
                  <div style={{display:'flex', alignItems:'center', gap:'0.2rem'}}><span style={{fontSize:'1.2rem'}}>⚡</span><span style={{color:'#ffd900', fontWeight:'bold'}}>{userProfile.totalXp}</span></div>
              </div>
          )}
          
          {/* TARJETAS INFORMATIVAS */}

          <div style={{ background: currentTheme.cardBg, border: `2px solid ${currentTheme.border}`, borderRadius: "1rem", padding: "1.5rem", marginBottom:'1rem' }}>
              <h3 style={{ fontWeight: "bold", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}><span>🛡️</span> Compite en Ligas</h3>
              {(!userProfile || userProfile.totalXp === 0) ? (
                  <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '1rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
                      <p style={{ fontSize: '0.9rem', color: currentTheme.text }}>Completa una lección para desbloquear.</p>
                  </div>
              ) : (
                  <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '1rem', opacity: 0.8 }}>Top global:</p>
                      {globalLeague.map((user, idx) => (
                          <div key={user.userId} style={{ display:'flex', alignItems:'center', padding:'0.6rem 0', borderBottom: idx < 4 ? `1px solid ${currentTheme.border}` : 'none' }}>
                              <div style={{ fontWeight:'bold', marginRight:'10px', width:'20px', color: idx===0?'#eab308': currentTheme.text }}>#{idx + 1}</div>
                              <div style={{ flex:1, fontSize:'0.95rem' }}>{user.fullName}</div>
                              <div style={{ fontWeight:'bold', fontSize:'0.85rem', color:'#58cc02' }}>{user.xpTotal} XP</div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {cards.filter(c => c.title !== "Compite en Ligas").map((card, i) => (
            <div key={i} style={{ background: currentTheme.cardBg, border: `2px solid ${currentTheme.border}`, borderRadius: "1rem", padding: "1.5rem", marginBottom:'1rem' }}>
              <h3>{card.icon} {card.title}</h3><p>{card.description}</p>
            </div>
          ))}
        </aside>
      )}

      {/* --- MODAL DE LOGOUT --- */}
      <AnimatePresence>
        {showLogoutModal && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}
            >
                <motion.div 
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                    style={{ 
                        background: currentTheme.cardBg, padding: '2rem', borderRadius: '1rem', 
                        border: `2px solid ${currentTheme.border}`, width: '300px', textAlign: 'center' 
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
                    <h2 style={{ marginBottom: '1rem', color: currentTheme.text }}>¿Cerrar Sesión?</h2>
                    <p style={{ color: currentTheme.text, opacity: 0.7, marginBottom: '2rem' }}>
                        ¡Te esperamos pronto para seguir aprendiendo!
                    </p>
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

    {/* Al final de tu return en StudentDashboard */}
{/* Busca este bloque al final de tu StudentDashboard */}
<AnimatePresence>
  {showQuizModal && (
    <QuizModal
      questions={quizQuestions}
      lessonId={activeLessonId || ""}
      // MODIFICADO: Añadimos confirmación para no perder progreso accidentalmente
      onClose={() => {
        if (window.confirm("¿Estás seguro de que quieres salir? Perderás el progreso de esta lección.")) {
          setShowQuizModal(false);
        }
      }}
      onComplete={(count) => handleQuizComplete(activeLessonId!, count)}
    />
  )}
</AnimatePresence>
    </div>
  );
}