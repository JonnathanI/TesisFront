import React, { useState } from "react";
import { 
  UnitWithLessons, 
  UserProfileData, 
  getLessonQuestions, 
  QuestionDTO,
} from "../../api/auth.service";
import { QuizModal } from "../../Components/QuizModal";

interface LearnSectionProps {
  units: UnitWithLessons[];
  userProfile: UserProfileData;
  heartTimer: string;
  onUpdateProfile: (profile: UserProfileData) => void;
  onRefreshData: (isSilent?: boolean) => Promise<void>; // Soporta carga silenciosa
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

const handleCloseQuiz = async (completed: boolean) => {
  setIsQuizOpen(false);
  setSelectedLessonId(null);

  if (!completed || !selectedUnit) return;

  try {
    // 1️⃣ ACTUALIZACIÓN LOCAL INMEDIATA (🔥 CLAVE)
    const updatedLessons = selectedUnit.lessons.map((lesson) =>
      lesson.id === selectedLessonId
        ? { ...lesson, isCompleted: true }
        : lesson
    );

    setSelectedUnit({
      ...selectedUnit,
      lessons: updatedLessons,
    });

    // 2️⃣ Sincronización backend (silenciosa)
    await onRefreshData(true);

  } catch (error) {
    console.error("Error al actualizar progreso:", error);
  }
};

  const LessonNode = ({ lesson, index, isLocked }: { lesson: any; index: number; isLocked: boolean }) => {
    const radius = 55; 
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = lesson.isCompleted ? 100 : 0; 
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const offsetZigZag = Math.sin(index * 1.5) * 80;

    // LÓGICA DE COLORES: Cambia de verde a amarillo/dorado al completar
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
          style={{ 
            position: "relative", width: radius * 2, height: radius * 2, 
            cursor: isLocked ? "not-allowed" : "pointer",
            filter: isLocked ? "grayscale(100%)" : "none",
          }}
          onClick={() => !isLocked && handleOpenLesson(lesson.id)}
        >
          <svg height={radius * 2} width={radius * 2} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle stroke="#E5E5E5" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
            {!isLocked && (
              <circle
                stroke="#1CB0F6" fill="transparent" strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
                strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius}
              />
            )}
          </svg>
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
          <h2>{selectedUnit.title}</h2>
      </div>

      <div style={{ padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "60px" }}>
        {selectedUnit.lessons.map((lesson, idx) => {
          const isLocked = idx === 0 ? false : !selectedUnit.lessons[idx - 1].isCompleted;
          return <LessonNode key={lesson.id} lesson={lesson} index={idx} isLocked={isLocked} />;
        })}
      </div>

      {selectedLessonId && (
        <QuizModal 
          isOpen={isQuizOpen} questions={questions} lessonId={selectedLessonId} 
          userProfile={userProfile} heartTimer={heartTimer} 
          onUpdateProfile={onUpdateProfile} 
          onClose={(completed) => handleCloseQuiz(completed)} 
        />
      )}
    </div>
  );
};