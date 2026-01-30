import React, { useEffect, useState } from "react";
import {
  QuestionDTO,
  completeLesson,
  subtractHeart,
  UserProfileData,
} from "../api/auth.service";

/* ================== PROPS ================== */
interface QuizModalProps {
  isOpen: boolean;
  questions: QuestionDTO[];
  lessonId: string;
  userProfile: UserProfileData;
  heartTimer: string;
  onClose: (completed: boolean, score: number, total: number) => void;
}

/* ================== HELPERS ================== */
const shuffleArray = (arr: string[]) =>
  [...arr].sort(() => Math.random() - 0.5);

/* ================== COMPONENT ================== */
export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  questions = [],
  lessonId,
  userProfile,
  heartTimer,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [score, setScore] = useState(0);

  /* ====== ORDENAR ====== */
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);

  const currentQuestion = questions[currentIndex];
  const type = currentQuestion?.questionType?.typeName;

  /* 🔒 BLINDAJE */
  const optionsSafe = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : [];

  /* ================== RESET ================== */
  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [isOpen]);

  /* ====== INIT POR TIPO ====== */
  useEffect(() => {
    if (!currentQuestion) return;

    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);

    if (type === "WRITING" || type === "ORDERING") {
      const words = currentQuestion.textTarget?.split(" ") ?? [];
      setAvailableWords(shuffleArray(words));
      setOrderedWords([]);
    }
  }, [currentIndex, currentQuestion, type]);

  /* ================== CHECK ================== */
  const handleCheckAnswer = async () => {
    if (isSyncing || !currentQuestion) return;

    setIsSyncing(true);
    let correct = false;

    if (type === "WRITING" || type === "ORDERING") {
      correct = orderedWords.join(" ").trim().toLowerCase() === currentQuestion.textTarget.trim().toLowerCase();
    } else {
      // Comparamos el valor seleccionado con el texto objetivo
      correct = selectedOption?.trim().toLowerCase() === currentQuestion.textTarget.trim().toLowerCase();
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((s) => s + 1);
    } else {
      try {
        await subtractHeart();
      } catch (err) {
        console.error("Error al restar corazón", err);
      }
    }
    setIsSyncing(false);
  };

  /* ================== NEXT ================== */
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    const mistakes = questions.length - score;
    await completeLesson(lessonId, score, mistakes);
    onClose(true, score, questions.length);
  };

  if (!isOpen || !currentQuestion) return null;

  return (
    <div style={overlay}>
      <div style={container}>
        {/* Barra de Progreso Simple */}
        <div style={progressBarContainer}>
          <div style={{ ...progressBar, width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <h2 style={questionTitle}>
          {type === "WRITING" || type === "ORDERING"
            ? "Ordena la frase correctamente"
            : type === "IMAGE_SELECT"
            ? "Selecciona la imagen correcta"
            : "Selecciona la opción correcta"}
        </h2>

        <p style={sourceText}>"{currentQuestion.textSource}"</p>

        {/* ================= AUDIO ================= */}
        {currentQuestion.audioUrl && (
          <button 
            onClick={() => new Audio(currentQuestion.audioUrl).play()}
            style={audioBtn}
          >
            🔊 Escuchar
          </button>
        )}

        {/* ================= ORDENAR ================= */}
        {(type === "WRITING" || type === "ORDERING") ? (
          <>
            <div style={sentenceBox}>
              {orderedWords.map((word, i) => (
                <button
                  key={`${word}-${i}`}
                  style={chipSelected}
                  onClick={() => {
                    setOrderedWords(o => o.filter((_, idx) => idx !== i));
                    setAvailableWords(a => [...a, word]);
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
            <div style={wordsPool}>
              {availableWords.map((word, i) => (
                <button
                  key={`${word}-${i}`}
                  style={chip}
                  onClick={() => {
                    setOrderedWords(o => [...o, word]);
                    setAvailableWords(a => a.filter((_, idx) => idx !== i));
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* ================= OPCIONES GRID ================= */
          <div style={{
            ...optionsGrid,
            gridTemplateColumns: type === "IMAGE_SELECT" ? "repeat(2, 1fr)" : "1fr",
          }}>
            {optionsSafe.map((opt: any, idx: number) => {
              let text = "";
              let img = null;

              try {
                const parsed = typeof opt === "string" && opt.startsWith("{") ? JSON.parse(opt) : opt;
                text = typeof parsed === "object" ? (parsed.value || parsed.text) : parsed;
                img = typeof parsed === "object" ? parsed.imageUrl : null;
              } catch (e) {
                text = opt;
              }

              const isSelected = selectedOption === text;

              return (
                <button
                  key={idx}
                  style={{
                    ...optionCard,
                    minHeight: type === "IMAGE_SELECT" ? "160px" : "auto",
                    background: isSelected ? "#ddf4ff" : "white",
                    borderColor: isSelected ? "#84d8ff" : "#e5e5e5",
                    boxShadow: isSelected ? "0 2px 0 #84d8ff" : "0 4px 0 #e5e5e5",
                    transform: isSelected ? "translateY(2px)" : "none",
                  }}
                  onClick={() => setSelectedOption(text)}
                  disabled={isAnswered}
                >
                  {img && (
                    <div style={imageWrapper}>
                      <img src={img} alt={text} style={responsiveImg} />
                    </div>
                  )}
                  <div style={{ fontSize: "1.1rem", color: isSelected ? "#1899d6" : "#4b4b4b" }}>
                    {text}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div style={footer}>
          {isAnswered && (
            <div style={{
              ...feedbackBox,
              background: isCorrect ? "#d7ffb8" : "#ffdfe0",
              borderColor: isCorrect ? "#58cc02" : "#ff4b4b"
            }}>
              <p style={{ color: isCorrect ? "#258300" : "#ea2b2b", fontWeight: "bold", margin: 0 }}>
                {isCorrect ? "¡Excelente!" : `Respuesta correcta: ${currentQuestion.textTarget}`}
              </p>
            </div>
          )}

          <button
            style={{
              ...mainBtn,
              background: isAnswered ? (isCorrect ? "#58cc02" : "#ff4b4b") : "#58cc02",
              opacity: (isSyncing || (!selectedOption && orderedWords.length === 0)) ? 0.5 : 1
            }}
            disabled={isSyncing || (!selectedOption && orderedWords.length === 0)}
            onClick={isAnswered ? handleNext : handleCheckAnswer}
          >
            {isAnswered ? "CONTINUAR" : "COMPROBAR"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================== STYLES ================== */
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "#fff",
  zIndex: 5000,
  overflowY: "auto",
  fontFamily: "sans-serif"
};

const container: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh"
};

const progressBarContainer: React.CSSProperties = {
  width: "100%",
  height: 12,
  background: "#e5e5e5",
  borderRadius: 10,
  marginBottom: 30
};

const progressBar: React.CSSProperties = {
  height: "100%",
  background: "#58cc02",
  borderRadius: 10,
  transition: "width 0.3s ease"
};

const questionTitle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#3c3c3c",
  marginBottom: 10
};

const sourceText: React.CSSProperties = {
  fontSize: "1.2rem",
  color: "#4b4b4b",
  marginBottom: 20,
  fontStyle: "italic"
};

const optionsGrid: React.CSSProperties = {
  display: "grid",
  gap: 15,
  marginTop: 20
};

const optionCard: React.CSSProperties = {
  padding: "15px",
  borderRadius: 16,
  border: "2px solid #e5e5e5",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.1s",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
};

const imageWrapper: React.CSSProperties = {
  width: "100%",
  height: 100,
  marginBottom: 10,
  display: "flex",
  justifyContent: "center"
};

const responsiveImg: React.CSSProperties = {
  maxHeight: "100%",
  maxWidth: "100%",
  objectFit: "contain"
};

const audioBtn: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 12,
  border: "2px solid #1cb0f6",
  background: "#fff",
  color: "#1cb0f6",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: 20,
  alignSelf: "flex-start"
};

const sentenceBox: React.CSSProperties = {
  minHeight: 100,
  borderBottom: "2px solid #e5e5e5",
  padding: 10,
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 20
};

const wordsPool: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "center"
};

const chip: React.CSSProperties = {
  padding: "10px 15px",
  borderRadius: 10,
  border: "2px solid #e5e5e5",
  background: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 2px 0 #e5e5e5"
};

const chipSelected: React.CSSProperties = {
  ...chip,
  background: "#ddf4ff",
  borderColor: "#84d8ff",
  boxShadow: "0 2px 0 #84d8ff"
};

const footer: React.CSSProperties = {
  marginTop: "auto",
  paddingTop: 20,
  borderTop: "2px solid #e5e5e5"
};

const feedbackBox: React.CSSProperties = {
  padding: 15,
  borderRadius: 12,
  marginBottom: 15,
  border: "2px solid"
};

const mainBtn: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: 16,
  border: "none",
  color: "white",
  fontWeight: "bold",
  fontSize: "1.1rem",
  cursor: "pointer",
  boxShadow: "0 4px 0 rgba(0,0,0,0.2)"
};