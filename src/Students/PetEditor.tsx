// src/Components/PetEditor.tsx
import React, { useState } from "react";
import { motion, Variants } from "framer-motion";

/* ===========================
   1. TIPOS / DEFAULTS MASCOTA
   =========================== */

export type PetMood = "happy" | "sleepy" | "angry";

export interface PetAttributes {
  enabled: boolean;
  color: string; // color principal
  mood: PetMood;
  accessory: "none" | "glasses" | "shoes";
}

export const DEFAULT_PET: PetAttributes = {
  enabled: true,
  color: "#1CB0F6",
  mood: "happy",
  accessory: "glasses",
};

/* ===========================
   2. RENDER MASCOTA
   =========================== */

interface PetRendererProps {
  pet: PetAttributes;
  size?: number;
}

// 🔹 RENDER MASCOTA MÁS “REALISTA”
/* ===========================
   4. RENDER MASCOTA (pajarito azul mejorado)
   =========================== */

interface PetRendererProps {
  pet: PetAttributes;
  size?: number;
}

export const PetRenderer: React.FC<PetRendererProps> = ({ pet, size = 140 }) => {
  if (!pet.enabled) return null;

  const bodyColor = pet.color;
  const beakColor = "#FFC800";
  const feetColor = "#FFC800";

  const flapVariant: Variants = {
    initial: { rotate: 0 },
    animate: {
      rotate: [-12, 8, -12],
      transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const floatVariant: Variants = {
    initial: { y: 0 },
    animate: {
      y: [0, -4, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  let mouthPath = "M68 78 Q75 82 82 78"; // feliz
  if (pet.mood === "sleepy") {
    mouthPath = "M68 80 Q75 77 82 80";
  } else if (pet.mood === "angry") {
    mouthPath = "M68 82 Q75 75 82 82";
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      initial="initial"
      animate="animate"
      variants={floatVariant}
    >
      {/* ====== DEFINICIÓN DE DEGRADADO PARA CUERPO (más volumen) ====== */}
      <defs>
        <radialGradient id="petBodyGradient" cx="30%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="40%" stopColor={bodyColor} />
          <stop offset="100%" stopColor={bodyColor} stopOpacity={0.95} />
        </radialGradient>
      </defs>

      {/* sombra */}
      <ellipse cx={60} cy={110} rx={22} ry={6} fill="rgba(0,0,0,0.18)" />

      {/* TODO EL PÁJARO FLOTA JUNTO */}
      <motion.g>
        {/* alas */}
        <motion.path
          d="M22 65 Q5 55 10 40 Q25 45 32 55 Z"
          fill={bodyColor}
          stroke="#0f172a"
          strokeWidth={1.5}
          variants={flapVariant}
          style={{ transformOrigin: "30px 60px" }}
        />
        <motion.path
          d="M98 65 Q115 55 110 40 Q95 45 88 55 Z"
          fill={bodyColor}
          stroke="#0f172a"
          strokeWidth={1.5}
          variants={flapVariant}
          style={{ transformOrigin: "90px 60px" }}
        />

        {/* cuerpo principal redondo con borde + brillo */}
        <circle
          cx={60}
          cy={60}
          r={26}
          fill="url(#petBodyGradient)"
          stroke="#0f172a"
          strokeWidth={2}
        />

        {/* vientre suave para más volumen */}
        <ellipse
          cx={60}
          cy={68}
          rx={16}
          ry={11}
          fill="#ffffff"
          opacity={0.12}
        />

        {/* mechoncito arriba */}
        <path
          d="M53 32 Q60 22 67 32"
          stroke={bodyColor}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle cx={60} cy={32} r={4} fill={bodyColor} />

        {/* CARA */}
        <g>
          {/* “gafas” / marco blanco para hacer la cara más parecida al avatar */}
          <rect
            x={39}
            y={45}
            width={18}
            height={13}
            rx={4}
            fill="#f4f7fb"
          />
          <rect
            x={63}
            y={45}
            width={18}
            height={13}
            rx={4}
            fill="#f4f7fb"
          />

          {/* pupilas */}
          <circle cx={48} cy={51.5} r={3} fill="#111827" />
          <circle cx={72} cy={51.5} r={3} fill="#111827" />
          <circle cx={49} cy={50.5} r={1.2} fill="#ffffff" opacity={0.9} />
          <circle cx={73} cy={50.5} r={1.2} fill="#ffffff" opacity={0.9} />

          {/* cejas según estado de ánimo */}
          {pet.mood === "happy" && (
            <>
              <path
                d="M41 43 Q47 39 53 43"
                stroke="#111827"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M67 43 Q73 39 79 43"
                stroke="#111827"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </>
          )}
          {pet.mood === "sleepy" && (
            <>
              <path
                d="M41 44 Q47 46 53 44"
                stroke="#111827"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M67 44 Q73 46 79 44"
                stroke="#111827"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </>
          )}
          {pet.mood === "angry" && (
            <>
              <path
                d="M41 44 Q47 39 53 42"
                stroke="#111827"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M67 42 Q73 39 79 44"
                stroke="#111827"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </>
          )}

          {/* marco de gafas extra si está activado */}
          {pet.accessory === "glasses" && (
            <g>
              <rect
                x={37.5}
                y={43}
                width={21}
                height={15}
                rx={3}
                stroke="#ffffff"
                strokeWidth={2}
                fill="none"
              />
              <rect
                x={61.5}
                y={43}
                width={21}
                height={15}
                rx={3}
                stroke="#ffffff"
                strokeWidth={2}
                fill="none"
              />
              <line
                x1={58.5}
                y1={50.5}
                x2={61.5}
                y2={50.5}
                stroke="#ffffff"
                strokeWidth={2}
              />
            </g>
          )}
        </g>

        {/* pico */}
        <polygon
          points="60,56 54,64 66,64"
          fill={beakColor}
          stroke="#d89200"
          strokeWidth={1}
        />

        {/* boca (NO hay cola aquí: esa línea negra desaparece) */}
        <path
          d={mouthPath}
          stroke="#111827"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />

        {/* patitas + zapatos opcionales */}
        <g>
          <rect x={50} y={78} width={6} height={10} rx={2} fill={feetColor} />
          <rect x={64} y={78} width={6} height={10} rx={2} fill={feetColor} />

          {pet.accessory === "shoes" && (
            <>
              <rect
                x={47.5}
                y={86}
                width={11}
                height={5}
                rx={2}
                fill="#111827"
              />
              <rect
                x={63.5}
                y={86}
                width={11}
                height={5}
                rx={2}
                fill="#111827"
              />
              <line
                x1={49}
                y1={88}
                x2={56.5}
                y2={88}
                stroke="#FFC800"
                strokeWidth={1}
              />
              <line
                x1={65}
                y1={88}
                x2={72.5}
                y2={88}
                stroke="#FFC800"
                strokeWidth={1}
              />
            </>
          )}
        </g>
      </motion.g>
    </motion.svg>
  );
};



/* ===========================
   3. EDITOR DE MASCOTA (MODAL)
   =========================== */

interface PetEditorProps {
  initialPet?: PetAttributes;
  onSave: (pet: PetAttributes) => void;
  onCancel: () => void;
}

const PetEditor: React.FC<PetEditorProps> = ({
  initialPet,
  onSave,
  onCancel,
}) => {
  const [pet, setPet] = useState<PetAttributes>(initialPet || DEFAULT_PET);

  const updatePet = (key: keyof PetAttributes, value: any) => {
    setPet((prev) => ({ ...prev, [key]: value }));
  };

  const ColorCircle = ({ color, isSelected, onClick }: any) => (
    <motion.div
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        background: color,
        cursor: "pointer",
        border: isSelected ? "4px solid #1cb0f6" : "2px solid transparent",
        boxShadow: isSelected ? "0 0 10px #1cb0f6" : "none",
      }}
    />
  );

  const OptionBox = ({ children, onClick, isSelected }: any) => (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: "0.8rem",
        borderRadius: "0.8rem",
        background: "#2d3748",
        cursor: "pointer",
        border: isSelected ? "2px solid #1cb0f6" : "2px solid #4a5568",
        textAlign: "center",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.9rem",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: "#0f172a",
          padding: "2rem",
          borderRadius: "1.5rem",
          width: "95%",
          maxWidth: "800px",
          height: "80vh",
          display: "flex",
          gap: "2rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* PREVIEW MASCOTA */}
        <div
          style={{
            flex: "0 0 300px",
            background: "#e0f2fe",
            borderRadius: "1rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.08)",
          }}
        >
          <PetRenderer pet={pet} size={160} />
        </div>

        {/* CONTROLES */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h2 style={{ color: "white", marginTop: 0 }}>Tienda de Mascota 💙</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: 0 }}>
            Personaliza el aspecto de tu compañero de estudio.
          </p>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "0.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* mostrar / ocultar */}
            <div>
              <h4
                style={{
                  color: "#A0AEC0",
                  marginBottom: "0.8rem",
                  fontSize: "0.9rem",
                }}
              >
                Mostrar mascota
              </h4>
              <button
                onClick={() => updatePet("enabled", !pet.enabled)}
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "0.8rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  background: pet.enabled ? "#22c55e" : "#4b5563",
                  color: "white",
                }}
              >
                {pet.enabled ? "Visible" : "Oculta"}
              </button>
            </div>

            {/* color */}
            <div>
              <h4
                style={{
                  color: "#A0AEC0",
                  marginBottom: "0.8rem",
                  fontSize: "0.9rem",
                }}
              >
                Color principal
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.7rem",
                }}
              >
                {[
                  "#1CB0F6",
                  "#3b82f6",
                  "#22c55e",
                  "#f97316",
                  "#ec4899",
                  "#6366f1",
                  "#0f172a",
                ].map((c) => (
                  <ColorCircle
                    key={c}
                    color={c}
                    isSelected={pet.color === c}
                    onClick={() => updatePet("color", c)}
                  />
                ))}
              </div>
            </div>

            {/* estado de ánimo */}
            <div>
              <h4
                style={{
                  color: "#A0AEC0",
                  marginBottom: "0.8rem",
                  fontSize: "0.9rem",
                }}
              >
                Estado de ánimo
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                  gap: "1rem",
                }}
              >
                <OptionBox
                  onClick={() => updatePet("mood", "happy")}
                  isSelected={pet.mood === "happy"}
                >
                  <div style={{ fontSize: "2rem" }}>😄</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Feliz
                  </span>
                </OptionBox>
                <OptionBox
                  onClick={() => updatePet("mood", "sleepy")}
                  isSelected={pet.mood === "sleepy"}
                >
                  <div style={{ fontSize: "2rem" }}>😴</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Con sueño
                  </span>
                </OptionBox>
                <OptionBox
                  onClick={() => updatePet("mood", "angry")}
                  isSelected={pet.mood === "angry"}
                >
                  <div style={{ fontSize: "2rem" }}>😡</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Enojado
                  </span>
                </OptionBox>
              </div>
            </div>

            {/* accesorios */}
            <div>
              <h4
                style={{
                  color: "#A0AEC0",
                  marginBottom: "0.8rem",
                  fontSize: "0.9rem",
                }}
              >
                Accesorios
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                  gap: "1rem",
                }}
              >
                <OptionBox
                  onClick={() => updatePet("accessory", "none")}
                  isSelected={pet.accessory === "none"}
                >
                  <div style={{ fontSize: "2rem" }}>🚫</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Ninguno
                  </span>
                </OptionBox>
                <OptionBox
                  onClick={() => updatePet("accessory", "glasses")}
                  isSelected={pet.accessory === "glasses"}
                >
                  <div style={{ fontSize: "2rem" }}>👓</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Gafas
                  </span>
                </OptionBox>
                <OptionBox
                  onClick={() => updatePet("accessory", "shoes")}
                  isSelected={pet.accessory === "shoes"}
                >
                  <div style={{ fontSize: "2rem" }}>👟</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Zapatos
                  </span>
                </OptionBox>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #1f2933",
            }}
          >
            <button
              onClick={onCancel}
              style={{
                background: "transparent",
                border: "2px solid #64748b",
                color: "#cbd5f5",
                padding: "0.7rem 1.4rem",
                borderRadius: "0.8rem",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(pet)}
              style={{
                background: "#38bdf8",
                border: "none",
                color: "white",
                padding: "0.7rem 1.4rem",
                borderRadius: "0.8rem",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 4px 0 #0284c7",
              }}
            >
              Guardar mascota
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PetEditor;
