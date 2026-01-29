import React, { useState } from "react";
import { 
  UnitWithLessons, 
  UserProfileData, 
  getLessonQuestions, 
  QuestionDTO,
} from "../../api/auth.service";
import { QuizModal } from "../../Components/QuizModal";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface LearnSectionProps {
  units: UnitWithLessons[];
  userProfile: UserProfileData;
  heartTimer: string;
  onUpdateProfile: (profile: UserProfileData) => void;
    onRefreshData: (isSilent?: boolean) => Promise<UserProfileData>; 
}

export const LearnSection: React.FC<LearnSectionProps> = ({ 
  units, 
  userProfile, 
  heartTimer, 
  onUpdateProfile,
  onRefreshData 
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitWithLessons | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({ score: 0, total: 0, isUnitDone: false });

  // --- LÓGICA DE COLORES VARIADOS ---
  const getBarColor = (percentage: number) => {
    if (percentage === 0) return "#E5E5E5"; // Vacío (Gris)
    if (percentage === 100) return "#58CC02"; // COMPLETADO (Verde Duolingo)
    if (percentage < 25) return "#FF4B4B";    // Muy poco (Rojo)
    if (percentage < 50) return "#FF9600";    // Progreso inicial (Naranja)
    if (percentage < 75) return "#FFC800";    // Mitad (Amarillo)
    return "#1CB0F6";                         // Casi terminado (Azul)
  };

  const handleOpenLesson = async (lessonId: string) => {
    try {
      const q = await getLessonQuestions(lessonId);
      setQuestions(q);
      setSelectedLessonId(lessonId);
      setIsQuizOpen(true);
    } catch (error) {
      console.error("Error al cargar preguntas:", error);
    }
  };

  const handleCloseQuiz = async (completed: boolean, score: number, total: number) => {
    setIsQuizOpen(false);
    
    // Si no se completó, refrescamos los datos por si perdió corazones y salimos
    if (!completed || !selectedUnit || !selectedLessonId) {
      setSelectedLessonId(null);
      await onRefreshData(true); 
      return;
    }

    try {
      const wasUnitAlreadyDone = selectedUnit.lessons.every(l => l.isCompleted);
      const updatedLessons = selectedUnit.lessons.map((lesson) =>
        lesson.id === selectedLessonId ? { ...lesson, isCompleted: true } : lesson
      );

      const isUnitDoneNow = updatedLessons.every(l => l.isCompleted);
      const shouldShowUnitSummary = isUnitDoneNow && !wasUnitAlreadyDone;

      setSummaryData({ score, total, isUnitDone: shouldShowUnitSummary });
      setShowSummary(true);

      if (shouldShowUnitSummary) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#58CC02', '#1CB0F6', '#FFC800']
        });
      }

      setSelectedUnit({ ...selectedUnit, lessons: updatedLessons });
      setSelectedLessonId(null);

      // ✅ CORRECCIÓN: Forzamos el refresco para actualizar Diamantes, XP y Racha
      await onRefreshData(true);
      
    } catch (error) {
      console.error("Error al procesar cierre:", error);
      setSelectedLessonId(null);
    }
  };

  if (!selectedUnit) {
    return (
      <div style={{ width: "100%", maxWidth: "650px", padding: "20px", margin: "0 auto" }}>
        {[...units].sort((a, b) => a.unitOrder - b.unitOrder).map((unit, index, arr) => {
          const isLocked = index === 0 ? false : !arr[index - 1].lessons.every(l => l.isCompleted);
          const completedCount = unit.lessons?.filter(l => l.isCompleted).length || 0;
          const totalCount = unit.lessons?.length || 1;
          const progressPercentage = Math.round((completedCount / totalCount) * 100);

          return (
            <motion.div 
              key={unit.id} 
              whileHover={!isLocked ? { scale: 1.02, translateY: -2 } : {}}
              style={{
                backgroundColor: isLocked ? "#F5F5F5" : "white",
                padding: "25px",
                borderRadius: "24px", 
                border: "2px solid #E5E5E5", 
                borderBottomWidth: "6px",
                marginBottom: "24px", 
                opacity: isLocked ? 0.8 : 1, 
                cursor: isLocked ? "not-allowed" : "pointer",
                position: "relative",
                transition: "all 0.2s ease"
              }}
              onClick={() => !isLocked && setSelectedUnit(unit)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "#3C3C3C", fontWeight: 900, fontSize: "20px" }}>
                  {isLocked ? "🔒 " : ""}{unit.title}
                </h3>
                {!isLocked && (
                  <span style={{ 
                    color: getBarColor(progressPercentage), 
                    fontWeight: 900, 
                    fontSize: "18px" 
                  }}>
                    {progressPercentage}%
                  </span>
                )}
              </div>

              {/* BARRA CON COLORES DINÁMICOS */}
              <div style={{ width: "100%", height: "18px", backgroundColor: "#E5E5E5", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ 
                    height: "100%", 
                    backgroundColor: getBarColor(progressPercentage), 
                    borderRadius: "12px",
                    position: "relative"
                  }} 
                >
                  {/* Brillo 3D */}
                  {progressPercentage > 3 && (
                    <div style={{ position: "absolute", top: "3px", left: "6px", right: "6px", height: "4px", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "10px" }} />
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "white" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "white", borderBottom: "2px solid #E5E5E5", padding: "15px 20px", display: "flex", alignItems: "center", gap: "20px" }}>
          <button 
            onClick={() => setSelectedUnit(null)} 
            style={{ background: "#E5E5E5", border: "none", color: "#4B4B4B", cursor: "pointer", fontWeight: "900", padding: "10px 18px", borderRadius: "15px" }}
          >
            VOLVER
          </button>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#3C3C3C" }}>{selectedUnit.title}</h2>
      </div>

      <div style={{ padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "50px" }}>
        {selectedUnit.lessons.map((lesson, idx) => {
          const isLocked = idx === 0 ? false : !selectedUnit.lessons[idx - 1].isCompleted;
          const offsetZigZag = Math.sin(idx * 1.3) * 75;
          const bgColor = isLocked ? "#E5E5E5" : (lesson.isCompleted ? "#58CC02" : "#1CB0F6"); // Verde si está hecha, azul si es la actual
          const borderColor = isLocked ? "#BDBDBD" : (lesson.isCompleted ? "#46A302" : "#1899D6");

          return (
            <div key={lesson.id} style={{ transform: `translateX(${offsetZigZag}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button
                disabled={isLocked}
                onClick={() => handleOpenLesson(lesson.id)}
                style={{
                  width: 85, height: 78, borderRadius: "50%",
                  backgroundColor: bgColor, border: "none", borderBottom: `8px solid ${borderColor}`,
                  color: "white", fontSize: "28px", fontWeight: "bold", cursor: isLocked ? "not-allowed" : "pointer"
                }}
              >
                {isLocked ? "🔒" : (lesson.isCompleted ? "✓" : idx + 1)}
              </button>
              <span style={{ marginTop: "10px", fontWeight: "800", color: isLocked ? "#AFAFAF" : "#4B4B4B" }}>
                  {lesson.title}
              </span>
            </div>
          );
        })}
      </div>

      {isQuizOpen && selectedLessonId && (
     <QuizModal 
  isOpen={isQuizOpen}
  questions={questions}
  lessonId={selectedLessonId}
  userProfile={userProfile}
  heartTimer={heartTimer}
  onClose={handleCloseQuiz}
/>

      )}

      {/* MODAL RESUMEN */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={summaryCardStyle}>
              <h1 style={{ color: "#58CC02", fontSize: "28px", fontWeight: 900 }}>¡BUEN TRABAJO!</h1>
              <div style={{ display: "flex", gap: "15px", margin: "25px 0" }}>
                <div style={{ background: "#FFC800", padding: "15px", borderRadius: "18px", flex: 1, color: "white" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>ACIERTOS</div>
                  <div style={{ fontSize: "22px", fontWeight: 900 }}>{summaryData.score}</div>
                </div>
                <div style={{ background: "#1CB0F6", padding: "15px", borderRadius: "18px", flex: 1, color: "white" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>TOTAL</div>
                  <div style={{ fontSize: "22px", fontWeight: 900 }}>{summaryData.total}</div>
                </div>
              </div>
              <button onClick={() => setShowSummary(false)} style={continueBtnStyle}>CONTINUAR</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.95)", zIndex: 6000, display: "flex", justifyContent: "center", alignItems: "center" };
const summaryCardStyle: React.CSSProperties = { textAlign: "center", maxWidth: "400px", width: "90%", padding: "30px", border: "2px solid #E5E5E5", borderRadius: "24px", background: "white" };
const continueBtnStyle: React.CSSProperties = { width: "100%", background: "#58CC02", color: "white", border: "none", padding: "15px", borderRadius: "16px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 5px 0 #46A302" };