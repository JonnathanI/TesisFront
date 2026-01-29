import React, { useState, useEffect } from "react"; // Soluciona error: useState
import { useParams, useNavigate } from "react-router-dom";
import { getEvaluationAssignment, submitEvaluationResult } from "../api/auth.service"; // Soluciona error: completeEvaluation

export function EvaluationPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Estados
    const [currentQuestionIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState("");
    const [assignment, setAssignment] = useState<any>(null);
    const [correctAnswers, setCorrectAnswers] = useState(0); // Para calcular el score
    const [loading, setLoading] = useState(true);

    // Cargar datos al iniciar
    useEffect(() => {
        if (id) {
            getEvaluationAssignment(id)
                .then((data) => {
                    setAssignment(data);
                    setLoading(false);
                })
                .catch(() => navigate("/dashboard"));
        }
    }, [id, navigate]);

    if (loading || !assignment) {
        return <div className="flex items-center justify-center h-screen font-black text-[#afafaf]">CARGANDO EXAMEN...</div>;
    }

    const questions = assignment.evaluation.questions;
    const currentQ = questions[currentQuestionIdx];

    const handleCheck = async () => {
        const isCorrect = selectedOption === currentQ.textTarget;
        
        // Si es correcta, sumamos al contador
        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
        }

        if (currentQuestionIdx < questions.length - 1) {
            // Solucionado error: era currentQuestionIdx, no currentIdx
            setCurrentIdx(prev => prev + 1); 
            setSelectedOption("");
        } else {
            // Solucionado error: Definimos score y usamos la función correcta del service
            const finalCorrects = isCorrect ? correctAnswers + 1 : correctAnswers;
            const score = (finalCorrects / questions.length) * 100;
            
            try {
                await submitEvaluationResult(assignment.id, score);
                alert(`¡Examen finalizado! Tu puntaje: ${score.toFixed(0)}%`);
                navigate("/dashboard");
            } catch (error) {
                alert("Error al guardar el resultado");
            }
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col p-6 font-sans">
            {/* Barra de Progreso */}
            <div className="max-w-4xl mx-auto w-full flex items-center gap-4 mb-12">
                <div className="flex-1 h-4 bg-[#e5e5e5] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#58cc02] transition-all duration-500" 
                        style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="max-w-2xl mx-auto w-full flex-1">
                <h2 className="text-2xl font-black text-[#3c3c3c] mb-8">
                    {currentQ.textSource}
                </h2>

                <div className="grid grid-cols-1 gap-3">
                    {/* Solucionado error: tipado de 'opt' como string */}
                    {currentQ.options.map((opt: string, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedOption(opt)}
                            className={`p-4 rounded-2xl border-2 font-bold text-left transition-all ${
                                selectedOption === opt 
                                ? "border-[#84d8ff] bg-[#ddf4ff] text-[#1899d6]" 
                                : "border-[#e5e5e5] hover:bg-[#f7f7f7] text-[#4b4b4b] active:translate-y-1"
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t-2 border-[#e5e5e5] p-6">
                <button 
                    disabled={!selectedOption}
                    onClick={handleCheck}
                    className="max-w-4xl mx-auto w-full py-4 bg-[#58cc02] disabled:bg-[#e5e5e5] text-white font-black rounded-2xl shadow-[0_4px_0_#46a302] uppercase transition-all active:translate-y-1 active:shadow-none"
                >
                    {currentQuestionIdx === questions.length - 1 ? "Finalizar" : "Siguiente"}
                </button>
            </div>
        </div>
    );
}