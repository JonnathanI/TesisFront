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

  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({ 
    score: 0, 
    total: 0, 
    isUnitDone: false,
    xpEarned: 0,
    gemsEarned: 0 
  });

  // PRECISIÓN CALCULADA DINÁMICAMENTE
  const accuracy = summaryData.total > 0 ? Math.round((summaryData.score / summaryData.total) * 100) : 0;

  const handleOpenLesson = async (lessonId: string) => {
    if (userProfile.heartsCount === 0) {
      alert("¡No tienes vidas! Espera a que se recarguen.");
      return;
    }
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
      const wasUnitAlreadyDone = selectedUnit.lessons.every(l => l.isCompleted);
      const updatedLessons = selectedUnit.lessons.map((lesson) =>
        lesson.id === selectedLessonId ? { ...lesson, isCompleted: true } : lesson
      );

      const isUnitDoneNow = updatedLessons.every(l => l.isCompleted);
      const shouldShowUnitSummary = isUnitDoneNow && !wasUnitAlreadyDone;

      const xp = score * 15; 
      const gems = shouldShowUnitSummary ? 100 : 20; 

      setSummaryData({ 
        score, total, isUnitDone: shouldShowUnitSummary, xpEarned: xp, gemsEarned: gems
      });

      // ACTUALIZAR PERFIL (Solución error TS de tus imágenes)
      const currentXP = (userProfile as any).xp || 0;
      const currentGems = (userProfile as any).gems || 0;

      onUpdateProfile({
        ...userProfile,
        xp: currentXP + xp,
        gems: currentGems + gems
      } as any);

      setShowSummary(true);

      if (score === total) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }

      setSelectedUnit({ ...selectedUnit, lessons: updatedLessons });
      setSelectedLessonId(null);
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

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      {/* HEADER STICKY */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "#1CB0F6", padding: "15px 20px", color: "white", display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={() => setSelectedUnit(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", fontWeight: "bold", padding: "8px 15px", borderRadius: "12px" }}>← VOLVER</button>
          <h2 style={{ margin: 0, fontSize: "20px" }}>{selectedUnit.title}</h2>
      </div>

      {/* RUTA DE LECCIONES */}
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
          isOpen={isQuizOpen} questions={questions} 
          userProfile={userProfile} onUpdateProfile={onUpdateProfile} 
          onClose={handleCloseQuiz} 
        />
      )}

      {/* MODAL DE RESUMEN CON PRECISIÓN REAL */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle}>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              style={summaryCardStyle}
            >
              <h1 style={{ color: "#3C3C3C", fontSize: "28px", fontWeight: 900, marginBottom: "10px" }}>
                {summaryData.isUnitDone ? "¡UNIDAD COMPLETADA! 🏆" : "¡LECCIÓN TERMINADA! ✨"}
              </h1>
              
              <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "30px 0" }}>
                <div style={{ ...badgeBase, background: "#FFD700" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>PUNTOS XP</div>
                  <div style={{ fontSize: "32px", fontWeight: 900 }}>+{summaryData.xpEarned}</div>
                </div>
                <div style={{ ...badgeBase, background: "#1CB0F6" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>GEMAS</div>
                  <div style={{ fontSize: "32px", fontWeight: 900 }}>+{summaryData.gemsEarned}</div>
                </div>
              </div>

              {/* AQUÍ SE MUESTRA LA PRECISIÓN REAL CORREGIDA */}
              <div style={{ marginBottom: "30px", fontSize: "20px", fontWeight: "800", color: "#4B4B4B" }}>
                Precisión: <span style={{ color: "#58CC02" }}>{accuracy}%</span> ({summaryData.score}/{summaryData.total})
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSummary(false)} 
                style={continueBtnStyle}
              >
                CONTINUAR
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ESTILOS ---
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.98)", zIndex: 6000, display: "flex", justifyContent: "center", alignItems: "center" };
const summaryCardStyle: React.CSSProperties = { textAlign: "center", maxWidth: "450px", width: "92%", padding: "50px 30px", border: "2px solid #E5E5E5", borderRadius: "35px", background: "white", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" };
const badgeBase: React.CSSProperties = { flex: 1, padding: "20px 10px", borderRadius: "25px", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const continueBtnStyle: React.CSSProperties = { width: "100%", background: "#58CC02", color: "white", border: "none", padding: "20px", borderRadius: "20px", fontSize: "20px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 6px 0 #46A302" };