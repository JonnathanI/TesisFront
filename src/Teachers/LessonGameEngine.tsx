import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionData } from '../api/auth.service';

// --- ICONOS SVG INTEGRADOS (Sin dependencias externas) ---
const CheckIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const VolumeIcon = ({ size = 48 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const MicIcon = ({ size = 48 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const ArrowRightIcon = ({ size = 40 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

interface Props {
  question: QuestionData;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function LessonGameEngine({ question, onCorrect, onWrong }: Props) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    setFeedback(null);
    setUserInput("");
    
    if (question.category === 'ORDERING') {
      const words = question.textTarget?.split(' ') || [];
      setShuffledWords([...words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
  }, [question]);

  // --- LÓGICA DE AUDIO ---
  const playAudio = () => {
    if (question.audioUrl) {
      const audio = new Audio(question.audioUrl);
      audio.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(question.textSource);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- RECONOCIMIENTO DE VOZ (SPEAKING) ---
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Navegador no compatible con voz. Por favor usa Chrome.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      checkAnswer(result);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const checkAnswer = (answer: string) => {
    const cleanUser = answer.trim().toLowerCase().replace(/[.,?!]/g, "");
    const cleanTarget = (question.textTarget || "").toLowerCase().replace(/[.,?!]/g, "");
    
    const isCorrect = cleanUser === cleanTarget;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => {
      isCorrect ? onCorrect() : onWrong();
    }, 1800);
  };

  // --- SUB-COMPONENTES DE JUEGO ---

  const ListeningGame = () => (
    <div className="flex flex-col items-center gap-8">
      <motion.button 
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={playAudio}
        className="w-32 h-32 bg-[#1cb0f6] rounded-3xl flex items-center justify-center shadow-[0_8px_0_#1899d6] text-white"
      >
        <VolumeIcon size={64} />
      </motion.button>
      <h2 className="text-2xl font-bold text-[#4b4b4b]">Selecciona lo que escuchaste</h2>
      <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
        {question.options.map((opt, i) => (
          <button key={i} onClick={() => checkAnswer(opt)} className="p-4 border-2 border-[#e5e5e5] border-b-4 rounded-2xl font-bold text-[#4b4b4b] hover:bg-[#f7f7f7] transition-all">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const SpeakingGame = () => (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-[#1cb0f6]">"{question.textSource}"</h2>
        <p className="text-[#afafaf] font-bold uppercase mt-2">Pronuncia la frase</p>
      </div>
      <motion.button
        animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        onClick={startSpeechRecognition}
        className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-xl ${isRecording ? 'bg-[#ff4b4b]' : 'bg-[#1cb0f6]'}`}
      >
        <MicIcon size={54} />
      </motion.button>
      <p className="font-black text-[#afafaf] uppercase tracking-widest">{isRecording ? "ESCUCHANDO..." : "TOCA PARA HABLAR"}</p>
    </div>
  );

  const OrderingGame = () => (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-[#4b4b4b] mb-8 self-start">Ordena la oración:</h2>
      
      <div className="w-full min-h-[120px] border-y-2 border-[#e5e5e5] flex flex-wrap gap-2 p-4 justify-center items-center">
        {selectedWords.map((word, i) => (
          <motion.button layoutId={`word-${word}-${i}`} key={`sel-${i}`} onClick={() => {
            setSelectedWords(selectedWords.filter((_, idx) => idx !== i));
            setShuffledWords([...shuffledWords, word]);
          }} className="bg-white border-2 border-[#e5e5e5] border-b-4 px-4 py-2 rounded-xl font-bold text-[#4b4b4b]">
            {word}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-12">
        {shuffledWords.map((word, i) => (
          <motion.button layoutId={`word-${word}-${i}`} key={`shuf-${i}`} onClick={() => {
            setSelectedWords([...selectedWords, word]);
            setShuffledWords(shuffledWords.filter((_, idx) => idx !== i));
          }} className="bg-white border-2 border-[#e5e5e5] border-b-4 px-4 py-2 rounded-xl font-bold text-[#4b4b4b] hover:bg-[#f1f1f1]">
            {word}
          </motion.button>
        ))}
      </div>

      <button onClick={() => checkAnswer(selectedWords.join(' '))} className="mt-12 bg-[#58cc02] text-white px-20 py-4 rounded-2xl font-bold shadow-[0_5px_0_#46a302] uppercase tracking-widest active:scale-95 transition-transform">
        Comprobar
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full relative">
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: 150 }} animate={{ y: 0 }} exit={{ y: 150 }}
            className={`fixed bottom-0 left-0 right-0 h-36 flex items-center px-12 justify-between z-50 ${feedback === 'correct' ? 'bg-[#d7ffb8] text-[#58a700]' : 'bg-[#ffdfe0] text-[#ea2b2b]'}`}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                {feedback === 'correct' ? <CheckIcon /> : <XIcon />}
              </div>
              <div>
                <h3 className="text-3xl font-black">{feedback === 'correct' ? "¡Excelente!" : "Solución correcta:"}</h3>
                {feedback === 'wrong' && <p className="text-xl font-bold">{question.textTarget}</p>}
              </div>
            </div>
            <div className="opacity-50">
              <ArrowRightIcon size={40} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex justify-center px-4">
        {question.category === 'LISTENING' && <ListeningGame />}
        {question.category === 'SPEAKING' && <SpeakingGame />}
        {question.category === 'ORDERING' && <OrderingGame />}
        {(question.category === 'GRAMMAR' || !question.category) && (
           <div className="text-center w-full max-w-md">
             <h2 className="text-2xl font-bold text-[#4b4b4b] mb-4">Traduce esta frase</h2>
             <p className="text-xl italic text-[#afafaf] mb-8">"{question.textSource}"</p>
             <input 
               autoFocus 
               value={userInput} 
               onChange={(e) => setUserInput(e.target.value)} 
               onKeyDown={(e) => e.key === 'Enter' && checkAnswer(userInput)} 
               className="w-full p-4 border-2 border-[#e5e5e5] rounded-2xl bg-[#f7f7f7] font-bold outline-none focus:border-[#1cb0f6] text-center" 
               placeholder="Escribe en inglés..." 
             />
           </div>
        )}
      </div>
    </div>
  );
}