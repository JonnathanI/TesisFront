import React, { useEffect, useState } from "react";
import {
  //QuestionDTO,
  completeLesson,
  subtractHeart,
  //UserProfileData,
} from "../api/auth.service";
import { QuestionDTO,  UserProfileData} from "../api/auth.types";

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

  /* ====== ESTADOS SPEAKING ====== */
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  /* ====== ORDENAR ====== */
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [orderedWords, setOrderedWords] = useState<string[]>([]);

  const currentQuestion = questions[currentIndex];
  const type = currentQuestion?.questionType?.typeName;

  const optionsSafe = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : [];

  /* ================== LÓGICA RECONOCIMIENTO DE VOZ ================== */
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el reconocimiento de voz. Prueba con Chrome.");
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
      setSelectedOption(current); // La voz capturada se vuelve nuestra opción seleccionada
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
    setTranscript(""); // Limpiar lo que el usuario dijo
    setIsListening(false);

    if (type === "WRITING" || type === "ORDERING" || type === "TRANSLATION_TO_TARGET") {
      if (optionsSafe.length > 0) {
        const parsedOptions = optionsSafe.map((opt: any) => {
          try {
            const parsed = typeof opt === "string" && opt.startsWith("{") ? JSON.parse(opt) : opt;
            return typeof parsed === "object" ? (parsed.value || parsed.text) : parsed;
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
  }, [currentIndex, currentQuestion, type, isOpen]);

  /* ================== CHECK ================== */
  const handleCheckAnswer = async () => {
    if (isSyncing || !currentQuestion) return;

    setIsSyncing(true);
    let correct = false;

    const target = currentQuestion.textTarget.trim().toLowerCase().replace(/[.,?!]/g, "");
    const answer = (type === "WRITING" || type === "ORDERING") 
        ? orderedWords.join(" ").trim().toLowerCase() 
        : (selectedOption || "").trim().toLowerCase().replace(/[.,?!]/g, "");

    correct = answer === target;

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
        <div style={progressBarContainer}>
          <div style={{ ...progressBar, width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <h2 style={questionTitle}>
          {type === "SPEAKING" ? "Escucha y repite la frase" : 
           (type === "WRITING" || type === "ORDERING" ? "Ordena la frase correctamente" : "Selecciona la opción correcta")}
        </h2>

        <div style={sourceCard}>
           <p style={sourceText}>"{currentQuestion.textSource}"</p>
           {currentQuestion.audioUrl && (
             <button onClick={() => new Audio(currentQuestion.audioUrl).play()} style={audioBtn}>
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
            <p style={{ marginTop: 10, color: "#777", fontWeight: "bold" }}>
              {isListening ? "Escuchando..." : "Toca el micro para hablar"}
            </p>

            <div style={transcriptDisplay}>
              <span style={{ fontSize: "0.8rem", color: "#afafaf", display: "block" }}>Tu pronunciación:</span>
              <strong>{transcript || "..."}</strong>
            </div>
          </div>
        ) : (type === "WRITING" || type === "ORDERING") ? (
          /* VISTA DE ORDENAR */
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
          /* VISTA DE OPCIONES (GRID) */
          <div style={{ ...optionsGrid, gridTemplateColumns: type === "IMAGE_SELECT" ? "repeat(2, 1fr)" : "1fr" }}>
            {optionsSafe.map((opt: any, idx: number) => {
              let text = ""; let img = null;
              try {
                const parsed = typeof opt === "string" && opt.startsWith("{") ? JSON.parse(opt) : opt;
                text = typeof parsed === "object" ? (parsed.value || parsed.text) : parsed;
                img = typeof parsed === "object" ? parsed.imageUrl : null;
              } catch (e) { text = opt; }

              const isSelected = selectedOption === text;
              return (
                <button
                  key={idx}
                  style={{ ...optionCard, background: isSelected ? "#ddf4ff" : "white", borderColor: isSelected ? "#84d8ff" : "#e5e5e5" }}
                  onClick={() => setSelectedOption(text)}
                  disabled={isAnswered}
                >
                  {img && <div style={imageWrapper}><img src={img} alt={text} style={responsiveImg} /></div>}
                  <div style={{ fontSize: "1.1rem", color: isSelected ? "#1899d6" : "#4b4b4b" }}>{text}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div style={footer}>
          {isAnswered && (
            <div style={{ ...feedbackBox, background: isCorrect ? "#d7ffb8" : "#ffdfe0", borderColor: isCorrect ? "#58cc02" : "#ff4b4b" }}>
              <p style={{ color: isCorrect ? "#258300" : "#ea2b2b", fontWeight: "bold", margin: 0 }}>
                {isCorrect ? "¡Excelente!" : `Casi, lo correcto era: "${currentQuestion.textTarget}"`}
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

/* ================== ESTILOS ADICIONALES ================== */
const speakingContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20
};

const micBtn: React.CSSProperties = {
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: "none",
    color: "white",
    fontSize: "2rem",
    cursor: "pointer",
    transition: "all 0.2s ease"
};

const transcriptDisplay: React.CSSProperties = {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    background: "#f9f9f9",
    border: "2px dashed #e5e5e5",
    width: "100%",
    textAlign: "center",
    fontSize: "1.2rem",
    minHeight: 60
};

const sourceCard: React.CSSProperties = {
    background: "#f0f0f0",
    padding: 20,
    borderRadius: 15,
    textAlign: "center" as const,
    marginBottom: 20
};

// ... (se mantienen los estilos que ya tenías)
const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "#fff", zIndex: 5000, overflowY: "auto", fontFamily: "sans-serif" };
const container: React.CSSProperties = { maxWidth: 600, margin: "0 auto", padding: "20px", display: "flex", flexDirection: "column", minHeight: "100vh" };
const progressBarContainer: React.CSSProperties = { width: "100%", height: 12, background: "#e5e5e5", borderRadius: 10, marginBottom: 30 };
const progressBar: React.CSSProperties = { height: "100%", background: "#58cc02", borderRadius: 10, transition: "width 0.3s ease" };
const questionTitle: React.CSSProperties = { fontSize: "1.5rem", fontWeight: "bold", color: "#3c3c3c", marginBottom: 10 };
const sourceText: React.CSSProperties = { fontSize: "1.4rem", color: "#4b4b4b", marginBottom: 10, fontWeight: "bold" };
const optionsGrid: React.CSSProperties = { display: "grid", gap: 15, marginTop: 20 };
const optionCard: React.CSSProperties = { padding: "15px", borderRadius: 16, border: "2px solid #e5e5e5", fontWeight: "bold", cursor: "pointer", transition: "all 0.1s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const imageWrapper: React.CSSProperties = { width: "100%", height: 100, marginBottom: 10, display: "flex", justifyContent: "center" };
const responsiveImg: React.CSSProperties = { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" };
const audioBtn: React.CSSProperties = { padding: "8px 15px", borderRadius: 10, border: "2px solid #1cb0f6", background: "#fff", color: "#1cb0f6", fontWeight: "bold", cursor: "pointer" };
const sentenceBox: React.CSSProperties = { minHeight: 100, borderBottom: "2px solid #e5e5e5", padding: 10, display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 };
const wordsPool: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" };
const chip: React.CSSProperties = { padding: "10px 15px", borderRadius: 10, border: "2px solid #e5e5e5", background: "#fff", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 0 #e5e5e5" };
const chipSelected: React.CSSProperties = { ...chip, background: "#ddf4ff", borderColor: "#84d8ff", boxShadow: "0 2px 0 #84d8ff" };
const footer: React.CSSProperties = { marginTop: "auto", paddingTop: 20, borderTop: "2px solid #e5e5e5" };
const feedbackBox: React.CSSProperties = { padding: 15, borderRadius: 12, marginBottom: 15, border: "2px solid" };
const mainBtn: React.CSSProperties = { width: "100%", padding: "16px", borderRadius: 16, border: "none", color: "white", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 4px 0 rgba(0,0,0,0.2)" };