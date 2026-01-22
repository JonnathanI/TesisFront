import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QuestionDTO,
  completeLesson,
  buyShopItem,
  getUserProfile,
  subtractHeart,
  UserProfileData,
} from "../api/auth.service";

interface QuizModalProps {
  isOpen: boolean;
  questions: QuestionDTO[];
  lessonId: string;
  userProfile: UserProfileData;
  heartTimer: string;
  onClose: (completed: boolean) => void;
  onUpdateProfile: (profile: UserProfileData) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  questions,
  lessonId,
  userProfile,
  heartTimer,
  onClose,
  onUpdateProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);

  // Reiniciar el quiz cuando se abre por primera vez
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      
      if (userProfile.heartsCount <= 0) {
        setShowNoHeartsModal(true);
      }
    }
  }, [isOpen]);

  const currentQuestion = questions[currentIndex];

  const handleCheckAnswer = async () => {
    if (!selectedOption || isSyncing || !currentQuestion) return;

    setIsSyncing(true);
    // Asegúrate de que textTarget sea el campo correcto según tu API
    const correct = selectedOption === currentQuestion.textTarget;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (!correct) {
      try {
        const updatedProfile = await subtractHeart();
        onUpdateProfile(updatedProfile);
        if (updatedProfile.heartsCount <= 0) {
          setShowNoHeartsModal(true);
        }
      } catch {
        onUpdateProfile({
          ...userProfile,
          heartsCount: Math.max(0, userProfile.heartsCount - 1),
        });
      }
    }
    setIsSyncing(false);
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      // RESETEAR ESTADOS PARA LA SIGUIENTE PREGUNTA
      setIsAnswered(false);
      setIsCorrect(false);
      setSelectedOption(null);
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // FINALIZAR LECCIÓN
      setIsSyncing(true);
      try {
        await completeLesson(lessonId, questions.length);
        onClose(true);
      } catch (error) {
        console.error("Error al completar lección", error);
        onClose(false);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleBuyHearts = async () => {
    if (userProfile.lingots < 400) {
      alert("No tienes suficientes gemas 💎");
      return;
    }
    try {
      await buyShopItem("HEART_REFILL");
      const profile = await getUserProfile();
      onUpdateProfile(profile);
      setShowNoHeartsModal(false);
    } catch {
      alert("Error al comprar corazones");
    }
  };

  if (!isOpen || !currentQuestion) return null;

  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <button onClick={() => onClose(false)} style={closeBtn}>✕</button>
          <div style={progressWrapper}>
            <div
              style={{
                ...progressFill,
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
          <div style={heartsBox}>
            ❤️ <strong>{userProfile.heartsCount}</strong>
          </div>
        </div>

        {/* CONTENIDO DE PREGUNTA */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 style={questionText}>{currentQuestion.textSource}</h2>

          <div style={optionsGrid}>
            {currentQuestion.options.map((opt) => (
              <button
                key={opt}
                disabled={isAnswered || isSyncing}
                onClick={() => setSelectedOption(opt)}
                style={{
                  ...optionStyle,
                  border: selectedOption === opt ? "2px solid #1cb0f6" : "2px solid #e5e5e5",
                  background: selectedOption === opt ? "#ddf4ff" : "white",
                  cursor: isAnswered ? "default" : "pointer"
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FEEDBACK BAR (FOOTER) */}
        <div
          style={{
            ...feedbackBar,
            background: isAnswered
              ? isCorrect ? "#d7ffb8" : "#ffdfe0"
              : "white",
            borderTop: isAnswered ? "none" : "2px solid #e5e5e5"
          }}
        >
          <div style={{ maxWidth: 600, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {isAnswered && (
              <div style={{ color: isCorrect ? "#58cc02" : "#ff4b4b", fontWeight: "bold" }}>
                {isCorrect ? "¡Buen trabajo!" : `Incorrecto. Era: ${currentQuestion.textTarget}`}
              </div>
            )}
            
            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption || isSyncing}
                style={{...primaryBtn, marginLeft: "auto"}}
              >
                COMPROBAR
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                style={{...(isCorrect ? successBtn : errorBtn), marginLeft: "auto"}}
              >
                {currentIndex === questions.length - 1 ? "FINALIZAR" : "CONTINUAR"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL SIN VIDAS */}
      <AnimatePresence>
        {showNoHeartsModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={noHeartsOverlay}
          >
            <motion.div 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              style={noHeartsContent}
            >
              <h2 style={{ textAlign: "center" }}>¡Sin vidas!</h2>
              <p style={{ textAlign: "center" }}>Próxima vida en:</p>
              <p style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}>{heartTimer}</p>

              <button onClick={handleBuyHearts} style={{...successBtn, width: "100%", marginBottom: 10}}>
                RELLENAR VIDAS 💎 400
              </button>

              <button onClick={() => onClose(false)} style={{...exitBtn, width: "100%"}}>
                SALIR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ESTILOS (Asegurando que el footer no tape el contenido) */
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "#fff", zIndex: 5000, overflowY: "auto" };
const containerStyle: React.CSSProperties = { maxWidth: 600, margin: "0 auto", padding: "2rem 2rem 8rem 2rem" };
const headerStyle: React.CSSProperties = { display: "flex", gap: 15, alignItems: "center", marginBottom: "2rem" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#afafaf" };
const progressWrapper: React.CSSProperties = { flex: 1, height: 16, background: "#eee", borderRadius: 10 };
const progressFill: React.CSSProperties = { height: "100%", background: "#58cc02", borderRadius: 10, transition: "width 0.3s ease" };
const heartsBox: React.CSSProperties = { fontWeight: 900, color: "#ff4b4b", fontSize: "1.2rem" };
const questionText: React.CSSProperties = { margin: "2rem 0", fontSize: "1.8rem", fontWeight: "bold", color: "#3c3c3c" };
const optionsGrid: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const optionStyle: React.CSSProperties = { padding: "1.2rem", borderRadius: 16, fontWeight: 600, fontSize: "1.1rem", textAlign: "left", transition: "all 0.2s" };
const feedbackBar: React.CSSProperties = { position: "fixed", bottom: 0, left: 0, right: 0, padding: "2rem", display: "flex", justifyContent: "center", zIndex: 5001 };
const primaryBtn: React.CSSProperties = { padding: "12px 60px", background: "#58cc02", color: "#fff", borderRadius: 16, border: "none", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 0 #46a302" };
const successBtn: React.CSSProperties = { ...primaryBtn };
const errorBtn: React.CSSProperties = { ...primaryBtn, background: "#ff4b4b", boxShadow: "0 4px 0 #a83232" };
const noHeartsOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 6000 };
const noHeartsContent: React.CSSProperties = { background: "#fff", padding: "2.5rem", borderRadius: 24, width: "90%", maxWidth: 400 };
const exitBtn: React.CSSProperties = { background: "none", border: "none", fontWeight: 700, color: "#1cb0f6", cursor: "pointer", marginTop: 10 };