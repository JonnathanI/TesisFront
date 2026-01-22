import React from "react";
import { SoundCategory } from "../../data/soundData";

interface Props {
  soundItems: SoundCategory[];
}

const SoundsSection: React.FC<Props> = ({ soundItems }) => {
  
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // CONFIGURACIÓN PARA INGLÉS
    utterance.lang = "en-US"; // Acento de Estados Unidos
    utterance.rate = 0.85;    // Un poco más lento para ayudar al aprendizaje
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ paddingBottom: "100px", animation: "fadeInUp 0.5s ease" }}>
      <h2 style={{ fontWeight: 900, fontSize: "28px", color: "#1CB0F6", marginBottom: "10px" }}>
        Audio Dictionary 🎧
      </h2>
      <p style={{ color: "#777", marginBottom: "30px", fontWeight: "bold" }}>
        Listen and repeat to improve your pronunciation!
      </p>

      {soundItems.map((cat, i) => (
        <div key={i} style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#4B4B4B", marginBottom: "15px", borderBottom: "2px solid #F0F0F0", paddingBottom: "5px" }}>
            {cat.category}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
            {cat.items.map((item, j) => (
              <button
                key={j}
                onClick={() => speak(item.pronunciation || item.name)}
                style={{
                  background: "white",
                  border: "2px solid #E5E5E5",
                  borderBottom: "5px solid #E5E5E5",
                  borderRadius: "16px",
                  padding: "15px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.1s"
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(2px)";
                  e.currentTarget.style.borderBottomWidth = "2px";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderBottomWidth = "5px";
                }}
              >
                <span style={{ fontSize: "42px" }}>{item.icon}</span>
                <span style={{ fontWeight: "800", color: "#4B4B4B", fontSize: "17px" }}>
                  {item.name}
                </span>
                <span style={{ fontWeight: "600", color: "#AFAFAF", fontSize: "13px", textTransform: "lowercase" }}>
                  ({item.translation})
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SoundsSection;