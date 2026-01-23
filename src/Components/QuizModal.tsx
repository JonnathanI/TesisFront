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
                await completeLesson(lessonId, questions.length);
                onClose(true, score, questions.length); 
            } catch (error) {
                console.error("Error al finalizar", error);
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
                    <button onClick={() => onClose(false, 0, questions.length)} style={closeBtn}>✕</button>
                    <div style={progressWrapper}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            style={progressFill} 
                        />
                    </div>
                    <div style={heartsBox}>❤️ {userProfile.heartsCount}</div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
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
                </div>

                <div style={{ ...feedbackBar, background: isAnswered ? (isCorrect ? "#d7ffb8" : "#ffdfe0") : "white" }}>
                    <div style={footerContent}>
                        {isAnswered && (
                            <div style={{ color: isCorrect ? "#58cc02" : "#ff4b4b", fontWeight: "900" }}>
                                {isCorrect ? "¡Excelente!" : `Incorrecto: ${currentQuestion.textTarget}`}
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

            <AnimatePresence>
                {showNoHeartsModal && (
                    <motion.div style={noHeartsOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={noHeartsContent}>
                            <h2>💔 ¡Sin vidas!</h2>
                            <p>Vuelven en: {heartTimer}</p>
                            <button onClick={() => onClose(false, 0, questions.length)} style={primaryBtn}>SALIR</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "#fff", zIndex: 5000 };
const containerStyle: React.CSSProperties = { maxWidth: 650, margin: "0 auto", padding: "40px 20px", height: "100vh", display: "flex", flexDirection: "column" };
const headerStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 20, marginBottom: 20 };
const progressWrapper: React.CSSProperties = { flex: 1, height: 16, background: "#E5E5E5", borderRadius: 12, overflow: "hidden" };
const progressFill: React.CSSProperties = { height: "100%", background: "#58CC02", borderRadius: 12 };
const closeBtn: React.CSSProperties = { background: "none", border: "none", fontSize: 26, cursor: "pointer", color: "#afafaf" };
const heartsBox: React.CSSProperties = { fontWeight: "900", color: "#ff4b4b" };
const questionText: React.CSSProperties = { fontSize: "2rem", fontWeight: "800", color: "#3c3c3c" };
const optionsGrid: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 14 };
const optionStyle: React.CSSProperties = { padding: "18px", borderRadius: 16, fontSize: "1.1rem", textAlign: "left", cursor: "pointer", fontWeight: "bold" };
const feedbackBar: React.CSSProperties = { position: "fixed", bottom: 0, left: 0, right: 0, padding: "40px 20px" };
const footerContent: React.CSSProperties = { maxWidth: 650, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" };
const primaryBtn: React.CSSProperties = { padding: "15px 50px", borderRadius: 16, border: "none", fontSize: "16px", fontWeight: "900", cursor: "pointer", background: "#58CC02", color: "white" };
const noHeartsOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 6000 };
const noHeartsContent: React.CSSProperties = { background: "#fff", padding: "40px", borderRadius: "24px", textAlign: "center" };