// src/Components/QuizModal.tsx
import React, { useEffect, useState } from "react";
import { completeLesson, subtractHeart } from "../api/auth.service";
import { QuestionDTO, UserProfileData } from "../api/auth.types";

/* ================== PROPS ================== */
interface QuizModalProps {
  isOpen: boolean;
  questions: QuestionDTO[];
  lessonId: string;
  userProfile: UserProfileData;
  heartTimer: string;
  onClose: (completed: boolean, score: number, total: number) => void;
  /** 🔹 Opcional: imagen de fondo para el modal */
  backgroundImageUrl?: string;
}

/* ================== HELPERS ================== */
const shuffleArray = (arr: string[]) =>
  [...arr].sort(() => Math.random() - 0.5);

const getHeartsFromProfile = (profile: UserProfileData | undefined): number => {
  if (!profile) return 0;
  return (
    (profile as any).heartsCount ??
    (profile as any).hearts ??
    (profile as any).hearts_count ??
    0
  );
};

const normalizeText = (s: string) =>
  s.trim().toLowerCase().replace(/[.,?!]/g, "");

/* ================== COMPONENT ================== */
export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  questions = [],
  lessonId,
  userProfile,
  heartTimer,
  onClose,
  backgroundImageUrl,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [score, setScore] = useState(0);

  // ❤️ estado local de corazones
  const [localHearts, setLocalHearts] = useState<number>(() =>
    getHeartsFromProfile(userProfile)
  );

  // ❌ modal de confirmación para salir
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  /* ====== ESTADOS SPEAKING ====== */
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  /* ====== ORDENAR ====== */
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);

  /* ====== WRITING (respuesta libre) ====== */
  const [writingAnswer, setWritingAnswer] = useState("");

  const currentQuestion = questions[currentIndex];
  const type = currentQuestion?.questionType?.typeName;

  const optionsSafe = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : [];

  // sincroniza corazones si el perfil cambia
  useEffect(() => {
    setLocalHearts(getHeartsFromProfile(userProfile));
  }, [userProfile]);

  /* ================== LÓGICA RECONOCIMIENTO DE VOZ ================== */
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Tu navegador no soporta el reconocimiento de voz. Prueba con Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const current = event.results[0][0].transcript;
      setTranscript(current);
      setSelectedOption(current);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  /* ================== RESET AL CAMBIAR PREGUNTA ================== */
  useEffect(() => {
    if (!currentQuestion) return;

    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setOrderedWords([]);
    setAvailableWords([]);
    setTranscript("");
    setIsListening(false);
    setWritingAnswer("");

    // ⛔ OJO: SOLO ORDERING / TRANSLATION usan fichas, NO WRITING
    if (type === "ORDERING" || type === "TRANSLATION_TO_TARGET") {
      if (optionsSafe.length > 0) {
        const parsedOptions = optionsSafe.map((opt: any) => {
          try {
            const parsed =
              typeof opt === "string" && opt.startsWith("{")
                ? JSON.parse(opt)
                : opt;
            return typeof parsed === "object"
              ? parsed.value || parsed.text
              : parsed;
          } catch (e) {
            return opt;
          }
        });
        setAvailableWords(shuffleArray(parsedOptions));
      } else {
        const words = currentQuestion.textTarget?.split(" ") ?? [];
        setAvailableWords(shuffleArray(words));
      }
    }
  }, [currentIndex, currentQuestion, type, isOpen, optionsSafe]);

  /* ================== CHECK ================== */
  const handleCheckAnswer = async () => {
    if (isSyncing || !currentQuestion) return;

    setIsSyncing(true);
    let correct = false;

    const target = normalizeText(currentQuestion.textTarget ?? "");

    let answerRaw = "";

    if (type === "WRITING") {
      answerRaw = writingAnswer;
    } else if (type === "ORDERING" || type === "TRANSLATION_TO_TARGET") {
      answerRaw = orderedWords.join(" ");
    } else if (type === "SPEAKING") {
      // si quieres evaluar speaking por texto reconocido:
      answerRaw = transcript;
    } else {
      answerRaw = selectedOption || "";
    }

    const answer = normalizeText(answerRaw);
    correct = answer === target;

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((s) => s + 1);
    } else {
      try {
        await subtractHeart();
        // ❤️ actualizamos corazón visualmente al instante
        setLocalHearts((h) => (h > 0 ? h - 1 : 0));
      } catch (err) {
        console.error("Error al restar corazón", err);
      }
    }
    setIsSyncing(false);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    const mistakes = questions.length - score;
    await completeLesson(lessonId, score, mistakes);
    onClose(true, score, questions.length);
  };

  /* ================== SALIR (X) ================== */

  const handleRequestExit = () => {
    const hasProgress =
      currentIndex > 0 ||
      isAnswered ||
      selectedOption !== null ||
      orderedWords.length > 0 ||
      writingAnswer.trim().length > 0;

    if (!hasProgress) {
      onClose(false, score, questions.length || 0);
      return;
    }

    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onClose(false, score, questions.length || 0);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  if (!isOpen || !currentQuestion) return null;

  // para disabled del botón
  const isAnswerEmpty =
    type === "WRITING"
      ? writingAnswer.trim().length === 0
      : type === "ORDERING" || type === "TRANSLATION_TO_TARGET"
      ? orderedWords.length === 0
      : type === "SPEAKING"
      ? transcript.trim().length === 0
      : !selectedOption;

  return (
    <div
      style={{
        ...overlay,
        ...(backgroundImageUrl
          ? {
              background: "none",
              backgroundImage: `linear-gradient(rgba(255,255,255,0.93), rgba(255,255,255,0.96)), url(${backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}),
      }}
    >
      {/* CSS extra para responsive */}
      <style>{responsiveCss}</style>

      <div style={container} className="quiz-container">
        {/* HEADER: corazones + X */}
        <div style={headerRow}>
          <div style={heartsBox}>
            <span style={{ marginRight: 6, fontSize: "1.2rem" }}>❤️</span>
            <span style={{ fontWeight: 900, marginRight: 8 }}>
              {localHearts}
            </span>
            {heartTimer && <span style={heartTimerText}>⏱ {heartTimer}</span>}
          </div>

          <button style={closeBtn} onClick={handleRequestExit}>
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div style={progressBarContainer}>
          <div
            style={{
              ...progressBar,
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <h2 style={questionTitle} className="quiz-title">
          {type === "SPEAKING"
            ? "Escucha y repite la frase"
            : type === "WRITING"
            ? "Escribe la frase correctamente"
            : type === "ORDERING" || type === "TRANSLATION_TO_TARGET"
            ? "Ordena la frase correctamente"
            : "Selecciona la opción correcta"}
        </h2>

        <div style={sourceCard}>
          <p style={sourceText}>"{currentQuestion.textSource}"</p>
          {currentQuestion.audioUrl && (
            <button
              onClick={() => new Audio(currentQuestion.audioUrl).play()}
              style={audioBtn}
            >
              🔊 Escuchar referencia
            </button>
          )}
        </div>

        {/* ================= CONTENIDO POR TIPO ================= */}

        {type === "SPEAKING" ? (
          /* VISTA DE SPEAKING */
          <div style={speakingContainer}>
            <button
              onClick={startListening}
              disabled={isAnswered || isListening}
              style={{
                ...micBtn,
                background: isListening ? "#ff4b4b" : "#1cb0f6",
                boxShadow: isListening ? "0 0 20px #ff4b4b" : "0 4px 0 #1899d6",
              }}
            >
              {isListening ? "🎙️" : "🎤"}
            </button>
            <p
              style={{
                marginTop: 10,
                color: "#777",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {isListening ? "Escuchando..." : "Toca el micro para hablar"}
            </p>

            <div style={transcriptDisplay}>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#afafaf",
                  display: "block",
                }}
              >
                Tu pronunciación:
              </span>
              <strong>{transcript || "..."}</strong>
            </div>
          </div>
        ) : type === "WRITING" ? (
          /* VISTA DE WRITING (texto libre) */
          <div style={{ marginTop: 20 }}>
            <label
              style={{
                fontSize: "0.85rem",
                color: "#777",
                fontWeight: 700,
                display: "block",
                marginBottom: 8,
              }}
            >
              Escribe tu respuesta en inglés:
            </label>
            <textarea
              style={writingTextarea}
              value={writingAnswer}
              onChange={(e) => setWritingAnswer(e.target.value)}
              disabled={isAnswered}
              rows={3}
            />
          </div>
        ) : type === "ORDERING" || type === "TRANSLATION_TO_TARGET" ? (
          /* VISTA DE ORDENAR */
          <>
            <div style={sentenceBox}>
              {orderedWords.map((word, i) => (
                <button
                  key={`${word}-${i}`}
                  style={chipSelected}
                  onClick={() => {
                    setOrderedWords((o) => o.filter((_, idx) => idx !== i));
                    setAvailableWords((a) => [...a, word]);
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
                    setOrderedWords((o) => [...o, word]);
                    setAvailableWords((a) => a.filter((_, idx) => idx !== i));
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* VISTA DE OPCIONES (GRID) */
          <div
            style={{
              ...optionsGrid,
              gridTemplateColumns:
                type === "IMAGE_SELECT" ? "repeat(2, 1fr)" : "1fr",
            }}
          >
            {optionsSafe.map((opt: any, idx: number) => {
              let text = "";
              let img: string | null = null;
              try {
                const parsed =
                  typeof opt === "string" && opt.startsWith("{")
                    ? JSON.parse(opt)
                    : opt;
                text =
                  typeof parsed === "object"
                    ? parsed.value || parsed.text
                    : parsed;
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
                    background: isSelected ? "#ddf4ff" : "white",
                    borderColor: isSelected ? "#84d8ff" : "#e5e5e5",
                  }}
                  onClick={() => setSelectedOption(text)}
                  disabled={isAnswered}
                >
                  {img && (
                    <div style={imageWrapper}>
                      <img src={img} alt={text} style={responsiveImg} />
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "1.1rem",
                      color: isSelected ? "#1899d6" : "#4b4b4b",
                      textAlign: "center",
                    }}
                  >
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
            <div
              style={{
                ...feedbackBox,
                background: isCorrect ? "#d7ffb8" : "#ffdfe0",
                borderColor: isCorrect ? "#58cc02" : "#ff4b4b",
              }}
            >
              <p
                style={{
                  color: isCorrect ? "#258300" : "#ea2b2b",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                {isCorrect
                  ? "¡Excelente!"
                  : `Casi, lo correcto era: "${currentQuestion.textTarget}"`}
              </p>
            </div>
          )}

          <button
            style={{
              ...mainBtn,
              background: isAnswered
                ? isCorrect
                  ? "#58cc02"
                  : "#ff4b4b"
                : "#58cc02",
              opacity: isSyncing || isAnswerEmpty ? 0.5 : 1,
            }}
            disabled={isSyncing || isAnswerEmpty}
            onClick={isAnswered ? handleNext : handleCheckAnswer}
          >
            {isAnswered ? "CONTINUAR" : "COMPROBAR"}
          </button>
        </div>
      </div>

      {/* 🔺 MODAL DE CONFIRMACIÓN PARA SALIR */}
      {showExitConfirm && (
        <div style={confirmOverlayStyle}>
          <div style={confirmCardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>
              ¿Salir de la lección?
            </h3>
            <p style={{ marginTop: 0, marginBottom: 16, color: "#555" }}>
              Si sales ahora, perderás el progreso de esta lección.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 12,
                  border: "2px solid #e5e5e5",
                  background: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                onClick={handleCancelExit}
              >
                Continuar practicando
              </button>
              <button
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 12,
                  border: "none",
                  background: "#ff4b4b",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
                onClick={handleConfirmExit}
              >
                Salir y perder progreso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================== ESTILOS ADICIONALES ================== */

// CSS con media queries (para tamaños pequeños)
const responsiveCss = `
  @media (max-width: 768px) {
    .quiz-container {
      max-width: 100%;
      padding: 16px 12px;
    }

    .quiz-title {
      font-size: 1.25rem;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .quiz-container {
      padding: 12px 10px 20px;
    }
    .quiz-title {
      font-size: 1.1rem;
    }
  }
`;

const speakingContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 20,
};

const micBtn: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  border: "none",
  color: "white",
  fontSize: "2rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const transcriptDisplay: React.CSSProperties = {
  marginTop: 20,
  padding: 16,
  borderRadius: 15,
  background: "#f9f9f9",
  border: "2px dashed #e5e5e5",
  width: "100%",
  maxWidth: 480,
  textAlign: "center",
  fontSize: "1rem",
  minHeight: 60,
};

const sourceCard: React.CSSProperties = {
  background: "#f0f0f0",
  padding: 16,
  borderRadius: 15,
  textAlign: "center",
  marginBottom: 20,
};

// OVERLAY y contenedor principal
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "#ffffff",
  zIndex: 5000,
  display: "flex",
  justifyContent: "center",
  alignItems: "stretch",
  overflow: "hidden",
  fontFamily: "sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: 600,
  width: "100%",
  margin: "0 auto",
  padding: "20px 16px 80px",
  display: "flex",
  flexDirection: "column",
  maxHeight: "100vh",
  overflowY: "auto",
  boxSizing: "border-box",
};

const progressBarContainer: React.CSSProperties = {
  width: "100%",
  height: 12,
  background: "#e5e5e5",
  borderRadius: 10,
  marginBottom: 20,
};

const progressBar: React.CSSProperties = {
  height: "100%",
  background: "#58cc02",
  borderRadius: 10,
  transition: "width 0.3s ease",
};

const questionTitle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#3c3c3c",
  marginBottom: 10,
};

const sourceText: React.CSSProperties = {
  fontSize: "1.4rem",
  color: "#4b4b4b",
  marginBottom: 10,
  fontWeight: "bold",
};

const optionsGrid: React.CSSProperties = {
  display: "grid",
  gap: 15,
  marginTop: 20,
};

const optionCard: React.CSSProperties = {
  padding: 15,
  borderRadius: 16,
  border: "2px solid #e5e5e5",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.1s",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const imageWrapper: React.CSSProperties = {
  width: "100%",
  height: 100,
  marginBottom: 10,
  display: "flex",
  justifyContent: "center",
};

const responsiveImg: React.CSSProperties = {
  maxHeight: "100%",
  maxWidth: "100%",
  objectFit: "contain",
};

const audioBtn: React.CSSProperties = {
  padding: "8px 15px",
  borderRadius: 10,
  border: "2px solid #1cb0f6",
  background: "#fff",
  color: "#1cb0f6",
  fontWeight: "bold",
  cursor: "pointer",
};

const sentenceBox: React.CSSProperties = {
  minHeight: 80,
  borderBottom: "2px solid #e5e5e5",
  padding: 10,
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 20,
};

const wordsPool: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "center",
};

const chip: React.CSSProperties = {
  padding: "10px 15px",
  borderRadius: 10,
  border: "2px solid #e5e5e5",
  background: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 2px 0 #e5e5e5",
};

const chipSelected: React.CSSProperties = {
  ...chip,
  background: "#ddf4ff",
  borderColor: "#84d8ff",
  boxShadow: "0 2px 0 #84d8ff",
};

const writingTextarea: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "2px solid #e5e5e5",
  fontSize: "1rem",
  fontWeight: 600,
  resize: "vertical",
  minHeight: 80,
  boxSizing: "border-box",
};

const footer: React.CSSProperties = {
  position: "sticky",
  bottom: 0,
  marginTop: 16,
  paddingTop: 12,
  paddingBottom: 8,
  borderTop: "2px solid #e5e5e5",
  background: "white",
};

const feedbackBox: React.CSSProperties = {
  padding: 15,
  borderRadius: 12,
  marginBottom: 15,
  border: "2px solid",
};

const mainBtn: React.CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 16,
  border: "none",
  color: "white",
  fontWeight: "bold",
  fontSize: "1.1rem",
  cursor: "pointer",
  boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
};

/* ========== HEADER (corazones + X) ========== */

const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const heartsBox: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#fff",
  border: "2px solid #ffe0e0",
  boxShadow: "0 2px 0 rgba(0,0,0,0.05)",
};

const heartTimerText: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#888",
};

const closeBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "2px solid #e5e5e5",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* ========== MODAL DE CONFIRMACIÓN DE SALIDA ========== */

const confirmOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 6000,
};

const confirmCardStyle: React.CSSProperties = {
  background: "white",
  padding: 20,
  borderRadius: 18,
  border: "2px solid #e5e5e5",
  maxWidth: 360,
  width: "90%",
};