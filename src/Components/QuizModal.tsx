import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- GENERADOR DE ICONOS ---
const getOptionVisual = (text: string) => {
  const t = (text || "").toLowerCase();
  if (t.includes("lib") || t.includes("stud")) return { icon: "📚", color: "#58cc02" };
  if (t.includes("cas") || t.includes("house")) return { icon: "🏠", color: "#ff4b4b" };
  if (t.includes("car") || t.includes("auto")) return { icon: "🚗", color: "#afafaf" };
  if (t.includes("nice") || t.includes("gusto")) return { icon: "🤝", color: "#ffc800" };
  if (t.includes("morning") || t.includes("día")) return { icon: "☀️", color: "#ffc800" };
  return { icon: "💬", color: "#1cb0f6" };
};

export const QuizModal: React.FC<any> = ({ isOpen, userProfile, questions, onUpdateProfile, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [wordBankSelected, setWordBankSelected] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Resetear estados si cambian las preguntas o se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setWordBankSelected([]);
      setIsAnswered(false);
      setCorrectAnswers(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validación de seguridad para evitar pantalla blanca
  const activeQuestions = Array.isArray(questions) ? questions : [];
  
  if (activeQuestions.length === 0) {
    return (
      <div style={fullOverlay}>
        <div style={{...mainContainer, justifyContent: 'center', alignItems: 'center'}}>
          <h2>Cargando preguntas...</h2>
          <button onClick={() => onClose(false, 0, 0)} style={confirmBtn}>Cerrar</button>
        </div>
      </div>
    );
  }

  const currentQuestion = activeQuestions[currentIndex];

  // Si por alguna razón el índice se sale de rango
  if (!currentQuestion) return null;

  const handleCheck = () => {
    let correct = false;
    const target = (currentQuestion.textTarget || "").trim().toLowerCase();

    if (currentQuestion.type === 'word_bank') {
      correct = wordBankSelected.join(" ").trim().toLowerCase() === target;
    } else {
      correct = (selectedOption || "").trim().toLowerCase() === target;
    }

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      if (userProfile?.heartsCount > 0) {
        onUpdateProfile({
          ...userProfile,
          heartsCount: userProfile.heartsCount - 1
        });
      }
    }

    setIsCorrect(correct);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setWordBankSelected([]);
      setIsAnswered(false);
    } else {
      // Sumar el último acierto si corresponde al cerrar
      const finalScore = isCorrect ? correctAnswers : correctAnswers;
      onClose(true, finalScore, activeQuestions.length);
    }
  };

  return (
    <div style={fullOverlay}>
      <div style={mainContainer}>
        {/* HEADER */}
        <div style={header}>
          <button onClick={() => onClose(false, 0, 0)} style={closeBtn}>✕</button>
          <div style={barBg}>
            <motion.div 
              animate={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
              style={barFill} 
            />
          </div>
          <div style={hearts}>❤️ {userProfile?.heartsCount || 0}</div>
        </div>

        {/* CUERPO - PREGUNTAS */}
        <div style={scrollBody}>
          <div style={contentLayout}>
            <h2 style={title}>{currentQuestion.instruction || "Traduce esta frase"}</h2>

            {/* VISTA PARA TRADUCCIÓN / BANCO */}
            <div style={characterRow}>
              <div style={avatarCircle}>🦉</div>
              <div style={speechBubble}>
                <div style={bubbleArrow} />
                {currentQuestion.textSource}
              </div>
            </div>

            {/* RENDERIZADO SEGÚN TIPO */}
            {currentQuestion.type === 'image_select' ? (
              <div style={grid2x2}>
                {currentQuestion.options?.map((opt: string, i: number) => {
                  const visual = getOptionVisual(opt);
                  const isSel = selectedOption === opt;
                  return (
                    <motion.div 
                      key={i} 
                      whileTap={{ scale: 0.97 }}
                      onClick={() => !isAnswered && setSelectedOption(opt)} 
                      style={{...card, borderColor: isSel ? "#84d8ff" : "#e5e5e5", backgroundColor: isSel ? "#ddf4ff" : "#fff"}}
                    >
                      <div style={{fontSize: "50px", marginBottom: "10px"}}>{visual.icon}</div>
                      <span style={{fontWeight: "bold", color: isSel ? "#1cb0f6" : "#4b4b4b"}}>{opt}</span>
                    </motion.div>
                  );
                })}
              </div>
            ) : currentQuestion.type === 'word_bank' ? (
              <div style={wordBankContainer}>
                <div style={answerArea}>
                  {wordBankSelected.map((w, i) => (
                    <button key={i} onClick={() => !isAnswered && setWordBankSelected(prev => prev.filter((_, idx) => idx !== i))} style={wordTile}>{w}</button>
                  ))}
                </div>
                <div style={optionsArea}>
                  {(currentQuestion.options || []).map((opt: string, i: number) => {
                    const countInSelection = wordBankSelected.filter(w => w === opt).length;
                    const countInOptions = (currentQuestion.options || []).filter((o: string) => o === opt).length;
                    const isUsed = countInSelection >= countInOptions;
                    
                    return (
                      <button 
                        key={i} 
                        disabled={isUsed || isAnswered}
                        onClick={() => setWordBankSelected(prev => [...prev, opt])}
                        style={{...wordTile, opacity: isUsed ? 0.2 : 1}}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={listContainer}>
                {(currentQuestion.options || []).map((opt: string, i: number) => (
                  <button key={i} onClick={() => !isAnswered && setSelectedOption(opt)}
                    style={{...listBtn, borderColor: selectedOption === opt ? "#84d8ff" : "#e5e5e5", backgroundColor: selectedOption === opt ? "#ddf4ff" : "#fff"}}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{...footer, backgroundColor: isAnswered ? (isCorrect ? "#d7ffb8" : "#ffdfe0") : "#fff"}}>
          <div style={footerInner}>
            <div style={feedbackArea}>
              {isAnswered && (
                <div style={{color: isCorrect ? "#58cc02" : "#ea2b2b"}}>
                  <b style={{fontSize: "20px"}}>{isCorrect ? "¡Excelente!" : "Solución correcta:"}</b>
                  <p style={{margin: 0}}>{currentQuestion.textTarget}</p>
                </div>
              )}
            </div>
            <button
              disabled={!selectedOption && wordBankSelected.length === 0 && !isAnswered}
              onClick={isAnswered ? handleNext : handleCheck}
              style={{
                ...confirmBtn, 
                backgroundColor: !isAnswered && !selectedOption && wordBankSelected.length === 0 
                  ? "#e5e5e5" 
                  : (isCorrect || !isAnswered ? "#58cc02" : "#ff4b4b")
              }}
            >
              {isAnswered ? "CONTINUAR" : "COMPROBAR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS --- (Se mantienen los mismos del código anterior)
const fullOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "#fff", zIndex: 10000 };
const mainContainer: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100vh" };
const header: React.CSSProperties = { display: "flex", alignItems: "center", padding: "20px", maxWidth: "1000px", margin: "0 auto", width: "100%", gap: "15px" };
const barBg: React.CSSProperties = { flex: 1, height: "14px", background: "#e5e5e5", borderRadius: "10px" };
const barFill: React.CSSProperties = { height: "100%", background: "#58cc02", borderRadius: "10px", transition: "0.3s" };
const closeBtn: React.CSSProperties = { border: "none", background: "none", fontSize: "24px", color: "#afafaf", cursor: "pointer" };
const hearts: React.CSSProperties = { fontWeight: "bold", color: "#ff4b4b", fontSize: "18px" };
const scrollBody: React.CSSProperties = { flex: 1, overflowY: "auto", padding: "20px" };
const contentLayout: React.CSSProperties = { maxWidth: "600px", margin: "0 auto" };
const title: React.CSSProperties = { fontSize: "28px", fontWeight: "900", color: "#3c3c3c", marginBottom: "30px" };
const grid2x2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" };
const card: React.CSSProperties = { border: "2px solid", borderRadius: "15px", padding: "20px", textAlign: "center", cursor: "pointer", position: "relative", borderBottomWidth: "5px" };
const listContainer: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "12px" };
const listBtn: React.CSSProperties = { padding: "18px", borderRadius: "15px", border: "2px solid", borderBottomWidth: "5px", cursor: "pointer", textAlign: "left", fontSize: "18px", fontWeight: "bold" };
const wordBankContainer: React.CSSProperties = { marginTop: "20px" };
const answerArea: React.CSSProperties = { minHeight: "100px", borderTop: "2px solid #e5e5e5", borderBottom: "2px solid #e5e5e5", marginBottom: "30px", display: "flex", flexWrap: "wrap", gap: "10px", padding: "10px 0" };
const optionsArea: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" };
const wordTile: React.CSSProperties = { padding: "12px 18px", border: "2px solid #e5e5e5", borderBottomWidth: "4px", borderRadius: "12px", background: "#fff", cursor: "pointer", fontWeight: "bold" };
const footer: React.CSSProperties = { borderTop: "2px solid #e5e5e5", padding: "30px 20px" };
const footerInner: React.CSSProperties = { maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" };
const feedbackArea: React.CSSProperties = { flex: 1 };
const confirmBtn: React.CSSProperties = { padding: "16px 45px", borderRadius: "15px", border: "none", color: "#fff", fontWeight: "900", fontSize: "17px", cursor: "pointer" };
const characterRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" };
const avatarCircle: React.CSSProperties = { fontSize: "50px", width: "80px", height: "80px", background: "#e5e5e5", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" };
const speechBubble: React.CSSProperties = { position: "relative", border: "2px solid #e5e5e5", borderRadius: "20px", padding: "15px 25px", fontSize: "20px" };
const bubbleArrow: React.CSSProperties = { position: "absolute", left: "-10px", top: "50%", transform: "translateY(-50%) rotate(45deg)", width: "16px", height: "16px", backgroundColor: "white", borderLeft: "2px solid #e5e5e5", borderBottom: "2px solid #e5e5e5" };