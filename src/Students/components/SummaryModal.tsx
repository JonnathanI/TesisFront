import React from "react";
import { motion } from "framer-motion";

interface SummaryProps {
  score: number;
  total: number;
  onClose: () => void;
  isUnitCompleted?: boolean;
  unitSummary?: any[]; // Datos de todas las lecciones de la unidad
}

export const LessonSummary = ({ score, total, onClose, isUnitCompleted, unitSummary }: SummaryProps) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(255,255,255,0.95)",
      zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Poppins', sans-serif"
    }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ textAlign: "center", maxWidth: "500px", width: "100%" }}
      >
        <h2 style={{ fontSize: "32px", color: "#58CC02", fontWeight: 900 }}>¡Lección completada!</h2>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "30px 0" }}>
          <div style={{ background: "#FFC800", padding: "20px", borderRadius: "15px", color: "white" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold" }}>ACIERTOS</div>
            <div style={{ fontSize: "24px", fontWeight: "900" }}>{score} / {total}</div>
          </div>
          <div style={{ background: "#1CB0F6", padding: "20px", borderRadius: "15px", color: "white" }}>
            <div style={{ fontSize: "12px", fontWeight: "bold" }}>PRECISIÓN</div>
            <div style={{ fontSize: "24px", fontWeight: "900" }}>{percentage}%</div>
          </div>
        </div>

        {/* --- SECCIÓN RESUMEN DE UNIDAD (Si aplica) --- */}
        {isUnitCompleted && unitSummary && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ background: "#f0f0f0", padding: "20px", borderRadius: "20px", marginBottom: "20px" }}
          >
            <h3 style={{ color: "#4B4B4B", marginBottom: "15px" }}>🏆 ¡Unidad Finalizada!</h3>
            <div style={{ textAlign: "left", maxHeight: "200px", overflowY: "auto" }}>
              {unitSummary.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #ddd" }}>
                  <span>Lección {i + 1}: {l.title}</span>
                  <span style={{ fontWeight: "bold", color: "#58CC02" }}>✅ OK</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <button 
          onClick={onClose}
          style={{
            background: "#58CC02", color: "white", border: "none", padding: "15px 40px",
            borderRadius: "15px", fontWeight: "bold", fontSize: "18px", cursor: "pointer",
            boxShadow: "0 5px 0 #46A302"
          }}
        >
          CONTINUAR
        </button>
      </motion.div>
    </div>
  );
};