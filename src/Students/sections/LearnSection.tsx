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
  onRefreshData: (isSilent?: boolean) => Promise<void>; 
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

  // ESTADOS PARA EL RESUMEN FINAL
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({ score: 0, total: 0, isUnitDone: false });

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

    if (!completed || !selectedUnit || !selectedLessonId) {
      setSelectedLessonId(null);
      return;
    }

    try {
      // 1. Detectar si la unidad ya estaba terminada antes
      const wasUnitAlreadyDone = selectedUnit.lessons.every(l => l.isCompleted);

      // 2. Actualizar estado local
      const updatedLessons = selectedUnit.lessons.map((lesson) =>
        lesson.id === selectedLessonId ? { ...lesson, isCompleted: true } : lesson
      );

      // 3. Detectar si se completa la unidad justo ahora
      const isUnitDoneNow = updatedLessons.every(l => l.isCompleted);
      const shouldShowUnitSummary = isUnitDoneNow && !wasUnitAlreadyDone;

      setSummaryData({ 
        score, 
        total, 
        isUnitDone: shouldShowUnitSummary 
      });

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
      await onRefreshData(true);

    } catch (error) {
      console.error("Error al procesar cierre:", error);
      setSelectedLessonId(null);
    }
  };

  // --- VISTA 1: LISTA DE UNIDADES CON BARRA DE PROGRESO ---
  if (!selectedUnit) {
    return (
      <div style={{ width: "100%", maxWidth: "650px", padding: "20px", margin: "0 auto" }}>
        {[...units].sort((a, b) => a.unitOrder - b.unitOrder).map((unit, index, arr) => {
          const isLocked = index === 0 ? false : !arr[index - 1].lessons.every(l => l.isCompleted);
          
          const completedCount = unit.lessons?.filter(l => l.isCompleted).length || 0;
          const totalCount = unit.lessons?.length || 1;
          const progressPercentage = (completedCount / totalCount) * 100;

          return (
            <motion.div 
              key={unit.id} 
              whileHover={!isLocked ? { scale: 1.01 } : {}}
              whileTap={!isLocked ? { scale: 0.99 } : {}}
              style={{
                backgroundColor: isLocked ? "#F5F5F5" : "white",
                padding: "30px 25px",
                borderRadius: "20px", 
                border: `2px solid #E5E5E5`, 
                borderBottomWidth: "5px",
                marginBottom: "20px", 
                opacity: isLocked ? 0.7 : 1, 
                cursor: isLocked ? "not-allowed" : "pointer",
              }}
              onClick={() => !isLocked && setSelectedUnit(unit)}
            >
                <h3 style={{ margin: "0 0 20px 0", color: "#3C3C3C", fontWeight: 800, fontSize: "22px" }}>
                  {isLocked ? "🔒 " : ""}{unit.title}
                </h3>

                {/* BARRA DE PROGRESO LIMPIA */}
                <div style={{ width: "100%", height: "16px", backgroundColor: "#E5E5E5", borderRadius: "12px", overflow: "hidden" }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ 
                      height: "100%", 
                      backgroundColor: progressPercentage === 100 ? "#FFD700" : "#58CC02", 
                      borderRadius: "12px" 
                    }} 
                  />
                </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // --- VISTA 2: RUTA DE LECCIONES (ZIG-ZAG) ---
  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "#1CB0F6", padding: "15px 20px", color: "white", display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={() => setSelectedUnit(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", fontWeight: "bold", padding: "8px 15px", borderRadius: "12px" }}>← VOLVER</button>
          <h2 style={{ margin: 0, fontSize: "20px" }}>{selectedUnit.title}</h2>
      </div>

      <div style={{ padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "60px" }}>
        {selectedUnit.lessons.map((lesson, idx) => {
          const isLocked = idx === 0 ? false : !selectedUnit.lessons[idx - 1].isCompleted;
          const offsetZigZag = Math.sin(idx * 1.5) * 80;
          const bgColor = isLocked ? "#E5E5E5" : (lesson.isCompleted ? "#FFD700" : "#58CC02");
          const borderColor = isLocked ? "#BDBDBD" : (lesson.isCompleted ? "#E5C100" : "#46A302");

          return (
            <div key={lesson.id} style={{ transform: `translateX(${offsetZigZag}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button
                disabled={isLocked}
                onClick={() => handleOpenLesson(lesson.id)}
                style={{
                  width: 85, height: 80, borderRadius: "50%",
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
          isOpen={isQuizOpen} questions={questions} lessonId={selectedLessonId} 
          userProfile={userProfile} heartTimer={heartTimer} 
          onUpdateProfile={onUpdateProfile} 
          onClose={(completed: boolean, score: number, total: number) => handleCloseQuiz(completed, score, total)} 
        />
      )}

      {/* --- MODAL DE RESUMEN --- */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={summaryCardStyle}>
              <h1 style={{ color: "#58CC02", fontSize: "28px", fontWeight: 900 }}>
                {summaryData.isUnitDone ? "¡UNIDAD SUPERADA! 🏆" : "¡LECCIÓN COMPLETADA! ✨"}
              </h1>
              
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

              {/* LISTA DE LECCIONES SOLO EN FIN DE UNIDAD */}
              {summaryData.isUnitDone && (
                <div style={{ background: "#F7F7F7", padding: "15px", borderRadius: "15px", marginBottom: "20px", textAlign: "left", border: "1px solid #EEE" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#4B4B4B" }}>Resumen:</h4>
                  {selectedUnit?.lessons.map((l, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "#666", display: "flex", justifyContent: "space-between" }}>
                      <span>Lección {i+1}</span> <span style={{ color: "#58CC02" }}>✓</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setShowSummary(false)} style={continueBtnStyle}>
                CONTINUAR
              </button>
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