// src/Students/AvatarEditor.tsx
import React, { useState } from "react";
import { motion, Variants } from "framer-motion";

/* ===========================
   1. TIPOS / DEFAULTS (AVATAR)
   =========================== */

export interface AvatarAttributes {
  skinTone: string;
  shirtColor: string;
  eyeColor: string;
  bodyType: "default" | "slim" | "broad";
  eyes: "default" | "happy" | "wink" | "angry" | "surprised" | "sleepy";
  mouth: "smile" | "frown" | "open" | "smirk";
  accessory: "none" | "hat" | "bowtie" | "glasses";
}

export const DEFAULT_AVATAR: AvatarAttributes = {
  skinTone: "#E0AC69",
  shirtColor: "#9C6FD6",
  eyeColor: "#9C6FD6",
  bodyType: "default",
  eyes: "default",
  mouth: "smile",
  accessory: "none",
};

/* ===========================
   2. PREVIEW DE OJOS
   =========================== */

interface EyeExpressionPreviewProps {
  skinTone: string;
  eyeColor: string;
  expression: AvatarAttributes["eyes"];
  size?: number;
}

const EyeExpressionPreview: React.FC<EyeExpressionPreviewProps> = ({
  skinTone,
  eyeColor,
  expression,
  size = 80,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={25} y={20} width={150} height={130} rx={40} fill={skinTone} />
    <g transform="translate(0, -15)">
      {expression === "default" && (
        <g>
          <ellipse cx={70} cy={85} rx={22} ry={28} fill="white" />
          <ellipse cx={130} cy={85} rx={22} ry={28} fill="white" />
          <ellipse cx={70} cy={85} rx={10} ry={12} fill={eyeColor} />
          <ellipse cx={130} cy={85} rx={10} ry={12} fill={eyeColor} />
          <circle cx={75} cy={80} r={3} fill="white" opacity={0.8} />
          <circle cx={135} cy={80} r={3} fill="white" opacity={0.8} />
        </g>
      )}
      {expression === "surprised" && (
        <g>
          <ellipse cx={70} cy={85} rx={25} ry={30} fill="white" />
          <ellipse cx={130} cy={85} rx={25} ry={30} fill="white" />
          <ellipse cx={70} cy={85} rx={8} ry={10} fill={eyeColor} />
          <ellipse cx={130} cy={85} rx={8} ry={10} fill={eyeColor} />
        </g>
      )}
      {expression === "sleepy" && (
        <g>
          <path
            d="M50 95 Q70 110 90 95"
            stroke="#333"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M110 95 Q130 110 150 95"
            stroke="#333"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      {expression === "happy" && (
        <g stroke="#333" strokeWidth={4} fill="none" strokeLinecap="round">
          <path d="M55 95 Q70 75 85 95" />
          <path d="M115 95 Q130 75 145 95" />
        </g>
      )}
      {expression === "angry" && (
        <g>
          <line
            x1={55}
            y1={65}
            x2={85}
            y2={75}
            stroke="#333"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={115}
            y1={75}
            x2={145}
            y2={65}
            stroke="#333"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <ellipse cx={70} cy={90} rx={18} ry={24} fill="white" />
          <ellipse cx={130} cy={90} rx={18} ry={24} fill="white" />
          <ellipse cx={70} cy={90} rx={8} ry={10} fill={eyeColor} />
          <ellipse cx={130} cy={90} rx={8} ry={10} fill={eyeColor} />
        </g>
      )}
      {expression === "wink" && (
        <g>
          <ellipse cx={70} cy={85} rx={22} ry={28} fill="white" />
          <ellipse cx={70} cy={85} rx={10} ry={12} fill={eyeColor} />
          <circle cx={75} cy={80} r={3} fill="white" opacity={0.8} />
          <path
            d="M110 95 Q130 105 150 95"
            stroke="#333"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  </svg>
);

/* ===========================
   3. RENDER AVATAR (solo persona)
   =========================== */

interface AvatarRendererProps {
  avatar: AvatarAttributes;
  size?: number;
}

export const AnimatedAvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatar,
  size = 200,
}) => {
  const { skinTone, shirtColor, eyeColor, bodyType, eyes, mouth, accessory } =
    avatar;

  const bodyBaseY = 145;
  const bodyHeight = 105;
  let bodyWidth = 150;
  let bodyX = 25;

  if (bodyType === "slim") {
    bodyWidth = 120;
    bodyX = 40;
  } else if (bodyType === "broad") {
    bodyWidth = 180;
    bodyX = 10;
  }

  const armWidth = 40;
  const armHeight = 80;
  const armRx = 20;
  const armY = bodyBaseY + 20;

  const breathingVariant: Variants = {
    initial: { y: 0 },
    animate: {
      y: [0, -3, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const headBobVariant: Variants = {
    initial: { rotate: 0 },
    animate: {
      rotate: [-1, 1, -1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const blinkVariant: Variants = {
    initial: { scaleY: 1 },
    animate: {
      scaleY: [1, 1, 1, 1, 0.1, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        times: [0, 0.8, 0.9, 0.95, 0.98, 1],
      },
    },
  };

  const armLeftVariant: Variants = {
    initial: { rotate: 0, x: 0 },
    animate: {
      rotate: [0, 8, 0],
      x: [0, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const armRightVariant: Variants = {
    initial: { rotate: 0, x: 0 },
    animate: {
      rotate: [0, -8, 0],
      x: [0, 2, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 200 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={breathingVariant}
      initial="initial"
      animate="animate"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* CUERPO */}
      <g>
        <motion.rect
          x={bodyX - 20}
          y={armY}
          width={armWidth}
          height={armHeight}
          rx={armRx}
          fill={skinTone}
          style={{ originX: `${bodyX + 10}px`, originY: `${armY}px` }}
          variants={armLeftVariant}
          initial="initial"
          animate="animate"
        />
        <motion.rect
          x={bodyX + bodyWidth - (armWidth - 20)}
          y={armY}
          width={armWidth}
          height={armHeight}
          rx={armRx}
          fill={skinTone}
          style={{
            originX: `${bodyX + bodyWidth - 10}px`,
            originY: `${armY}px`,
          }}
          variants={armRightVariant}
          initial="initial"
          animate="animate"
        />
        <rect
          x={bodyX}
          y={bodyBaseY}
          width={bodyWidth}
          height={bodyHeight}
          rx={40}
          fill={shirtColor}
        />
      </g>

      {/* CABEZA */}
      <motion.g
        variants={headBobVariant}
        initial="initial"
        animate="animate"
        style={{ originX: "100px", originY: "110px" }}
      >
        <rect x={75} y={115} width={50} height={30} rx={10} fill={skinTone} />
        <rect x={25} y={40} width={150} height={130} rx={40} fill={skinTone} />
        <circle cx={25} cy={105} r={15} fill={skinTone} />
        <circle cx={175} cy={105} r={15} fill={skinTone} />
        <path d="M100 110 L90 125 L110 125 Z" fill="#8D5F4D" />

        {/* OJOS */}
        <motion.g
          variants={blinkVariant}
          animate={
            eyes === "wink" ||
            eyes === "happy" ||
            eyes === "sleepy" ||
            accessory === "glasses"
              ? undefined
              : "animate"
          }
          style={{ originY: "85px" }}
        >
          {eyes === "default" && (
            <g>
              <ellipse cx={70} cy={85} rx={22} ry={28} fill="white" />
              <ellipse cx={130} cy={85} rx={22} ry={28} fill="white" />
              <ellipse cx={70} cy={85} rx={10} ry={12} fill={eyeColor} />
              <ellipse cx={130} cy={85} rx={10} ry={12} fill={eyeColor} />
              <circle cx={75} cy={80} r={3} fill="white" opacity={0.8} />
              <circle cx={135} cy={80} r={3} fill="white" opacity={0.8} />
            </g>
          )}
          {eyes === "surprised" && (
            <g>
              <ellipse cx={70} cy={85} rx={25} ry={30} fill="white" />
              <ellipse cx={130} cy={85} rx={25} ry={30} fill="white" />
              <ellipse cx={70} cy={85} rx={8} ry={10} fill={eyeColor} />
              <ellipse cx={130} cy={85} rx={8} ry={10} fill={eyeColor} />
            </g>
          )}
          {eyes === "sleepy" && (
            <g>
              <path
                d="M50 95 Q70 110 90 95"
                stroke="#333"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M110 95 Q130 110 150 95"
                stroke="#333"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )}
          {eyes === "happy" && (
            <g stroke="#333" strokeWidth={4} fill="none" strokeLinecap="round">
              <path d="M55 95 Q70 75 85 95" />
              <path d="M115 95 Q130 75 145 95" />
            </g>
          )}
          {eyes === "angry" && (
            <g>
              <line
                x1={55}
                y1={65}
                x2={85}
                y2={75}
                stroke="#333"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <line
                x1={115}
                y1={75}
                x2={145}
                y2={65}
                stroke="#333"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <ellipse cx={70} cy={90} rx={18} ry={24} fill="white" />
              <ellipse cx={130} cy={90} rx={18} ry={24} fill="white" />
              <ellipse cx={70} cy={90} rx={8} ry={10} fill={eyeColor} />
              <ellipse cx={130} cy={90} rx={8} ry={10} fill={eyeColor} />
            </g>
          )}
          {eyes === "wink" && (
            <g>
              <ellipse cx={70} cy={85} rx={22} ry={28} fill="white" />
              <ellipse cx={70} cy={85} rx={10} ry={12} fill={eyeColor} />
              <circle cx={75} cy={80} r={3} fill="white" opacity={0.8} />
              <path
                d="M110 95 Q130 105 150 95"
                stroke="#333"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )}
        </motion.g>

        {/* BOCA */}
        {mouth === "smile" && (
          <path
            d="M75 135 Q100 150 125 135"
            stroke="black"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {mouth === "frown" && (
          <path
            d="M75 145 Q100 130 125 145"
            stroke="black"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {mouth === "open" && (
          <ellipse cx={100} cy={140} rx={15} ry={10} fill="black" />
        )}
        {mouth === "smirk" && (
          <path
            d="M75 140 Q100 140 125 130"
            stroke="black"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* ACCESORIOS CABEZA */}
        {accessory === "hat" && (
          <g>
            <rect x={20} y={30} width={160} height={20} rx={5} fill="#333" />
            <rect x={50} y={-10} width={100} height={50} rx={10} fill="#333" />
          </g>
        )}
        {accessory === "glasses" && (
          <g>
            <ellipse
              cx={70}
              cy={85}
              rx={28}
              ry={34}
              stroke="black"
              strokeWidth={3}
              fill="none"
            />
            <ellipse
              cx={130}
              cy={85}
              rx={28}
              ry={34}
              stroke="black"
              strokeWidth={3}
              fill="none"
            />
            <line
              x1={97}
              y1={85}
              x2={103}
              y2={85}
              stroke="black"
              strokeWidth={3}
            />
            <line
              x1={42}
              y1={85}
              x2={15}
              y2={75}
              stroke="black"
              strokeWidth={3}
            />
            <line
              x1={158}
              y1={85}
              x2={185}
              y2={75}
              stroke="black"
              strokeWidth={3}
            />
          </g>
        )}
      </motion.g>

      {/* ACCESORIO DE CUERPO */}
      {accessory === "bowtie" && (
        <g fill="#FF4B4B">
          <polygon points="100,165 80,155 80,175" />
          <polygon points="100,165 120,155 120,175" />
          <circle cx={100} cy={165} r={5} fill="#cc0000" />
        </g>
      )}
    </motion.svg>
  );
};

/* ===========================
   4. SKINS DE TEMPORADA
   =========================== */

type AvatarTab =
  | "skin"
  | "eyes"
  | "mouth"
  | "body"
  | "shirt"
  | "extra"
  | "skins";

interface SeasonalSkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "navidad" | "san_valentin" | "cumple" | "halloween" | "nuevo_anio";
  emoji: string;
  overrides: Partial<AvatarAttributes>;
}

const SEASONAL_SKINS: SeasonalSkin[] = [
  {
    id: "XMAS_ELF",
    name: "Navidad Duende",
    description: "Sombrero navideño y suéter rojo festivo.",
    cost: 150,
    category: "navidad",
    emoji: "🎄",
    overrides: {
      shirtColor: "#EF4444",
      eyes: "happy",
      mouth: "smile",
      accessory: "hat",
    },
  },
  {
    id: "XMAS_SWEATER",
    name: "Jersey de Nieve",
    description: "Ropa azul hielo para la época navideña.",
    cost: 120,
    category: "navidad",
    emoji: "❄️",
    overrides: {
      shirtColor: "#1D4ED8",
      eyes: "sleepy",
      mouth: "smirk",
    },
  },
  {
    id: "VALENTINE_LOVE",
    name: "Amor y Amistad",
    description: "Colores rosados y mirada tierna.",
    cost: 130,
    category: "san_valentin",
    emoji: "💘",
    overrides: {
      shirtColor: "#EC4899",
      eyeColor: "#EC4899",
      eyes: "happy",
      mouth: "smile",
    },
  },
  {
    id: "BIRTHDAY_PARTY",
    name: "Cumpleaños",
    description: "Fiesta de cumpleaños con corbatín.",
    cost: 140,
    category: "cumple",
    emoji: "🎂",
    overrides: {
      accessory: "bowtie",
      eyes: "surprised",
      mouth: "open",
      shirtColor: "#F97316",
    },
  },
  {
    id: "NEWYEAR_FIREWORKS",
    name: "Año Nuevo",
    description: "Look brillante para recibir el año.",
    cost: 160,
    category: "nuevo_anio",
    emoji: "🎆",
    overrides: {
      shirtColor: "#FACC15",
      eyes: "surprised",
      mouth: "smile",
    },
  },
  {
    id: "HALLOWEEN_SPOOKY",
    name: "Halloween",
    description: "Mirada misteriosa con colores oscuros.",
    cost: 150,
    category: "halloween",
    emoji: "🎃",
    overrides: {
      shirtColor: "#111827",
      eyeColor: "#F97316",
      eyes: "angry",
      mouth: "smirk",
    },
  },
];

/* ===========================
   5. EDITOR DE AVATAR (MODAL)
   =========================== */

interface AvatarEditorProps {
  initialAvatar?: AvatarAttributes;
  onSave: (avatar: AvatarAttributes) => void;
  onCancel: () => void;

  // 💎 OPCIONALES → así no rompe el padre actual
  userLingots?: number;
  ownedSkins?: string[];
  onPurchase?: (skinId: string, cost: number) => Promise<boolean> | boolean;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  initialAvatar,
  onSave,
  onCancel,
  userLingots,
  ownedSkins,
  onPurchase,
}) => {
  const [currentAvatar, setCurrentAvatar] = useState<AvatarAttributes>(
    initialAvatar || DEFAULT_AVATAR
  );
  const [activeTab, setActiveTab] = useState<AvatarTab>("eyes");
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);

  // Valores seguros aunque el padre no los envíe
  const effectiveLingots = userLingots ?? 0;
  const effectiveOwnedSkins = ownedSkins ?? [];

  const updateAttr = (key: keyof AvatarAttributes, value: any) => {
    setCurrentAvatar((prev) => ({ ...prev, [key]: value }));
  };

  const skinTones = [
    "#FFDBAC",
    "#F1C27D",
    "#E0AC69",
    "#C68642",
    "#8D5524",
    "#5D4037",
  ];
  const shirtColors = [
    "#9C6FD6",
    "#58CC02",
    "#1CB0F6",
    "#FF4B4B",
    "#FFC800",
    "#FFFFFF",
    "#333333",
  ];
  const eyeColors = [
    "#000000",
    "#634e34",
    "#2e536f",
    "#3d6e70",
    "#7d5d8c",
    "#9b111e",
    "#ffc800",
    "#999999",
  ];

  const styles = `
    .ae-overlay{
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      padding: 14px;
    }

    .ae-modal{
      background: #1A202C;
      border-radius: 24px;
      width: 95%;
      max-width: 900px;
      height: min(90vh, 820px);
      display: flex;
      gap: 18px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      overflow: hidden;
      min-width: 0;
    }

    .ae-preview{
      flex: 0 0 350px;
      background: #EDF2F7;
      border-radius: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
      margin: 18px 0 18px 18px;
      min-height: 260px;
      min-width: 0;
    }

    .ae-controls{
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding: 18px 18px 18px 0;
    }

    .ae-title{
      color: white;
      margin: 0 0 14px 0;
    }

    .ae-tabs{
      display: flex;
      gap: 6px;
      border-bottom: 1px solid #4a5568;
      margin-bottom: 14px;
      overflow-x: auto;
      padding-bottom: 6px;
      -webkit-overflow-scrolling: touch;
    }

    .ae-tabbtn{
      padding: 10px 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      color: #aaa;
      font-weight: 800;
      white-space: nowrap;
    }

    .ae-tabbtn-active{
      border-bottom: 3px solid #1cb0f6;
      color: white;
    }

    .ae-scroll{
      flex: 1;
      overflow-y: auto;
      padding-right: 6px;
      min-height: 0;
    }

    .ae-actions{
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 14px;
      margin-top: 10px;
      border-top: 1px solid #2d3748;
      flex-wrap: wrap;
    }

    .ae-btn{
      padding: 12px 16px;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 900;
      border: none;
    }

    .ae-btn-cancel{
      background: transparent;
      border: 2px solid #a0aec0;
      color: #a0aec0;
    }

    .ae-btn-save{
      background: #58CC02;
      color: white;
      box-shadow: 0 4px 0 #46a302;
    }

    @media (max-width: 900px){
      .ae-modal{
        width: 100%;
        height: 100dvh;
        max-width: none;
        border-radius: 0;
        flex-direction: column;
        gap: 12px;
      }

      .ae-preview{
        flex: 0 0 auto;
        margin: 12px;
        height: 240px;
      }

      .ae-controls{
        padding: 0 12px 12px 12px;
      }

      .ae-actions{
        justify-content: stretch;
      }

      .ae-btn{
        flex: 1;
      }
    }

    @media (max-width: 420px){
      .ae-preview{ height: 210px; }
      .ae-tabbtn{ padding: 10px 10px; font-size: 13px; }
    }
  `;

  const TabBtn = ({ id, label }: { id: AvatarTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`ae-tabbtn ${activeTab === id ? "ae-tabbtn-active" : ""}`}
    >
      {label}
    </button>
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
        minWidth: 0,
      }}
    >
      {children}
    </motion.div>
  );

  const ColorCircle = ({ color, isSelected, onClick }: any) => (
    <motion.div
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        width: 50,
        height: 50,
        borderRadius: "50%",
        background: color,
        cursor: "pointer",
        border: isSelected ? "4px solid #1cb0f6" : "2px solid transparent",
        boxShadow: isSelected ? "0 0 10px #1cb0f6" : "none",
      }}
    />
  );

  const handleSkinAction = async (skin: SeasonalSkin) => {
    const isOwned = effectiveOwnedSkins.includes(skin.id);
    const isActive = selectedSkinId === skin.id;

    // Ya está equipado → nada
    if (isActive) return;

    // Si ya lo tiene → solo equipar
    if (isOwned) {
      setCurrentAvatar((prev) => ({ ...prev, ...skin.overrides }));
      setSelectedSkinId(skin.id);
      return;
    }

    // No lo tiene y no hay función de compra conectada
    if (!onPurchase) {
      alert(
        "La compra de aspectos aún no está conectada. Solo el desarrollador debe configurar onPurchase."
      );
      return;
    }

    if (effectiveLingots < skin.cost) {
      alert("No tienes suficientes diamantes.");
      return;
    }

    try {
      // Respetamos el booleano que devuelva el padre
      const purchaseResult = await Promise.resolve(
        onPurchase(skin.id, skin.cost)
      );

      if (!purchaseResult) {
        // el backend / padre decidió que la compra no se complete
        return;
      }

      // Si todo fue bien, equipamos el aspecto en el editor
      setCurrentAvatar((prev) => ({ ...prev, ...skin.overrides }));
      setSelectedSkinId(skin.id);
    } catch (e) {
      console.error("Error comprando skin:", e);
      alert("No se pudo completar la compra del aspecto.");
    }
  };

  return (
    <div className="ae-overlay">
      <style>{styles}</style>

      <motion.div
        className="ae-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* PREVIEW */}
        <div className="ae-preview">
          <AnimatedAvatarRenderer avatar={currentAvatar} />
        </div>

        {/* CONTROLES */}
        <div className="ae-controls">
          <h2 className="ae-title">Edita tu Avatar</h2>

          {/* pestañas */}
          <div className="ae-tabs">
            <TabBtn id="skin" label="Piel" />
            <TabBtn id="eyes" label="Ojos" />
            <TabBtn id="mouth" label="Boca" />
            <TabBtn id="body" label="Cuerpo" />
            <TabBtn id="shirt" label="Ropa" />
            <TabBtn id="extra" label="Extras" />
          </div>

          <div className="ae-scroll">
            {/* OJOS */}
            {activeTab === "eyes" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <h4
                    style={{
                      color: "#A0AEC0",
                      marginBottom: "0.8rem",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Color de ojos
                  </h4>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {eyeColors.map((c) => (
                      <ColorCircle
                        key={c}
                        color={c}
                        isSelected={currentAvatar.eyeColor === c}
                        onClick={() => updateAttr("eyeColor", c)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4
                    style={{
                      color: "#A0AEC0",
                      marginBottom: "0.8rem",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Expresión
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(110px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {(
                      [
                        "default",
                        "happy",
                        "wink",
                        "angry",
                        "surprised",
                        "sleepy",
                      ] as AvatarAttributes["eyes"][]
                    ).map((exp) => (
                      <OptionBox
                        key={exp}
                        onClick={() => updateAttr("eyes", exp)}
                        isSelected={currentAvatar.eyes === exp}
                      >
                        <EyeExpressionPreview
                          skinTone={currentAvatar.skinTone}
                          eyeColor={currentAvatar.eyeColor}
                          expression={exp}
                          size={80}
                        />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#ccc",
                            textTransform: "capitalize",
                          }}
                        >
                          {exp === "default"
                            ? "Normal"
                            : exp === "happy"
                            ? "Feliz"
                            : exp === "wink"
                            ? "Guiño"
                            : exp === "angry"
                            ? "Enojado"
                            : exp === "surprised"
                            ? "Sorpresa"
                            : "Sueño"}
                        </span>
                      </OptionBox>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PIEL */}
            {activeTab === "skin" && (
              <div>
                <h4 style={{ color: "#A0AEC0", marginBottom: "0.8rem" }}>
                  Tono de piel
                </h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {skinTones.map((c) => (
                    <ColorCircle
                      key={c}
                      color={c}
                      isSelected={currentAvatar.skinTone === c}
                      onClick={() => updateAttr("skinTone", c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ROPA */}
            {activeTab === "shirt" && (
              <div>
                <h4 style={{ color: "#A0AEC0", marginBottom: "0.8rem" }}>
                  Color de ropa
                </h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {shirtColors.map((c) => (
                    <ColorCircle
                      key={c}
                      color={c}
                      isSelected={currentAvatar.shirtColor === c}
                      onClick={() => updateAttr("shirtColor", c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* BOCA */}
            {activeTab === "mouth" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 12,
                }}
              >
                <OptionBox
                  onClick={() => updateAttr("mouth", "smile")}
                  isSelected={currentAvatar.mouth === "smile"}
                >
                  <div style={{ fontSize: "2.5rem" }}>😄</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Sonrisa
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("mouth", "frown")}
                  isSelected={currentAvatar.mouth === "frown"}
                >
                  <div style={{ fontSize: "2.5rem" }}>🙁</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Triste
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("mouth", "open")}
                  isSelected={currentAvatar.mouth === "open"}
                >
                  <div style={{ fontSize: "2.5rem" }}>😮</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Sorpresa
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("mouth", "smirk")}
                  isSelected={currentAvatar.mouth === "smirk"}
                >
                  <div style={{ fontSize: "2.5rem" }}>😏</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Mueca
                  </span>
                </OptionBox>
              </div>
            )}

            {/* CUERPO */}
            {activeTab === "body" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                }}
              >
                <OptionBox
                  onClick={() => updateAttr("bodyType", "default")}
                  isSelected={currentAvatar.bodyType === "default"}
                >
                  <div style={{ fontSize: "2.5rem" }}>🧍</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Normal
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("bodyType", "slim")}
                  isSelected={currentAvatar.bodyType === "slim"}
                >
                  <div style={{ fontSize: "2.5rem" }}>🚶‍♀️</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Delgado
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("bodyType", "broad")}
                  isSelected={currentAvatar.bodyType === "broad"}
                >
                  <div style={{ fontSize: "2.5rem" }}>💪</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Ancho
                  </span>
                </OptionBox>
              </div>
            )}

            {/* EXTRAS */}
            {activeTab === "extra" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                }}
              >
                <OptionBox
                  onClick={() => updateAttr("accessory", "none")}
                  isSelected={currentAvatar.accessory === "none"}
                >
                  <div style={{ fontSize: "2.5rem" }}>🚫</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Ninguno
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("accessory", "hat")}
                  isSelected={currentAvatar.accessory === "hat"}
                >
                  <div style={{ fontSize: "2.5rem" }}>🎩</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Sombrero
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("accessory", "glasses")}
                  isSelected={currentAvatar.accessory === "glasses"}
                >
                  <div style={{ fontSize: "2.5rem" }}>👓</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Lentes
                  </span>
                </OptionBox>

                <OptionBox
                  onClick={() => updateAttr("accessory", "bowtie")}
                  isSelected={currentAvatar.accessory === "bowtie"}
                >
                  <div style={{ fontSize: "2.5rem" }}>🎀</div>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    Corbatín
                  </span>
                </OptionBox>
              </div>
            )}

            {/* ASPECTOS DE TEMPORADA */}
            {activeTab === "skins" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <h4
                    style={{
                      color: "#A0AEC0",
                      margin: 0,
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Aspectos de temporada
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontWeight: 800,
                      color: "#1CB0F6",
                      fontSize: "0.95rem",
                    }}
                  >
                    <span>💎</span>
                    <span>{effectiveLingots}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {SEASONAL_SKINS.map((skin) => {
                    const isOwned = effectiveOwnedSkins.includes(skin.id);
                    const isActive = selectedSkinId === skin.id;
                    const canAfford =
                      effectiveLingots >= skin.cost && !!onPurchase;

                    return (
                      <motion.div
                        key={skin.id}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          padding: "0.9rem",
                          borderRadius: "0.9rem",
                          background: "#2D3748",
                          border: isActive
                            ? "2px solid #58CC02"
                            : isOwned
                            ? "2px solid #1CB0F6"
                            : "2px solid #4A5568",
                          color: "white",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "2rem",
                              lineHeight: 1,
                            }}
                          >
                            {skin.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: "0.95rem",
                                marginBottom: 2,
                              }}
                            >
                              {skin.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#CBD5E0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={skin.description}
                            >
                              {skin.description}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSkinAction(skin)}
                          disabled={!isOwned && (!onPurchase || !canAfford)}
                          style={{
                            marginTop: 4,
                            padding: "8px 10px",
                            borderRadius: 999,
                            border: "none",
                            cursor:
                              !isOwned && (!onPurchase || !canAfford)
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: 800,
                            fontSize: "0.8rem",
                            backgroundColor: isActive
                              ? "#58CC02"
                              : isOwned
                              ? "#1CB0F6"
                              : "#4A5568",
                            color: "white",
                            opacity:
                              !isOwned && (!onPurchase || !canAfford) ? 0.5 : 1,
                          }}
                        >
                          {isActive
                            ? "Equipado"
                            : isOwned
                            ? "Equipar"
                            : !onPurchase
                            ? "Compra no configurada"
                            : canAfford
                            ? `Comprar ${skin.cost} 💎`
                            : "Sin diamantes"}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="ae-actions">
            <button className="ae-btn ae-btn-cancel" onClick={onCancel}>
              Cancelar
            </button>
            <button
              className="ae-btn ae-btn-save"
              onClick={() => onSave(currentAvatar)}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarEditor;