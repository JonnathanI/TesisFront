import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    QuestionDTO,
    completeLesson,
    subtractHeart,
    UserProfileData,
} from "../api/auth.service";

interface QuizModalProps {
    isOpen: boolean;
    questions: QuestionDTO[];
    lessonId: string;
    userProfile: UserProfileData;
    heartTimer: string;
    onClose: (completed: boolean, score: number, total: number) => void;
}

const IconX = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const IconHeart = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff4b4b">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

export const QuizModal: React.FC<QuizModalProps> = ({
    isOpen,
    questions,
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
    const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setSelectedOption(null);
            setIsAnswered(false);
            setScore(0);
            if (userProfile.heartsCount <= 0) setShowNoHeartsModal(true);
        }
    }, [isOpen, userProfile.heartsCount]);

    const currentQuestion = questions[currentIndex];
    const progressPercentage = (currentIndex / questions.length) * 100;

    const handleCheckAnswer = async () => {
        if (!selectedOption || isSyncing || !currentQuestion) return;

        setIsSyncing(true);
        const correct = selectedOption === currentQuestion.textTarget;
        setIsCorrect(correct);
        setIsAnswered(true);

        if (correct) {
            setScore(prev => prev + 1);
        } else {
            try {
                const updatedProfile = await subtractHeart();
                if (updatedProfile.heartsCount <= 0) {
                    setShowNoHeartsModal(true);
                }
            } catch (error) {
                console.error("Error al restar corazón:", error);
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
                const mistakes = questions.length - score;
                await completeLesson(lessonId, score, mistakes);
                onClose(true, score, questions.length);
            } catch (error) {
                onClose(false, 0, questions.length);
            } finally {
                setIsSyncing(false);
            }
        }
    };

    if (!isOpen || !currentQuestion) return null;

    return (
        <div style={overlayStyle}>
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <button onClick={() => onClose(false, 0, questions.length)} style={closeBtn}><IconX /></button>
                    <div style={progressWrapper}>
                        <motion.div
                            animate={{ width: `${progressPercentage}%` }}
                            style={{ ...progressFill, backgroundColor: progressPercentage > 70 ? "#58CC02" : "#FFC800" }}
                        />
                    </div>
                    <div style={heartsBox}><IconHeart /> <span>{userProfile.heartsCount}</span></div>
                </div>

                <div style={contentArea}>
                    <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 style={questionTitle}>Selecciona la opción correcta</h2>

                        <div style={questionBox}>
                            <div style={characterPlaceholder} />
                            <div style={speechBubble}>{currentQuestion.textSource}</div>
                        </div>

                        <div style={optionsGrid}>
                            {currentQuestion.options.map(opt => (
                                <button
                                    key={opt}
                                    disabled={isAnswered}
                                    onClick={() => setSelectedOption(opt)}
                                    style={{
                                        ...optionStyle,
                                        borderColor: selectedOption === opt ? "#84d8ff" : "#e5e5e5",
                                        background: selectedOption === opt ? "#ddf4ff" : "white",
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div style={{ ...feedbackBar, backgroundColor: isAnswered ? (isCorrect ? "#d7ffb8" : "#ffdfe0") : "white" }}>
                    <div style={footerContent}>
                        {isAnswered && (
                            <div style={{ color: isCorrect ? "#58cc02" : "#ea2b2b", fontWeight: "900", fontSize: "1.2rem" }}>
                                {isCorrect ? "¡Excelente!" : `Incorrecto: ${currentQuestion.textTarget}`}
                            </div>
                        )}
                        <button
                            disabled={!selectedOption || isSyncing}
                            onClick={isAnswered ? handleNextQuestion : handleCheckAnswer}
                            style={{ ...primaryBtn, background: !selectedOption ? "#e5e5e5" : "#58cc02" }}
                        >
                            {isAnswered ? "CONTINUAR" : "COMPROBAR"}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showNoHeartsModal && (
                    <div style={noHeartsOverlay}>
                        <div style={noHeartsContent}>
                            <h2>💔 Sin vidas</h2>
                            <p>Recarga en: {heartTimer}</p>
                            <button onClick={() => onClose(false, 0, questions.length)} style={primaryBtn}>
                                SALIR
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// estilos (sin cambios)
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "#fff", zIndex: 5000 };
const containerStyle: React.CSSProperties = { maxWidth: 700, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", padding: "0 20px" };
const headerStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 20, padding: "30px 0" };
const progressWrapper: React.CSSProperties = { flex: 1, height: 16, background: "#E5E5E5", borderRadius: 12 };
const progressFill: React.CSSProperties = { height: "100%", borderRadius: 12, transition: "width 0.3s ease" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "#afafaf" };
const heartsBox: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, color: "#ff4b4b", fontWeight: "900" };
const contentArea: React.CSSProperties = { flex: 1 };
const questionTitle: React.CSSProperties = { fontSize: "1.6rem", fontWeight: "900", marginBottom: "30px" };
const questionBox: React.CSSProperties = { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" };
const characterPlaceholder: React.CSSProperties = { width: 80, height: 80, borderRadius: "50%", background: "#1cb0f6" };
const speechBubble: React.CSSProperties = { border: "2px solid #e5e5e5", borderRadius: "18px", padding: "12px 20px", fontSize: "1.2rem" };
const optionsGrid: React.CSSProperties = { display: "grid", gap: "12px" };
const optionStyle: React.CSSProperties = { padding: "16px 20px", borderRadius: "16px", border: "2px solid", cursor: "pointer", fontWeight: "bold" };
const feedbackBar: React.CSSProperties = { position: "fixed", bottom: 0, left: 0, right: 0, padding: "30px 20px" };
const footerContent: React.CSSProperties = { maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" };
const primaryBtn: React.CSSProperties = { padding: "14px 40px", borderRadius: "16px", border: "none", fontWeight: "900", color: "white", cursor: "pointer" };
const noHeartsOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 6000 };
const noHeartsContent: React.CSSProperties = { background: "#fff", padding: "40px", borderRadius: "24px", textAlign: "center" };
