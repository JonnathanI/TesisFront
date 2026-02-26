import React, { useState } from "react";
import { getLessonQuestions } from "../../api/auth.service";
import {
  QuestionDTO,
  UserProfileData,
  UnitWithLessons,
} from "../../api/auth.types";
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

interface UnitLessonSummary {
  lessonId: string;
  title: string;
  correct: number;
  total: number;
  xp: number;
  gems: number;
}

export const LearnSection: React.FC<LearnSectionProps> = ({
  units,
  userProfile,
  heartTimer,
  onUpdateProfile,
  onRefreshData,
}) => {
  console.log("🔍 Units recibidas en LearnSection:", units);

  const [selectedUnit, setSelectedUnit] = useState<UnitWithLessons | null>(
    null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Resumen lección
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({ score: 0, total: 0 });

  // Resumen unidad
  const [showUnitSummary, setShowUnitSummary] = useState(false);
  const [unitSummary, setUnitSummary] = useState<UnitLessonSummary[]>([]);

  // Video al completar unidad
  const [showUnitVideo, setShowUnitVideo] = useState(false);

  /* ===========================
        UTILIDADES
     =========================== */
  const getBarColor = (percentage: number) => {
    if (percentage === 0) return "#E5E5E5";
    if (percentage === 100) return "#58CC02";
    if (percentage < 25) return "#FF4B4B";
    if (percentage < 50) return "#FF9600";
    if (percentage < 75) return "#FFC800";
    return "#1CB0F6";
  };

  const handleOpenLesson = async (lessonId: string) => {
    const q = await getLessonQuestions(lessonId);
    setQuestions(q);
    setSelectedLessonId(lessonId);
    setIsQuizOpen(true);
  };

  /* ===========================
        CIERRE DEL QUIZ
     =========================== */
const handleCloseQuiz = async (
  completed: boolean,
  score: number,
  total: number
) => {
  setIsQuizOpen(false);

  if (!completed || !selectedUnit || !selectedLessonId) {
    setSelectedLessonId(null);
    await onRefreshData(true);
    return;
  }

  // 1) Marcamos la lección actual como completada en la unidad
  const updatedLessons = selectedUnit.lessons.map((lesson) =>
    lesson.id === selectedLessonId
      ? { ...lesson, isCompleted: true }
      : lesson
  );

  // 2) ¿Todas las lecciones de la unidad están completas ahora?
  const isUnitDoneNow = updatedLessons.every((l) => l.isCompleted);

  // 3) ¿Es la última lección del camino?
  const currentIndex = updatedLessons.findIndex(
    (l) => l.id === selectedLessonId
  );
  const isLastLesson = currentIndex === updatedLessons.length - 1;

  const shouldShowUnitSummary = isUnitDoneNow && isLastLesson;

  // ⚡ Guardamos/actualizamos los datos de ESTA lección en unitSummary
  const lessonTitle =
    selectedUnit.lessons.find((l) => l.id === selectedLessonId)?.title || "";

  const mergedSummary: UnitLessonSummary[] = (() => {
    const withoutCurrent = unitSummary.filter(
      (s) => s.lessonId !== selectedLessonId
    );
    return [
      ...withoutCurrent,
      {
        lessonId: selectedLessonId,
        title: lessonTitle,
        correct: score,
        total,
        xp: score * 10,
        gems: 10,
      },
    ];
  })();

  // 🔹 Siempre mostramos resumen de ESTA lección
  setSummaryData({ score, total });
  setShowSummary(true);

  if (shouldShowUnitSummary) {
    // 🧩 Construimos el resumen final de UNIDAD usando
    // los datos que ya teníamos + esta última lección.
    const fullUnitSummary: UnitLessonSummary[] = updatedLessons.map(
      (lesson) => {
        const existing = mergedSummary.find(
          (s) => s.lessonId === lesson.id
        );

        if (existing) {
          return existing; // mantiene sus aciertos/errores previos
        }

        // Lección completada pero sin datos detallados (por si acaso)
        return {
          lessonId: lesson.id,
          title: lesson.title,
          correct: 0,
          total: 0,
          xp: lesson.isCompleted ? 10 : 0,
          gems: lesson.isCompleted ? 10 : 0,
        };
      }
    );

    setUnitSummary(fullUnitSummary);

    // 🎉 confetti y flujo: resumen lección → video → resumen unidad
    confetti({
      particleCount: 180,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#58CC02", "#1CB0F6", "#FFC800"],
    });

    setTimeout(() => {
      setShowSummary(false);
      setShowUnitVideo(true);
    }, 2200);
  } else {
    // Si NO se terminó la unidad, solo actualizamos el resumen parcial
    setUnitSummary(mergedSummary);

    setTimeout(() => {
      setShowSummary(false);
    }, 1800);
  }

  setSelectedUnit({ ...selectedUnit, lessons: updatedLessons });
  setSelectedLessonId(null);

  await onRefreshData(true);
};
  /* ===========================
        SIN UNIDADES
     =========================== */
  if (!units || units.length === 0) {
    return (
      <div style={{ maxWidth: 650, margin: "0 auto", padding: 20 }}>
        <h2 style={{ fontWeight: 900, marginBottom: 12 }}>
          No tienes unidades asignadas
        </h2>
        <p style={{ color: "#777", fontWeight: 500 }}>
          Pídele a tu profesor que te asigne un curso o revisa si ya te uniste
          a una clase con el código de aula.
        </p>
      </div>
    );
  }

  /* ===========================
        LISTA DE UNIDADES
     =========================== */
  if (!selectedUnit) {
    // 👉 Ordenamos las unidades por unitOrder
    const sortedUnits = [...units].sort((a, b) => a.unitOrder - b.unitOrder);

    return (
      <div style={{ maxWidth: 650, margin: "0 auto", padding: 20 }}>
        {sortedUnits.map((unit, index) => {
          const completed = unit.lessons.filter((l) => l.isCompleted).length;
          const progress = Math.round(
            (completed / unit.lessons.length) * 100
          );

          const previousUnit = index > 0 ? sortedUnits[index - 1] : null;
          const previousFullyCompleted = previousUnit
            ? previousUnit.lessons.every((l) => l.isCompleted)
            : true; // la primera unidad no depende de ninguna

          const backendLocked = unit.isLocked;
          const isLocked =
            backendLocked || (index > 0 && !previousFullyCompleted);

          return (
            <motion.div
              key={unit.id}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              onClick={() => !isLocked && setSelectedUnit(unit)}
              style={{
                background: isLocked ? "#F5F5F5" : "white",
                padding: 25,
                borderRadius: 24,
                border: "2px solid #E5E5E5",
                borderBottomWidth: 6,
                marginBottom: 24,
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.7 : 1,
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3>
                  {isLocked ? "🔒 " : ""}
                  {unit.title}
                </h3>

                {!isLocked && (
                  <strong style={{ color: getBarColor(progress) }}>
                    {progress}%
                  </strong>
                )}
              </div>

              {!isLocked && (
                <div
                  style={{
                    height: 18,
                    background: "#E5E5E5",
                    borderRadius: 12,
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    style={{
                      height: "100%",
                      background: getBarColor(progress),
                      borderRadius: 12,
                    }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  /* ===========================
        CAMINO DE LECCIONES
     =========================== */
  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: 20 }}>
      {/* HEADER UNIDAD: botón volver + título (FIJOS) */}
      <div style={unitHeaderStyle as React.CSSProperties}>
        <button
          style={backButtonStyle as React.CSSProperties}
          onClick={() => {
            setShowUnitVideo(false);
            setShowSummary(false);
            setShowUnitSummary(false);
            //setUnitSummary([]);
            setSelectedLessonId(null);
            setSelectedUnit(null);
          }}
        >
          ← Volver a unidades
        </button>

        <h2
          style={{
            marginTop: 10,
            marginBottom: 0,
            fontWeight: 900,
            fontSize: "1.4rem",
          }}
        >
          {selectedUnit.title}
        </h2>
      </div>

      {/* CAMINO “SNAKE” DE LECCIONES */}
      <div
        style={{
          padding: "50px 0 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
        }}
      >
        {selectedUnit.lessons.map((lesson, idx) => {
          const isLocked =
            idx !== 0 && !selectedUnit.lessons[idx - 1].isCompleted;
          const offset = Math.sin(idx * 1.3) * 75;
          const bg = isLocked
            ? "#E5E5E5"
            : lesson.isCompleted
            ? "#58CC02"
            : "#1CB0F6";

          return (
            <div
              key={lesson.id}
              style={{ transform: `translateX(${offset}px)` }}
            >
              <button
                disabled={isLocked}
                onClick={() => handleOpenLesson(lesson.id)}
                style={{
                  width: 85,
                  height: 78,
                  borderRadius: "50%",
                  background: bg,
                  color: "white",
                  fontSize: 28,
                  fontWeight: "bold",
                  border: "none",
                  cursor: isLocked ? "not-allowed" : "pointer",
                }}
              >
                {isLocked ? "🔒" : lesson.isCompleted ? "✓" : idx + 1}
              </button>
              <div style={{ textAlign: "center", marginTop: 10 }}>
                {lesson.title}
              </div>
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
          backgroundImageUrl="/fondo.jpeg"
        />
      )}

      {/* RESUMEN LECCIÓN */}
      <AnimatePresence>
        {showSummary && (
          <motion.div style={overlayStyle}>
            <motion.div style={summaryCardStyle}>
              <h1>Resumen de Lección</h1>
              <p>
                ✅ {summaryData.score} / {summaryData.total}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO: UNIDAD COMPLETADA */}
      <AnimatePresence>
        {showUnitVideo && (
          <motion.div style={overlayStyle}>
            <motion.div style={videoModalCard}>
              <h1
                style={{
                  marginBottom: 8,
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: "#3c3c3c",
                }}
              >
                🎉 ¡Unidad completada!
              </h1>
              <p
                style={{
                  marginBottom: 20,
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                }}
              >
                ¡Sigue así, estás avanzando increíble!
              </p>

              <div
                style={{
                  width: "100%",
                  maxWidth: 460,
                  margin: "0 auto 24px",
                  borderRadius: 28,
                  overflow: "hidden",
                  background: "#f7f7f7",
                }}
              >
                <video
                  src="/pajaro.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <button
                style={continueBtnStyle}
                onClick={() => {
                  setShowUnitVideo(false);
                  setShowUnitSummary(true);
                }}
              >
                Ver resumen de la unidad
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESUMEN UNIDAD */}
      <AnimatePresence>
        {showUnitSummary && (
          <motion.div style={overlayStyle}>
            <motion.div style={unitSummaryStyle}>
              <h1>🎉 Unidad completada</h1>

              {unitSummary.map((l, i) => (
                <div key={i} style={unitRowStyle}>
                  <strong>{l.title}</strong>
                  <div>
                    ⭐ {l.xp} &nbsp; 💎 {l.gems}
                  </div>
                  <small>
                    ✅ {l.correct} ❌ {l.total - l.correct}
                  </small>
                </div>
              ))}

              <button
                style={continueBtnStyle}
                onClick={() => {
                  setShowUnitSummary(false);
                  setSelectedUnit(null);
                  //setUnitSummary([]);
                }}
              >
                CONTINUAR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===========================
        ESTILOS
   =========================== */
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(255,255,255,0.95)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const summaryCardStyle: React.CSSProperties = {
  background: "white",
  padding: 30,
  borderRadius: 24,
  border: "2px solid #E5E5E5",
  textAlign: "center",
  minWidth: 260,
};

const videoModalCard: React.CSSProperties = {
  background: "white",
  padding: 32,
  borderRadius: 32,
  border: "2px solid #E5E5E5",
  textAlign: "center",
  maxWidth: 620,
  width: "92%",
  boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
};

const unitSummaryStyle: React.CSSProperties = {
  background: "white",
  padding: 30,
  borderRadius: 26,
  maxWidth: 480,
  width: "90%",
  border: "2px solid #E5E5E5",
};

const unitRowStyle: React.CSSProperties = {
  background: "#F9F9F9",
  padding: 14,
  borderRadius: 18,
  marginBottom: 12,
  border: "2px solid #E5E5E5",
};

const continueBtnStyle: React.CSSProperties = {
  marginTop: 20,
  width: "100%",
  padding: 15,
  background: "#58CC02",
  color: "white",
  fontWeight: 900,
  borderRadius: 16,
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
};

/* 🔥 AQUÍ ES DONDE LO HACEMOS FIJO */
const unitHeaderStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 6,
  marginBottom: 10,
  position: "sticky",
  top: 0,
  background: "white",
  zIndex: 10,
  paddingTop: 8,
  paddingBottom: 8,
};

const backButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid #E5E5E5",
  background: "white",
  fontSize: "0.9rem",
  cursor: "pointer",
};