import React from "react";
import { motion } from "framer-motion";

interface CharacterAvatarProps {
    isCorrect?: boolean;
    isError?: boolean;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ 
    isCorrect = false, 
    isError = false 
}) => {
    return (
        <div style={containerStyle}>
            <motion.div
                animate={
                    isError 
                        ? { x: [-4, 4, -4, 4, 0], rotate: [0, -5, 5, 0] } 
                        : isCorrect 
                            ? { y: [0, -25, 0], scale: [1, 1.1, 1] } 
                            : { y: [0, -8, 0] }
                }
                transition={
                    isError 
                        ? { duration: 0.4 } 
                        : isCorrect 
                            ? { duration: 0.5, ease: "easeOut" } 
                            : { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }
                style={avatarWrapper}
            >
                {/* SVG DEL PÁJARO AZUL Y AMARILLO (Carga inmediata sin URL externa) */}
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                    {/* Cuerpo */}
                    <ellipse cx="50" cy="55" rx="35" ry="38" fill="#1CB0F6" />
                    {/* Panza Amarilla */}
                    <ellipse cx="50" cy="65" rx="20" ry="22" fill="#FFD900" />
                    {/* Ojos */}
                    <circle cx="38" cy="45" r="8" fill="white" />
                    <circle cx="62" cy="45" r="8" fill="white" />
                    <circle cx="38" cy="45" r="4" fill="#333" />
                    <circle cx="62" cy="45" r="4" fill="#333" />
                    {/* Pico */}
                    <path d="M45 55 L55 55 L50 65 Z" fill="#FF9600" />
                    {/* Alas */}
                    <path d="M15 55 Q5 45 15 35" stroke="#1CB0F6" strokeWidth="8" fill="none" strokeLinecap="round" />
                    <path d="M85 55 Q95 45 85 35" stroke="#1CB0F6" strokeWidth="8" fill="none" strokeLinecap="round" />
                    {/* Patas */}
                    <path d="M40 90 L40 95 M60 90 L60 95" stroke="#FF9600" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </motion.div>

            {/* Sombra */}
            <motion.div 
                animate={{ scaleX: isCorrect ? [1, 0.6, 1] : [1, 1.1, 1], opacity: isCorrect ? [0.2, 0.1, 0.2] : 0.2 }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                style={shadowStyle} 
            />
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "140px",
    height: "140px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
};

const avatarWrapper: React.CSSProperties = {
    width: "100%",
    height: "100%",
    zIndex: 2,
};

const shadowStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "5px",
    width: "70px",
    height: "12px",
    background: "black",
    borderRadius: "50%",
    opacity: 0.2,
    zIndex: 1,
};