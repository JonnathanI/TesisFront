// src/Students/EvaluationPlayer.tsx
import React, { useState, useEffect, CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiX, FiVolume2, FiCheck } from "react-icons/fi";
import {
  getEvaluationDetails,
  submitEvaluationResult,
} from "../api/auth.service";

const IconX = FiX as any;
const IconVolume = FiVolume2 as any;
const IconCheck = FiCheck as any;

type ParsedOption = {
  value: string;
  imageUrl?: string | null;
};

type LocalAnswer = {
  questionId: string;
  answerText: string;
};

// 👉 helper para parsear opciones (texto plano o JSON con imageUrl)
function parseOption(raw: string): ParsedOption {
  try {
    const obj = JSON.parse(raw);
    return {
      value: obj.value ?? raw,
      imageUrl: obj.imageUrl ?? null,
    };
  } catch {
    return { value: raw, imageUrl: null };
  }
}

export function EvaluationPlayer() {
  const { id } = useParams<{ id: string }>(); // id = assignmentId
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");

  const [selectedOptionIndex, setSelectedOptionIndex] =
    useState<number | null>(null);

  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  const [isCompleted, setIsCompleted] = useState(false);
  const [answers, setAnswers] = useState<LocalAnswer[]>([]);

  const getTypeName = (q: any): string => {
    if (!q) return "";
    if (typeof q.questionType === "string") {
      return q.questionType.toUpperCase();
    }
    if (q.questionType?.typeName) {
      return String(q.questionType.typeName).toUpperCase();
    }
    return "";
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getEvaluationDetails(id)
      .then((data: any) => {
        if (data?.questions?.length > 0) {
          setQuestions(data.questions);
          const completedFlag = !!data.completed;
          setIsCompleted(completedFlag);

          if (completedFlag) {
            // rellenamos respuestas locales con lo que venga del backend
            const existingAnswers: LocalAnswer[] = data.questions
              .filter((q: any) => q.studentAnswer)
              .map((q: any) => ({
                questionId: q.id,
                answerText: q.studentAnswer as string,
              }));
            setAnswers(existingAnswers);
          }

          setupQuestion(data.questions[0], completedFlag);
        }
      })
      .catch((err) => {
        console.error("Error cargando evaluación:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const setupQuestion = (question: any, completedMode: boolean) => {
    if (!question) return;

    const typeName = getTypeName(question);

    if (typeName === "ORDERING") {
      const words = (question.textTarget || "")
        .split(" ")
        .filter((w: string) => w.trim().length > 0);

      setAvailableWords(words);

      if (completedMode && question.studentAnswer) {
        setSelectedWords(
          (question.studentAnswer as string)
            .split(" ")
            .filter((w: string) => w.trim().length > 0)
        );
      } else {
        setSelectedWords([]);
      }
    } else {
      setAvailableWords([]);
      setSelectedWords([]);
    }

    // Texto libre
    if (completedMode && question.studentAnswer) {
      setUserInput(question.studentAnswer as string);
    } else {
      setUserInput("");
    }

    // Selección (imagen / opción)
    if (completedMode && question.studentAnswer && question.options) {
      const parsedOptions: ParsedOption[] = (question.options || []).map(
        (raw: string) => parseOption(raw)
      );
      const idx = parsedOptions.findIndex(
        (opt: ParsedOption) =>
          opt.value.trim().toLowerCase() ===
          (question.studentAnswer as string).trim().toLowerCase()
      );
      setSelectedOptionIndex(idx >= 0 ? idx : null);
    } else {
      setSelectedOptionIndex(null);
    }

    // Feedback al reabrir evaluación completada
    if (completedMode && typeof question.isCorrect === "boolean") {
      setFeedback({
        isCorrect: question.isCorrect,
        message: question.isCorrect
          ? "Respuesta correcta."
          : `Tu respuesta: "${question.studentAnswer ?? ""}"`,
      });
    } else {
      setFeedback(null);
    }
  };

  const handlePlayAudio = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ?.audioUrl) return;
    const audio = new Audio(currentQ.audioUrl);
    audio
      .play()
      .catch((e) => console.warn("No se pudo reproducir el audio:", e));
  };

  const handleCheck = () => {
    if (isCompleted) return; // en modo detalle no hacemos nada

    const currentQ = questions[currentIndex];
    const typeName = getTypeName(currentQ);

    const correctText = (currentQ.textTarget || "").trim().toLowerCase();
    let isCorrect = false;
    let rawAnswer = "";

    const isOrdering = typeName === "ORDERING";
    const isSelectType =
      typeName === "IMAGE_SELECT" ||
      typeName === "SELECT_ONE" ||
      typeName === "MULTIPLE_CHOICE";

    if (isOrdering) {
      rawAnswer = selectedWords.join(" ");
      isCorrect = rawAnswer.trim().toLowerCase() === correctText;
    } else if (isSelectType) {
      if (selectedOptionIndex === null) {
        setFeedback({
          isCorrect: false,
          message: "Primero selecciona una opción.",
        });
        return;
      }
      const parsedOptions: ParsedOption[] = (currentQ.options || []).map(
        (raw: string) => parseOption(raw)
      );
      const displayOptions = parsedOptions.filter(
        (opt: ParsedOption) =>
          opt.value.trim() !== "" ||
          (opt.imageUrl && opt.imageUrl.trim() !== "")
      );
      const selected = displayOptions[selectedOptionIndex];
      rawAnswer = selected?.value || "";
      const selectedValue = rawAnswer.trim().toLowerCase();
      isCorrect = selectedValue === correctText;
    } else {
      rawAnswer = userInput;
      isCorrect = rawAnswer.trim().toLowerCase() === correctText;
    }

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    // Guardamos en el estado local de respuestas
    setAnswers((prev) => {
      const withoutCurrent = prev.filter(
        (a) => a.questionId !== currentQ.id
      );
      return [...withoutCurrent, { questionId: currentQ.id, answerText: rawAnswer }];
    });

    // Actualizamos también la pregunta actual con studentAnswer/isCorrect
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, studentAnswer: rawAnswer, isCorrect } : q
      )
    );

    setFeedback({
      isCorrect,
      message: isCorrect
        ? "¡Excelente! ✅"
        : `Incorrecto. La respuesta correcta era: "${currentQ.textTarget}"`,
    });
  };

  const handleNext = async () => {
    if (isCompleted) {
      navigate(-1);
      return;
    }

    if (currentIndex + 1 < questions.length) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setupQuestion(questions[next], false);
      return;
    }

    const totalQuestions = questions.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);

    try {
      if (id) {
        // 👇 Asegúrate de que tu backend acepte también "answers"
        await submitEvaluationResult(id, {
          score,
          status: "COMPLETED",
          // @ts-ignore -> agrega esto a tu tipo en auth.types
          answers,
        });
        alert(`¡Evaluación finalizada! Tu puntaje: ${score}%`);
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Error al enviar resultado:", err);
      alert("Error al enviar resultados de la evaluación");
    }
  };

  if (loading) {
    return (
      <div style={loadingWrapper}>
        <p style={loadingText}>Cargando evaluación…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={loadingWrapper}>
        <p style={loadingText}>No se encontraron preguntas.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const typeName = getTypeName(currentQ);

  const isOrdering = typeName === "ORDERING";
  const isListeningLike =
    typeName === "LISTENING" ||
    typeName === "AUDIO_SELECT" ||
    typeName === "SPEAKING";
  const isSelectType =
    typeName === "IMAGE_SELECT" ||
    typeName === "SELECT_ONE" ||
    typeName === "MULTIPLE_CHOICE";

  const progress = ((currentIndex + 1) / questions.length) * 100;

  const parsedOptions: ParsedOption[] = (currentQ.options || []).map(
    (raw: string) => parseOption(raw)
  );
  const displayOptions = parsedOptions.filter(
    (opt: ParsedOption) =>
      opt.value.trim() !== "" ||
      (opt.imageUrl && opt.imageUrl.trim() !== "")
  );

  return (
    <div style={pageWrapper}>
      {/* Barra superior */}
      <div style={topBar}>
        <button onClick={() => navigate(-1)} style={backButton}>
          <IconX size={22} />
        </button>

        <div style={progressBarOuter}>
          <div
            style={{ ...progressBarInner, width: `${progress}%` }}
          />
        </div>

        <span style={progressText}>
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      {/* Tarjeta principal */}
      <div style={cardWrapper}>
        <div style={cardHeader}>
          <span style={typePill}>{typeName || "Pregunta"}</span>

          {isListeningLike && currentQ.audioUrl && (
            <button onClick={handlePlayAudio} style={audioButton}>
              <IconVolume />
              <span>Escuchar</span>
            </button>
          )}
        </div>

        <h2 style={questionTitle}>
          {isCompleted
            ? "Detalle de la evaluación"
            : isListeningLike
            ? "Escribe lo que escuchas"
            : isOrdering
            ? "Ordena la frase correctamente"
            : "Responde la siguiente pregunta"}
        </h2>

        {isCompleted && (
          <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
            Esta evaluación ya fue completada. Aquí puedes ver tus respuestas.
          </p>
        )}

        {currentQ.textSource && (
          <p style={questionSubtitle}>{currentQ.textSource}</p>
        )}

        {/* Zona de respuesta para texto / ordering */}
        {!isSelectType && (
          <div style={answerBox}>
            {isOrdering ? (
              selectedWords.length === 0 ? (
                <span style={hintText}>
                  Pulsa las palabras de abajo para armar la frase.
                </span>
              ) : (
                selectedWords.map((w: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isCompleted) return;
                      setSelectedWords(
                        selectedWords.filter((_, idx) => idx !== i)
                      );
                      setAvailableWords([...availableWords, w]);
                    }}
                    style={wordSelected}
                  >
                    {w}
                  </button>
                ))
              )
            ) : (
              <textarea
                style={textArea}
                rows={3}
                placeholder={
                  isListeningLike
                    ? "Escribe aquí lo que escuchas..."
                    : "Escribe tu respuesta aquí..."
                }
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isCompleted}
                readOnly={isCompleted}
              />
            )}
          </div>
        )}

        {/* Palabras disponibles para ORDERING */}
        {isOrdering && (
          <div style={wordsPool}>
            {availableWords.map((w: string, i: number) => (
              <button
                key={i}
                onClick={() => {
                  if (isCompleted) return;
                  setSelectedWords([...selectedWords, w]);
                  setAvailableWords(
                    availableWords.filter((_, idx) => idx !== i)
                  );
                }}
                style={wordOption}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {/* Opciones con imagen / selección */}
        {isSelectType && (
          <div style={optionsGrid}>
            {displayOptions.map(
              (opt: ParsedOption, idx: number) => {
                const isSelected = selectedOptionIndex === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isCompleted) return;
                      setSelectedOptionIndex(idx);
                    }}
                    style={{
                      ...optionCard,
                      borderColor: isSelected ? "#1cb0f6" : "#e5e5e5",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(28,176,246,0.25)"
                        : "0 3px 8px rgba(0,0,0,0.04)",
                      transform: isSelected
                        ? "translateY(-2px)"
                        : "translateY(0)",
                    }}
                    disabled={isCompleted}
                  >
                    {opt.imageUrl && (
                      <img
                        src={opt.imageUrl}
                        alt={opt.value}
                        style={optionImage}
                      />
                    )}
                    <span style={optionText}>{opt.value}</span>
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Barra inferior */}
      <div style={bottomBar}>
        <div style={feedbackBox}>
          {feedback && (
            <p
              style={{
                ...feedbackTextBase,
                color: feedback.isCorrect ? "#2f855a" : "#c53030",
              }}
            >
              {feedback.message}
            </p>
          )}
        </div>
        <button
          onClick={
            isCompleted
              ? () => navigate(-1)
              : feedback
              ? handleNext
              : handleCheck
          }
          style={primaryButton}
        >
          {isCompleted ? (
            "Volver"
          ) : feedback ? (
            "Continuar"
          ) : (
            <>
              <IconCheck style={{ marginRight: 6 }} />
              Comprobar
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ======================
   ESTILOS INLINE
====================== */

const pageWrapper: CSSProperties = {
  minHeight: "100vh",
  background: "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px",
  boxSizing: "border-box",
};

const topBar: CSSProperties = {
  width: "100%",
  maxWidth: 960,
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 24,
};

const backButton: CSSProperties = {
  border: "none",
  background: "#ffffff",
  borderRadius: 999,
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
  cursor: "pointer",
};

const progressBarOuter: CSSProperties = {
  flex: 1,
  height: 8,
  background: "#e5e5e5",
  borderRadius: 999,
  overflow: "hidden",
};

const progressBarInner: CSSProperties = {
  height: "100%",
  background: "#58cc02",
  borderRadius: 999,
  transition: "width 0.3s ease",
};

const progressText: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#777",
};

const cardWrapper: CSSProperties = {
  width: "100%",
  maxWidth: 960,
  background: "#ffffff",
  borderRadius: 32,
  padding: 32,
  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  boxSizing: "border-box",
};

const cardHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const typePill: CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 2,
  fontWeight: 900,
  color: "#999",
};

const audioButton: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: "none",
  borderRadius: 999,
  padding: "8px 14px",
  background: "#1cb0f6",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 3px 0 #1899d6",
};

const questionTitle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  margin: "4px 0 8px",
  color: "#333",
};

const questionSubtitle: CSSProperties = {
  fontSize: 16,
  color: "#555",
  marginBottom: 20,
};

const answerBox: CSSProperties = {
  minHeight: 120,
  borderRadius: 20,
  border: "2px solid #e5e5e5",
  background: "#fafafa",
  padding: 16,
  marginBottom: 16,
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 8,
  boxSizing: "border-box",
};

const hintText: CSSProperties = {
  fontSize: 13,
  color: "#999",
};

const textArea: CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  resize: "none",
  background: "transparent",
  fontSize: 18,
  fontWeight: 600,
  textAlign: "center",
};

const wordsPool: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  justifyContent: "center",
};

const wordOption: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "2px solid #ddd",
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const wordSelected: CSSProperties = {
  ...wordOption,
  borderColor: "#1cb0f6",
  background: "#ddf4ff",
};

const optionsGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginTop: 8,
};

const optionCard: CSSProperties = {
  borderRadius: 24,
  border: "2px solid #e5e5e5",
  padding: 12,
  background: "#fff",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 8,
  transition: "all 0.15s ease",
};

const optionImage: CSSProperties = {
  width: "100%",
  height: 220,
  objectFit: "contain",
  borderRadius: 18,
};

const optionText: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#333",
};

const bottomBar: CSSProperties = {
  width: "100%",
  maxWidth: 960,
  marginTop: 24,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
};

const feedbackBox: CSSProperties = {
  minHeight: 24,
  flex: 1,
};

const feedbackTextBase: CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
};

const primaryButton: CSSProperties = {
  border: "none",
  borderRadius: 20,
  padding: "12px 26px",
  background: "#58cc02",
  color: "#fff",
  fontWeight: 900,
  fontSize: 14,
  textTransform: "uppercase",
  boxShadow: "0 4px 0 #46a302",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
};

const loadingWrapper: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f5f5",
};

const loadingText: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "#1cb0f6",
};
