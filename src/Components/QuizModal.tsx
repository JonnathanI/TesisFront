import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    QuestionDTO, 
    completeLesson, 
    buyShopItem, 
    getUserProfile, 
    subtractHeart, // <--- Importante: Servicio que conecta al backend
    UserProfileData 
} from '../api/auth.service';
import { useNavigate } from 'react-router-dom';

interface QuizModalProps {
    isOpen: boolean;
    questions: QuestionDTO[];
    lessonId: string;
    onClose: (completed: boolean) => void;
    userProfile: UserProfileData;
    onUpdateProfile: (updatedProfile: UserProfileData) => void;
    heartTimer: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
    isOpen,
    questions,
    lessonId,
    onClose,
    userProfile,
    onUpdateProfile,
    heartTimer
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false); // Estado para evitar doble clic

    const currentQuestion = questions[currentIndex];

    // Bloqueo inmediato si intenta entrar sin vidas
    useEffect(() => {
        if (isOpen && userProfile.heartsCount <= 0) {
            setShowNoHeartsModal(true);
        }
    }, [isOpen, userProfile.heartsCount]);

    // --- FUNCIÓN CORREGIDA: COMPROBAR ---
   const handleCheck = async () => {
    const correct = selectedOption === currentQuestion.textTarget;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (!correct) {
        try {
            const updatedProfile = await subtractHeart();
            onUpdateProfile(updatedProfile);
        } catch (error) {
            // SI EL BACKEND FALLA (como ahora), al menos resta una vida visual
            // para que el usuario no sienta que la app se rompió
            const fallbackProfile = {
                ...userProfile,
                heartsCount: Math.max(0, userProfile.heartsCount - 1)
            };
            onUpdateProfile(fallbackProfile);
            
            if (fallbackProfile.heartsCount === 0) {
                setShowNoHeartsModal(true);
            }
        }
    }
};
    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            await completeLesson(lessonId, questions.length);
            onClose(true);
        }
    };

    const handlePurchaseHearts = async () => {
        if (userProfile.lingots < 400) {
            alert("No tienes suficientes gemas 💎");
            return;
        }
        try {
            await buyShopItem('HEART_REFILL');
            const freshProfile = await getUserProfile();
            onUpdateProfile(freshProfile);
            setShowNoHeartsModal(false); 
        } catch (e) {
            alert("Error al procesar la compra");
        }
    };

    if (!isOpen || !currentQuestion) return null;

    return (
        <div style={overlayStyle}>
            <div style={containerStyle}>
                {/* Header: Progreso y Vidas */}
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <button onClick={() => onClose(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                    <div style={progressWrapper}>
                        <div style={{ ...progressFill, width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '1.3rem' }}>❤️</span>
                        <span style={{ fontWeight: '900', color: '#ff4b4b' }}>{userProfile.heartsCount}</span>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2rem 0', textAlign: 'left', width: '100%' }}>
                    {currentQuestion.textSource}
                </h2>

                <div style={optionsGrid}>
                    {currentQuestion.options.map((opt, i) => (
                        <button
                            key={i}
                            disabled={isAnswered || isSyncing}
                            onClick={() => setSelectedOption(opt)}
                            style={{
                                ...optionStyle,
                                border: selectedOption === opt ? '2px solid #1cb0f6' : '2px solid #e5e5e5',
                                backgroundColor: selectedOption === opt ? '#ddf4ff' : 'white',
                                boxShadow: selectedOption === opt ? '0 4px 0 #1cb0f6' : '0 4px 0 #e5e5e5'
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Feedback Bar */}
                <div style={{
                    ...feedbackBar,
                    backgroundColor: isAnswered ? (isCorrect ? '#d7ffb8' : '#ffdfe0') : 'white'
                }}>
                    <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {isAnswered && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '900', color: isCorrect ? '#58a700' : '#ea2b2b', fontSize: '1.2rem' }}>
                                    {isCorrect ? '¡Buen trabajo!' : 'Solución correcta:'}
                                </span>
                                {!isCorrect && <span style={{ color: '#ea2b2b' }}>{currentQuestion.textTarget}</span>}
                            </div>
                        )}
                        
                        {!isAnswered ? (
                            <button 
                                disabled={!selectedOption || isSyncing} 
                                onClick={handleCheck} 
                                style={selectedOption && !isSyncing ? activeCheckBtn : disabledCheckBtn}
                            >
                                {isSyncing ? 'SINCRONIZANDO...' : 'COMPROBAR'}
                            </button>
                        ) : (
                            <button onClick={handleNext} style={isCorrect ? nextBtnGreen : nextBtnRed}>
                                CONTINUAR
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL BLOQUEO DE VIDAS */}
            <AnimatePresence>
                {showNoHeartsModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={noHeartsOverlay}>
                        <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} style={noHeartsContent}>
                            <span style={{ fontSize: '4rem' }}>💔</span>
                            <h2 style={{ fontWeight: '900', color: '#3c3c3c' }}>¡Sin vidas!</h2>
                            <p style={{ color: '#777' }}>No puedes continuar sin corazones.</p>
                            
                            <div style={timerBox}>
                                <p style={{ fontSize: '0.75rem', color: '#afafaf', margin: 0, fontWeight: 'bold' }}>PRÓXIMA VIDA EN</p>
                                <span style={{ fontSize: '2rem', color: '#ff4b4b', fontWeight: '900' }}>
                                    {heartTimer || "00:00"}
                                </span>
                            </div>

                            <button onClick={handlePurchaseHearts} style={buyBtn}>
                                RELLENAR VIDAS (💎 400)
                            </button>
                            
                            <button onClick={() => onClose(false)} style={exitBtn}>
                                SALIR POR AHORA
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- ESTILOS ---
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 5000, display: 'flex', justifyContent: 'center' };
const containerStyle: React.CSSProperties = { width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' };
const progressWrapper: React.CSSProperties = { flex: 1, height: '14px', background: '#e5e5e5', borderRadius: '10px', overflow: 'hidden' };
const progressFill: React.CSSProperties = { height: '100%', background: '#58cc02', transition: 'width 0.3s ease' };
const optionsGrid: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' };
const optionStyle: React.CSSProperties = { padding: '1.2rem', borderRadius: '15px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', border: '2px solid #e5e5e5' };
const feedbackBar: React.CSSProperties = { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 2rem', borderTop: '2px solid #e5e5e5' };
const activeCheckBtn: React.CSSProperties = { padding: '14px 60px', background: '#58cc02', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 0 #46a302' };
const disabledCheckBtn: React.CSSProperties = { ...activeCheckBtn, background: '#e5e5e5', color: '#afafaf', boxShadow: 'none', cursor: 'default' };
const nextBtnGreen: React.CSSProperties = { ...activeCheckBtn, background: '#58cc02' };
const nextBtnRed: React.CSSProperties = { ...activeCheckBtn, background: '#ff4b4b', boxShadow: '0 4px 0 #ea2b2b' };
const noHeartsOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const noHeartsContent: React.CSSProperties = { background: 'white', padding: '2.5rem', borderRadius: '2rem', textAlign: 'center', width: '90%', maxWidth: '380px' };
const timerBox: React.CSSProperties = { margin: '1.5rem 0', padding: '15px', background: '#f7f7f7', borderRadius: '15px', border: '2px solid #eee' };
const buyBtn: React.CSSProperties = { width: '100%', padding: '1.2rem', background: '#58cc02', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 5px 0 #46a302', marginBottom: '15px' };
const exitBtn: React.CSSProperties = { width: '100%', background: 'none', border: 'none', color: '#1cb0f6', fontWeight: '900', cursor: 'pointer' };