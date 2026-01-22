import React, { useState } from "react";
import { COLORS } from "../theme/color";
import { 
  UnitWithLessons, 
  UserProfileData, 
  getLessonQuestions, 
  QuestionDTO 
} from "../../api/auth.service";
import { QuizModal } from "../../Components/QuizModal";

interface LearnSectionProps {
  units: UnitWithLessons[];
  userProfile: UserProfileData;
  heartTimer: string;
  onUpdateProfile: (profile: UserProfileData) => void;
}

export const LearnSection: React.FC<LearnSectionProps> = ({ 
  units, 
  userProfile, 
  heartTimer, 
  onUpdateProfile 
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitWithLessons | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Ordenamos las unidades por unitOrder para la progresión secuencial
  const sortedUnits = [...units].sort((a, b) => a.unitOrder - b.unitOrder);

  const handleOpenLesson = async (lessonId: string) => {
    const q = await getLessonQuestions(lessonId);
    setQuestions(q);
    setSelectedLessonId(lessonId);
    setIsQuizOpen(true);
  };

  // Estilos de animaciones modernas
  const modernStyles = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulseGreen {
      0% { box-shadow: 0 0 0 0 rgba(88, 204, 2, 0.5); }
      70% { box-shadow: 0 0 0 15px rgba(88, 204, 2, 0); }
      100% { box-shadow: 0 0 0 0 rgba(88, 204, 2, 0); }
    }
    .unit-card {
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .unit-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    .lesson-node-btn {
      transition: transform 0.1s ease;
    }
    .lesson-node-btn:active {
      transform: translate(-50%, -50%) scale(0.9);
    }
  `;

  // --- COMPONENTE INTERNO: NODO DE LECCIÓN ---
  const LessonNode = ({ lesson, index }: { lesson: any; index: number }) => {
    const radius = 55; 
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = lesson.isCompleted ? 100 : 0; 
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const offsetZigZag = Math.sin(index * 1.5) * 80;

    // Colores basados en el personaje azul y estados de éxito amarillos
    const BIRD_BLUE = "#1CB0F6"; 
    const STAR_YELLOW = "#FFD700";
    const STAR_YELLOW_DARK = "#E5C100";
    const DUO_GREEN = "#58CC02";
    const DUO_GREEN_DARK = "#46A302";

    return (
      <div style={{ 
        transform: `translateX(${offsetZigZag}px)`, 
        display: "flex", flexDirection: "column", alignItems: "center",
        animation: `fadeInUp 0.6s ease-out backwards ${index * 0.1}s` 
      }}>
        <div 
          style={{ 
            position: "relative", width: radius * 2, height: radius * 2, cursor: "pointer",
            animation: !lesson.isCompleted ? "pulseGreen 2s infinite" : "none",
            borderRadius: "50%"
          }}
          onClick={() => handleOpenLesson(lesson.id)}
        >
          {/* Anillo de progreso azul */}
          <svg height={radius * 2} width={radius * 2} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle stroke="#E5E5E5" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
            <circle
              stroke={BIRD_BLUE}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
              strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius}
            />
          </svg>
          <button className="lesson-node-btn" style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 75, height: 70, borderRadius: "50%",
            backgroundColor: lesson.isCompleted ? STAR_YELLOW : DUO_GREEN,
            border: "none", borderBottom: `8px solid ${lesson.isCompleted ? STAR_YELLOW_DARK : DUO_GREEN_DARK}`,
            color: lesson.isCompleted ? "#4B4B4B" : "white", fontSize: "28px", zIndex: 2, fontWeight: "bold"
          }}>
            {lesson.isCompleted ? "✓" : index + 1}
          </button>
        </div>
        <span style={{ marginTop: "10px", fontWeight: "bold", color: "#4B4B4B", fontSize: "15px" }}>{lesson.title}</span>
      </div>
    );
  };

  // --- VISTA 1: LISTA DE UNIDADES ---
  if (!selectedUnit) {
    return (
      <div style={{ width: "100%", maxWidth: "650px", padding: "20px" }}>
        <style>{modernStyles}</style>
        <h2 style={{ marginBottom: "25px", color: "#3C3C3C", animation: "fadeInUp 0.5s ease" }}>Mis Unidades</h2>
        {sortedUnits.map((unit, index) => {
          const isPreviousCompleted = index === 0 || sortedUnits[index - 1].isCompleted;
          const isLocked = !isPreviousCompleted; 
          const totalLessons = unit.lessons?.length || 0;
          const completedLessons = unit.lessons?.filter((l) => l.isCompleted).length || 0;
          const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return (
            <div 
              key={unit.id} 
              className="unit-card"
              style={{
                backgroundColor: isLocked ? "#F5F5F5" : "white",
                padding: "25px", borderRadius: "20px", border: `2px solid #E5E5E5`, borderBottomWidth: "5px",
                marginBottom: "20px", opacity: isLocked ? 0.7 : 1, cursor: isLocked ? "not-allowed" : "pointer",
                animation: `fadeInUp 0.5s ease-out backwards ${index * 0.15}s`
              }}
              onClick={() => !isLocked && setSelectedUnit(unit)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div>
                  <h3 style={{ margin: 0, color: isLocked ? "#AFAFAF" : "#4B4B4B" }}>{isLocked ? "🔒 " : ""}{unit.title}</h3>
                  <span style={{ fontSize: "14px", color: "#777" }}>{completedLessons} / {totalLessons} lecciones</span>
                </div>
                {!isLocked && (
                  <button style={{ 
                    backgroundColor: "#1CB0F6", color: "white", border: "none", padding: "10px 22px", 
                    borderRadius: "14px", fontWeight: "bold", boxShadow: `0 4px 0 #1899D6` 
                  }}>
                    {unit.isCompleted ? "REPASAR" : "ENTRAR"}
                  </button>
                )}
              </div>
              <div style={{ width: "100%", height: "14px", backgroundColor: "#E5E5E5", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ 
                  width: `${progressPercent}%`, height: "100%", 
                  backgroundColor: unit.isCompleted ? "#58CC02" : "#1CB0F6", transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)" 
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- VISTA 2: CAMINO DE LECCIONES (CABECERA FIJA Y FONDO PERSISTENTE) ---
  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <style>{modernStyles}</style>
      {/* Cabecera Fija */}
      <div style={{ 
        position: "sticky", top: 0, zIndex: 100, backgroundColor: "#1CB0F6", 
        padding: "20px 30px", display: "flex", justifyContent: "space-between", 
        alignItems: "center", color: "white", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        animation: "fadeInUp 0.4s ease"
      }}>
        <div>
          <button onClick={() => setSelectedUnit(null)} style={{ background: "none", border: "none", color: "white", fontWeight: "bold", cursor: "pointer" }}>← VOLVER</button>
          <h2 style={{ margin: "5px 0 0 0" }}>{selectedUnit.title}</h2>
        </div>
        <button style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "10px 22px", borderRadius: "12px", fontWeight: "bold" }}>GUÍA</button>
      </div>

      {/* Camino con fondo fijo del pájaro azul */}
      <div style={{ 
        backgroundImage: `url("/euro-02.png")`, backgroundSize: "450px", backgroundRepeat: "no-repeat",
        backgroundPosition: "center 250px", backgroundAttachment: "fixed",
        padding: "60px 0 120px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "60px"
      }}>
        {selectedUnit.lessons.map((lesson, idx) => (
          <LessonNode key={lesson.id} lesson={lesson} index={idx} />
        ))}
      </div>

      {selectedLessonId && (
        <QuizModal 
          isOpen={isQuizOpen} questions={questions} lessonId={selectedLessonId} 
          userProfile={userProfile} heartTimer={heartTimer} 
          onUpdateProfile={onUpdateProfile} onClose={() => setIsQuizOpen(false)} 
        />
      )}
    </div>
  );
};