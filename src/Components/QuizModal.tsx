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
    isOpen, questions, lessonId, userProfile, heartTimer, onClose, onUpdateProfile,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setSelectedOption(null);
            setIsAnswered(false);
            if (userProfile.heartsCount <= 0) setShowNoHeartsModal(true);
        }
    }, [isOpen, userProfile.heartsCount]);

    const currentQuestion = questions[currentIndex];

    const handleCheckAnswer = async () => {
        if (!selectedOption || isSyncing || !currentQuestion) return;
        setIsSyncing(true);
        const correct = selectedOption === currentQuestion.textTarget;
        setIsCorrect(correct);
        setIsAnswered(true);

        if (!correct) {
            try {
                const updatedProfile = await subtractHeart();
                onUpdateProfile(updatedProfile);
                if (updatedProfile.heartsCount <= 0) setShowNoHeartsModal(true);
            } catch {
                console.error("Fallo al restar corazón");
            }
        }
        setIsSyncing(false);
    };

    const handleNextQuestion = async () => {
        if (currentIndex < questions.length - 1) {
            setIsAnswered(false);
            setSelectedOption(null);
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsSyncing(true);
            try {
                // Notificar al backend la finalización
                await completeLesson(lessonId, questions.length);
                onClose(true); // Cierra notificando éxito para recargar unidades
            } catch (error) {
                console.error("Error al finalizar", error);
                onClose(false);
            } finally {
                setIsSyncing(false);
            }
        }
    };

    if (!isOpen || !currentQuestion) return null;

    return (
        <div style={overlayStyle}>
            <div style={containerStyle}>
                {/* Header con Progreso */}
                <div style={headerStyle}>
                    <button onClick={() => onClose(false)} style={closeBtn}>✕</button>
                    <div style={progressWrapper}>
                        <div style={{ ...progressFill, width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                    </div>
                    <div style={heartsBox}>❤️ {userProfile.heartsCount}</div>
                </div>

                <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Footer de Feedback */}
                <div style={{ ...feedbackBar, background: isAnswered ? (isCorrect ? "#d7ffb8" : "#ffdfe0") : "white" }}>
                    <div style={footerContent}>
                        {isAnswered && (
                            <div style={{ color: isCorrect ? "#58cc02" : "#ff4b4b", fontWeight: "900" }}>
                                {isCorrect ? "¡Excelente!" : `Incorrecto. Era: ${currentQuestion.textTarget}`}
                            </div>
                        )}
                        <button
                            onClick={isAnswered ? handleNextQuestion : handleCheckAnswer}
                            disabled={!selectedOption || isSyncing}
                            style={primaryBtn}
                        >
                            {isAnswered ? (currentIndex === questions.length - 1 ? "FINALIZAR" : "CONTINUAR") : "COMPROBAR"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Reintento si no hay vidas */}
            <AnimatePresence>
                {showNoHeartsModal && (
                    <motion.div style={noHeartsOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={noHeartsContent}>
                            <h2>💔 ¡Sin vidas!</h2>
                            <p>Espera a: {heartTimer}</p>
                            <button onClick={() => onClose(false)} style={primaryBtn}>SALIR</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Estilos rápidos (puedes moverlos a CSS)
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "#fff", zIndex: 5000 };
const containerStyle: React.CSSProperties = { maxWidth: 600, margin: "0 auto", padding: "2rem" };
const headerStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 20, marginBottom: 40 };
const progressWrapper: React.CSSProperties = { flex: 1, height: 14, background: "#E5E5E5", borderRadius: 10 };
const progressFill: React.CSSProperties = { height: "100%", background: "#58CC02", borderRadius: 10, transition: "width 0.3s" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", fontSize: 24, cursor: "pointer" };
const heartsBox: React.CSSProperties = { fontWeight: "bold", color: "#ff4b4b" };
const questionText: React.CSSProperties = { fontSize: "1.8rem", fontWeight: "bold", margin: "40px 0" };
const optionsGrid: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const optionStyle: React.CSSProperties = { padding: "16px", borderRadius: 12, fontSize: "1.1rem", textAlign: "left", cursor: "pointer" };
const feedbackBar: React.CSSProperties = { position: "fixed", bottom: 0, left: 0, right: 0, padding: "30px", borderTop: "2px solid #E5E5E5" };
const footerContent: React.CSSProperties = { maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" };
const primaryBtn: React.CSSProperties = { padding: "12px 40px", borderRadius: 12, border: "none", background: "#58CC02", color: "#fff", fontWeight: "bold", cursor: "pointer" };
const noHeartsOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 6000 };
const noHeartsContent: React.CSSProperties = { background: "#fff", padding: 40, borderRadius: 20, textAlign: "center" };