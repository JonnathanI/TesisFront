import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiX, FiVolume2, FiCheck } from "react-icons/fi";
import { getEvaluationDetails, submitEvaluationResult } from "../api/auth.service";

const IconX = FiX as any;
const IconVolume = FiVolume2 as any;
const IconCheck = FiCheck as any;

export function EvaluationPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getEvaluationDetails(id)
      .then((data: any) => {
        // ✅ AQUÍ ESTABA EL ERROR
        if (data?.questions?.length > 0) {
          setQuestions(data.questions);
          setupQuestion(data.questions[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando evaluación:", err);
        setLoading(false);
      });
  }, [id]);

  const setupQuestion = (question: any) => {
    if (!question) return;

    if (question.questionType?.typeName === "ORDERING") {
      const words = (question.textTarget || "")
        .split(" ")
        .sort(() => Math.random() - 0.5);
      setAvailableWords(words);
      setSelectedWords([]);
    }

    setUserInput("");
    setFeedback(null);
  };

  const handleCheck = () => {
    const currentQ = questions[currentIndex];
    const correctText = (currentQ.textTarget || "").trim().toLowerCase();
    let isCorrect = false;

    if (currentQ.questionType?.typeName === "ORDERING") {
      isCorrect = selectedWords.join(" ").toLowerCase() === correctText;
    } else {
      isCorrect = userInput.trim().toLowerCase() === correctText;
    }

    if (isCorrect) setCorrectCount(prev => prev + 1);

    setFeedback({
      isCorrect,
      message: isCorrect
        ? "¡Excelente!"
        : `Incorrecto. Era: "${currentQ.textTarget}"`
    });
  };

  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setupQuestion(questions[next]);
    } else {
      const score = Math.round((correctCount / questions.length) * 100);

      try {
        if (id) {
          await submitEvaluationResult(id, {
            score,
            status: "COMPLETED"
          });
          alert("¡Evaluación finalizada!");
          navigate("/student/dashboard");
        }
      } catch (err) {
        console.error("Error al enviar resultado:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-black text-[#1cb0f6] animate-pulse">
        CARGANDO...
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="p-20 text-center">No se encontraron preguntas.</div>;
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      {/* Barra de progreso */}
      <div className="w-full max-w-4xl flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)}>
          <IconX size={28} className="text-gray-400" />
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl flex-1">
        <h2 className="text-2xl font-black mb-8">
          {currentQ.questionType?.typeName === "ORDERING"
            ? "Ordena la frase correctamente"
            : "Escribe lo que escuchas"}
        </h2>

        <div className="min-h-[150px] border-b-2 border-gray-200 mb-8 flex flex-wrap gap-2 justify-center">
          {currentQ.questionType?.typeName === "ORDERING" ? (
            selectedWords.map((w, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedWords(selectedWords.filter((_, idx) => idx !== i));
                  setAvailableWords([...availableWords, w]);
                }}
                className="border-2 px-4 py-2 rounded-xl font-bold"
              >
                {w}
              </button>
            ))
          ) : (
            <textarea
              className="w-full text-center text-xl font-bold outline-none resize-none"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
            />
          )}
        </div>

        {currentQ.questionType?.typeName === "ORDERING" && (
          <div className="flex flex-wrap gap-3 justify-center">
            {availableWords.map((w, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedWords([...selectedWords, w]);
                  setAvailableWords(availableWords.filter((_, idx) => idx !== i));
                }}
                className="border-2 px-5 py-3 rounded-2xl font-bold"
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 border-t-2 bg-white">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            {feedback && (
              <p
                className={`font-black text-xl ${
                  feedback.isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {feedback.message}
              </p>
            )}
          </div>
          <button
            onClick={feedback ? handleNext : handleCheck}
            className="bg-green-500 text-white px-12 py-4 rounded-2xl font-black"
          >
            {feedback ? "CONTINUAR" : "COMPROBAR"}
          </button>
        </div>
      </div>
    </div>
  );
}
