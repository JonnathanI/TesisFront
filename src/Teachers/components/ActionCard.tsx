import { motion } from "framer-motion";

export const ActionCard = ({ title, icon, color, onClick, currentTheme }: any) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{
      background: currentTheme.cardBg,
      border: `2px solid ${currentTheme.border}`,
      borderRadius: "1.5rem",
      padding: "1rem",
      textAlign: "center",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.8rem",
    }}
  >
    <div
      style={{
        fontSize: "1.8rem",
        background: `${color}20`,
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <h3 style={{ margin: 0, fontSize: "1.2rem", color: currentTheme.text }}>
      {title}
    </h3>
    <p style={{ margin: 0, opacity: 0.6, fontSize: "0.8rem" }}>
      Haz clic para acceder
    </p>
  </motion.div>
);
