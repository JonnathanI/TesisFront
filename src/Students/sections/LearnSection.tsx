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
      // 1. Detectar si la unidad ya estaba terminada antes de este intento
      const wasUnitAlreadyDone = selectedUnit.lessons.every(l => l.isCompleted);

      // 2. Actualizar el estado local de las lecciones
      const updatedLessons = selectedUnit.lessons.map((lesson) =>
        lesson.id === selectedLessonId ? { ...lesson, isCompleted: true } : lesson
      );

      // 3. Detectar si la unidad está completa ahora
      const isUnitDoneNow = updatedLessons.every(l => l.isCompleted);

      // Lógica de distinción: Solo mostramos "Unidad Superada" si es la primera vez que la completa
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

      // Actualizar vista y sincronizar con servidor
      setSelectedUnit({ ...selectedUnit, lessons: updatedLessons });
      setSelectedLessonId(null);
      await onRefreshData(true);

    } catch (error) {
      console.error("Error al procesar cierre:", error);
      setSelectedLessonId(null);
    }
  };

  const LessonNode = ({ lesson, index, isLocked }: { lesson: any; index: number; isLocked: boolean }) => {
    const radius = 55; 
    const offsetZigZag = Math.sin(index * 1.5) * 80;
    const bgColor = isLocked ? "#BDBDBD" : (lesson.isCompleted ? "#FFD700" : "#58CC02");
    const borderColor = isLocked ? "#9E9E9E" : (lesson.isCompleted ? "#E5C100" : "#46A302");

    return (
      <div style={{ 
        transform: `translateX(${offsetZigZag}px)`, 
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: isLocked ? 0.6 : 1,
        pointerEvents: isLocked ? "none" : "auto"
      }}>
        <div 
          style={{ position: "relative", width: radius * 2, height: radius * 2, cursor: isLocked ? "not-allowed" : "pointer" }}
          onClick={() => !isLocked && handleOpenLesson(lesson.id)}
        >
          <button style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 75, height: 70, borderRadius: "50%",
            backgroundColor: bgColor,
            border: "none", borderBottom: `8px solid ${borderColor}`,
            color: "white", fontSize: "28px", zIndex: 2, fontWeight: "bold"
          }}>
            {isLocked ? "🔒" : (lesson.isCompleted ? "✓" : index + 1)}
          </button>
        </div>
        <span style={{ marginTop: "10px", fontWeight: "bold", color: isLocked ? "#AFAFAF" : "#4B4B4B" }}>
            {lesson.title}
        </span>
      </div>
    );
  };

  if (!selectedUnit) {
    return (
      <div style={{ width: "100%", maxWidth: "650px", padding: "20px" }}>
        {[...units].sort((a, b) => a.unitOrder - b.unitOrder).map((unit, index, arr) => {
          const isLocked = index === 0 ? false : !arr[index - 1].isCompleted;
          return (
            <div 
              key={unit.id} 
              style={{
                backgroundColor: isLocked ? "#F5F5F5" : "white",
                padding: "25px", borderRadius: "20px", border: `2px solid #E5E5E5`, borderBottomWidth: "5px",
                marginBottom: "20px", opacity: isLocked ? 0.7 : 1, cursor: isLocked ? "not-allowed" : "pointer",
              }}
              onClick={() => !isLocked && setSelectedUnit(unit)}
            >
                <h3>{isLocked ? "🔒 " : ""}{unit.title}</h3>
                <p>{unit.lessons?.filter(l => l.isCompleted).length} / {unit.lessons?.length} lecciones</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "#1CB0F6", padding: "20px", color: "white" }}>
          <button onClick={() => setSelectedUnit(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" }}>← VOLVER</button>
          <h2 style={{ margin: 0 }}>{selectedUnit.title}</h2>
      </div>

      <div style={{ padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "60px" }}>
        {selectedUnit.lessons.map((lesson, idx) => {
          const isLocked = idx === 0 ? false : !selectedUnit.lessons[idx - 1].isCompleted;
          return <LessonNode key={lesson.id} lesson={lesson} index={idx} isLocked={isLocked} />;
        })}
      </div>

      {isQuizOpen && selectedLessonId && (
        <QuizModal 
          isOpen={isQuizOpen} questions={questions} lessonId={selectedLessonId} 
          userProfile={userProfile} heartTimer={heartTimer} 
          onUpdateProfile={onUpdateProfile} 
          onClose={(completed: boolean, score: number, total: number) => {
            handleCloseQuiz(completed, score, total);
          }} 
        />
      )}

      {/* --- MODAL DE RESUMEN FINAL --- */}
      <AnimatePresence>
        {showSummary && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.98)",
              zIndex: 6000, display: "flex", justifyContent: "center", alignItems: "center"
            }}
          >
            <motion.div 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} 
              style={{ textAlign: "center", maxWidth: "450px", width: "90%", padding: "30px", border: "2px solid #E5E5E5", borderRadius: "30px", background: "white" }}
            >
              <h1 style={{ color: "#58CC02", fontSize: "32px", fontWeight: 900 }}>
                {summaryData.isUnitDone ? "¡UNIDAD SUPERADA! 🏆" : "¡LECCIÓN COMPLETADA! ✨"}
              </h1>

              <div style={{ display: "flex", justifyContent: "center", gap: "15px", margin: "25px 0" }}>
                <div style={{ background: "#FFC800", padding: "15px", borderRadius: "18px", flex: 1, color: "white" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>ACIERTOS</div>
                  <div style={{ fontSize: "24px", fontWeight: 900 }}>{summaryData.score}</div>
                </div>
                <div style={{ background: "#1CB0F6", padding: "15px", borderRadius: "18px", flex: 1, color: "white" }}>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>TOTAL</div>
                  <div style={{ fontSize: "24px", fontWeight: 900 }}>{summaryData.total}</div>
                </div>
              </div>

              {/* ESTE RECUADRO SOLO APARECE SI SE ACABA DE TERMINAR LA UNIDAD */}
              {summaryData.isUnitDone && (
                <div style={{ background: "#F7F7F7", padding: "15px", borderRadius: "15px", marginBottom: "20px", textAlign: "left", border: "1px solid #EEE" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#4B4B4B" }}>Progreso de Unidad:</h4>
                  {selectedUnit?.lessons.map((l, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "#666", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Lección {i+1}: {l.title}</span>
                      <span style={{ color: "#58CC02", fontWeight: "bold" }}>✓</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowSummary(false)}
                style={{
                  width: "100%", background: "#58CC02", color: "white", border: "none",
                  padding: "16px", borderRadius: "16px", fontSize: "18px", fontWeight: "bold",
                  cursor: "pointer", boxShadow: "0 5px 0 #46A302"
                }}
              >
                {summaryData.isUnitDone ? "¡ASOMBROSO!" : "CONTINUAR"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};