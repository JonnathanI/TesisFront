import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMPORTS DE COMPONENTES PROPIOS ---
import LearningPathSVG from '../Components/LearningPathSVG'; 
import { QuizModal } from '../Components/QuizModal'; 
import UserProfile from './UserProfile'; 
import Challenges from './Challenges'; // <--- Asegúrate de haber creado este archivo en el paso anterior

// --- IMPORTS DE API ---
import {
  getUnitProgress,
  getLessonQuestions,
  completeLesson,
  LessonProgressDTO,
  QuestionDTO
} from '../api/auth.service'; 

// --- ESTADO INTERNO DEL NODO ---
type PathNodeStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

interface PathNode {
  type: 'lesson' | 'checkpoint';
  icon: string;
  title: string;
  color: string;
  lessonId: string;
  status: PathNodeStatus;
}

// --- DATOS ESTÁTICOS (Barras laterales) ---
const sidebarNavItems = [
  { label: "APRENDER", icon: "🏠", description: "Comienza tus lecciones" },
  { label: "SONIDOS", icon: "👄", description: "Practica pronunciación" },
  { label: "DESAFÍOS", icon: "🏆", description: "Retos diarios" },
  { label: "TIENDA", icon: "🛍️", description: "Compra recompensas" },
  { label: "PERFIL", icon: "👤", description: "Configura tu perfil" },
  { label: "MÁS", icon: "⋯", description: "Opciones adicionales" },
];

const cards = [
  { title: "Compite en Ligas", icon: "🛡️", description: "Completa lecciones y gana puntos" },
  { title: "Desafíos Diarios", icon: "⚡", description: "Gana XP completando retos diarios" },
  { title: "Crea tu Perfil", icon: "👤", description: "Guarda tu progreso y personaliza tu avatar" },
];

const soundItems = [
    { category: "Letras", items: [{ icon: "🅰️", name: "A" }, { icon: "🅱️", name: "B" }, { icon: "🇨", name: "C" }]},
    { category: "Animales", items: [{ icon: "🐶", name: "Dog" }, { icon: "🐱", name: "Cat" }, { icon: "🐦", name: "Bird" }]},
    { category: "Frutas", items: [{ icon: "🍎", name: "Apple" }, { icon: "🍌", name: "Banana" }, { icon: "🍓", name: "Strawberry"}]},
];

// --- FUNCIONES HELPER ---

const getIconForTitle = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('repaso')) return '🏆';
  if (lowerTitle.includes('intro') || lowerTitle.includes('saludos') || lowerTitle.includes('hola')) return '👋';
  if (lowerTitle.includes('familia')) return '👨‍👩‍👧';
  if (lowerTitle.includes('comida') || lowerTitle.includes('food')) return '🍔';
  if (lowerTitle.includes('gramática')) return '📖';
  if (lowerTitle.includes('viajes') || lowerTitle.includes('travel') || lowerTitle.includes('despedidas')) return '✈️';
  if (lowerTitle.includes('ropa') || lowerTitle.includes('clothes')) return '👕';
  if (lowerTitle.includes('frutas') || lowerTitle.includes('fruits')) return '🍎';
  return '📚';
};

const getColorForStatus = (status: PathNodeStatus): string => {
  if (status === 'COMPLETED') return '#ffc800'; // Dorado/Amarillo
  if (status === 'ACTIVE') return '#58cc02';    // Verde brillante
  return '#e5e5e5';                             // Gris claro
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function StudentDashboard() {
  
  // Estado del Camino
  const [pathData, setPathData] = useState<PathNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado del Quiz
  const [quizQuestions, setQuizQuestions] = useState<QuestionDTO[] | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Estado de Navegación
  const [activeSection, setActiveSection] = useState("APRENDER");
  
  // Refs
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]); 

  // --- CARGAR DATOS DEL CAMINO ---
  const fetchPathData = async () => {
    // ID DE LA UNIDAD (Verificado en tu DB)
    const currentUnitId = "5a3200e1-8184-4191-9237-cfc13ed4826b"; 

    setIsLoading(true);
    try {
      const progressDTOs = await getUnitProgress(currentUnitId);

      let foundActive = false;
      const newPathData = progressDTOs.map((dto): PathNode => {
        
        let status: PathNodeStatus;
        if (dto.isCompleted) {
          status = 'COMPLETED';
        } else if (!foundActive) {
          status = 'ACTIVE';
          foundActive = true; 
        } else {
          status = 'LOCKED';
        }

        const type = dto.title.toLowerCase().includes('repaso') ? 'checkpoint' : 'lesson';
        const icon = getIconForTitle(dto.title);
        const color = getColorForStatus(status);

        return {
          type: type,
          icon: icon,
          title: dto.title,
          lessonId: dto.id, 
          status: status,
          color: color 
        };
      });

      setPathData(newPathData);
      
    } catch (error) {
      console.error("Error al cargar el camino:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "APRENDER") {
      fetchPathData();
    }
  }, [activeSection]); 

  // --- LÓGICA DEL QUIZ ---

  const startLesson = async (lessonId: string) => {
    setActiveLessonId(lessonId);    
    setQuizQuestions(null);         
    setShowQuizModal(true);         
    
    try {
      const questions = await getLessonQuestions(lessonId);
      
      if (!questions || questions.length === 0) {
         alert("Esta lección aún no tiene preguntas asignadas en la base de datos.");
         setShowQuizModal(false);
         return;
      }

      setQuizQuestions(questions); 
    } catch (error) {
      console.error("Error al cargar preguntas:", error);
      alert("Error de conexión al cargar la lección.");
      setShowQuizModal(false); 
    }
  };

  const handleQuizComplete = async (lessonId: string, correctCount: number) => {
    try {
      await completeLesson(lessonId, correctCount);
    } catch (error) {
      console.error("Error al completar la lección:", error);
    } finally {
      setShowQuizModal(false);
      setQuizQuestions(null);
      await fetchPathData(); // Recargar progreso
    }
  };

  const openLevelModal = (levelIndex: number) => {
    const selectedNode = pathData[levelIndex];

    if (selectedNode.status === 'LOCKED') {
      return; 
    }

    if (selectedNode.type === 'lesson') {
      // Permitir repasar si ya está completada
      if (selectedNode.status === 'COMPLETED') {
        const confirmRepaso = window.confirm(`Ya completaste "${selectedNode.title}". ¿Quieres practicar de nuevo?`);
        if (!confirmRepaso) return;
      }
      startLesson(selectedNode.lessonId);

    } else if (selectedNode.type === 'checkpoint') {
      alert("¡Desafío de Repaso! (Próximamente)");
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // Helper para saber si una sección requiere ancho completo (ocultando sidebar derecha)
  const isWideSection = activeSection === "PERFIL" || activeSection === "DESAFÍOS";

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <motion.div style={{ 
      height: "100vh", 
      background: "#131f24", 
      color: "white", 
      fontFamily: "'DIN Round', 'Nunito', sans-serif", 
      display: "flex",
      overflow: "hidden" 
    }}>
      
      <style>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
      
      {/* ===== SIDEBAR IZQUIERDA (NAVEGACIÓN) ===== */}
      <aside style={{ 
        width: "260px", 
        borderRight: "2px solid #2c363a", 
        padding: "1.5rem", 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.5rem",
        background: "#131f24",
        zIndex: 10,
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#58cc02", marginBottom: "1.5rem", paddingLeft: "1rem" }}>Peek</h1>
        {sidebarNavItems.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            onClick={() => setActiveSection(item.label)}
            style={{
              display: "flex", alignItems: "center", gap: "1.2rem",
              padding: "0.8rem 1rem", borderRadius: "0.8rem", cursor: "pointer",
              backgroundColor: activeSection === item.label ? "rgba(28, 176, 246, 0.15)" : "transparent",
              border: activeSection === item.label ? "2px solid #1cb0f6" : "2px solid transparent",
              color: activeSection === item.label ? "#1cb0f6" : "#777"
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.8px", textTransform: "uppercase" }}>{item.label}</span>
          </motion.div>
        ))}
      </aside>

      {/* ===== ÁREA CENTRAL (SCROLLEABLE) ===== */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", overflowY: "auto" }}>
        
        <main style={{ 
          // Lógica de diseño responsivo
          flexGrow: isWideSection ? 0 : 1, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          minWidth: isWideSection ? "auto" : "400px", 
          width: isWideSection ? "100%" : "100%", 
          maxWidth: isWideSection ? "1000px" : "600px", 
          padding: "2rem 1rem",
        }}>
          
          {/* 1. SECCIÓN APRENDER */}
          {activeSection === "APRENDER" && (
            <div style={{ position: 'relative', minHeight: '100%', width: '100%' }}>
              {/* Encabezado de Unidad */}
              <div style={{ 
                background: "#58cc02", padding: "1.5rem", borderRadius: "1rem", marginBottom: "3rem", 
                display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 5px 0 #46a302",
                width: "100%"
              }}>
                <div>
                   <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Unidad 1</h2>
                   <p style={{ margin: 0, opacity: 0.9 }}>Saludos y frases básicas</p>
                </div>
                <span style={{ fontSize: "2rem" }}>📖</span>
              </div>

              {isLoading ? (
                <p style={{textAlign: 'center', color: '#777'}}>Cargando tu camino...</p>
              ) : (
                <>
                  <LearningPathSVG nodeRefs={nodeRefs} pathDataLength={pathData.length} />

                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', 
                    position: 'relative', zIndex: 2, 
                    paddingLeft: '80px', paddingRight: '80px',
                  }}>
                    {pathData.map((lvl, idx) => {
                      const isCurrent = lvl.status === 'ACTIVE'; 
                      const isCompleted = lvl.status === 'COMPLETED';
                      const isLocked = lvl.status === 'LOCKED';
                      const isEven = idx % 2 === 0;

                      let displayIcon = lvl.icon;
                      if (isCompleted) displayIcon = '✓'; 
                      
                      const isCheckpoint = lvl.type === 'checkpoint';
                      const nodeSize = isCheckpoint ? '80px' : '75px'; 
                      const borderRadius = isCheckpoint ? '1.2rem' : '50%';
                      const fontSize = isCheckpoint ? '2.5rem' : '2.2rem';

                      const nodeBg = isCompleted ? '#ffc800' : (isCurrent ? '#58cc02' : '#e5e5e5');
                      const nodeShadow = isCompleted ? '#e5b400' : (isCurrent ? '#46a302' : '#afafaf');
                      const iconColor = isLocked ? '#afafaf' : 'white';

                      return (
                        <motion.div
                          key={lvl.lessonId}
                          ref={(el) => { nodeRefs.current[idx] = el; }} 
                          whileHover={{ scale: isLocked ? 1 : 1.05 }}
                          whileTap={{ scale: isLocked ? 1 : 0.95 }}
                          onClick={() => openLevelModal(idx)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                            alignSelf: isEven ? 'flex-start' : 'flex-end', 
                            marginBottom: '60px', 
                            marginLeft: isEven ? '0px' : '50px', 
                            marginRight: isEven ? '50px' : '0px', 
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <div style={{ position: 'relative' }}>
                            <motion.div style={{
                              width: nodeSize, height: nodeSize, borderRadius: borderRadius,
                              display: "flex", justifyContent: "center", alignItems: "center",
                              fontSize: fontSize, color: iconColor,
                              background: nodeBg,
                              boxShadow: `0 6px 0 ${nodeShadow}`,
                              zIndex: 2, position: 'relative'
                            }}>
                              {displayIcon}
                            </motion.div>

                            {isCurrent && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                  position: 'absolute', left: '50%', top: '-50px', 
                                  transform: 'translateX(-50%)',
                                  background: 'white', color: '#58cc02', 
                                  padding: '0.6rem 1rem', borderRadius: '0.8rem', fontWeight: '800', 
                                  textTransform: 'uppercase', fontSize: '0.9rem',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
                                  border: '2px solid #e5e5e5', zIndex: 10
                                }}
                              >
                                EMPEZAR
                                <div style={{
                                  position: 'absolute', bottom: '-8px', left: '50%', marginLeft: '-8px',
                                  width: 0, height: 0, borderLeft: '8px solid transparent', 
                                  borderRight: '8px solid transparent', borderTop: '8px solid white'
                                }}></div>
                              </motion.div>
                            )}
                          </div>
                          
                          <span style={{ marginTop: "10px", fontWeight: "bold", color: isLocked ? '#777' : 'white', fontSize: '0.9rem' }}>
                            {lvl.title}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* 2. SECCIÓN SONIDOS */}
          {activeSection === "SONIDOS" && (
            <div style={{ textAlign: "center", width: "100%" }}>
              <h2 style={{ color: "#00FFC2", fontSize: "1.8rem", marginBottom: "1.5rem" }}>🎧 Práctica de Sonidos</h2>
              {soundItems.map((category, idx) => (
                <div key={idx} style={{ marginBottom: "2.5rem" }}>
                  <h3 style={{ marginBottom: "1rem", color: "#fff", fontSize: "1.3rem", fontWeight: 600 }}>{category.category}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1.5rem", justifyItems: "center" }}>
                    {category.items.map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        onClick={() => speak(item.name)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          background: "#1c262b", border: "2px solid #2c363a", color: "#fff",
                          borderRadius: "1rem", width: "100%", height: "140px",
                          fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 0 #2c363a",
                          padding: "1rem",
                        }}
                      >
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{item.icon}</div>
                        <p style={{ fontSize: "1rem", margin: 0 }}>{item.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. SECCIÓN PERFIL */}
          {activeSection === "PERFIL" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <UserProfile />
            </div>
          )}

          {/* 4. SECCIÓN DESAFÍOS (¡NUEVO COMPONENTE INTEGRADO!) */}
          {activeSection === "DESAFÍOS" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Challenges />
            </div>
          )}

          {/* 5. SECCIÓN TIENDA */}
          {activeSection === "TIENDA" && (
            <div style={{ textAlign: "center", padding: "4rem", color: "#777" }}>
              <h2 style={{ color: "white" }}>Tienda</h2>
              <p>Usa tus Lingots aquí.</p>
            </div>
          )}

          {/* 6. SECCIÓN MÁS */}
          {activeSection === "MÁS" && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <h2 style={{ color: "#00FFC2" }}>Más Opciones</h2>
              <p>Configuración y ayuda.</p>
            </div>
          )}

        </main>
      </div>

      {/* ===== SIDEBAR DERECHA ===== */}
      {/* Se oculta en secciones anchas (PERFIL y DESAFÍOS) */}
      {!isWideSection && (
        <aside style={{ 
          width: "350px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem",
          borderLeft: "2px solid #2c363a", background: "#131f24", flexShrink: 0 
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{ background: "#131f24", border: "2px solid #2c363a", borderRadius: "1rem", padding: "1.5rem" }}>
              <h3 style={{ fontWeight: "bold", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{card.icon}</span> {card.title}
              </h3>
              <p style={{ color: "#777", fontSize: "0.9rem", lineHeight: "1.4" }}>{card.description}</p>
            </div>
          ))}
        </aside>
      )}

      {/* ===== MODAL DEL QUIZ ===== */}
      <AnimatePresence>
        {showQuizModal && activeLessonId && (
          <QuizModal 
            questions={quizQuestions}
            lessonId={activeLessonId}
            onClose={() => setShowQuizModal(false)}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}