// src/Students/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFire,
  FaBolt,
  FaCrown,
  FaUser,
  FaPen,
  FaMedal,
} from "react-icons/fa";

import { getUserProfile, updateUserAvatar } from "../api/auth.service";
import AvatarEditor, {
  AnimatedAvatarRenderer,
  AvatarAttributes,
  DEFAULT_AVATAR,
} from "./AvatarEditor";

import PetEditor, {
  PetRenderer,
  PetAttributes,
  DEFAULT_PET,
} from "./PetEditor";

import { UserProfileData } from "../api/auth.types";

// --- ICONOS COMO ANY PARA TS ---
const FireIcon = FaFire as any;
const BoltIcon = FaBolt as any;
const CrownIcon = FaCrown as any;
const UserIcon = FaUser as any;
const PenIcon = FaPen as any;
const MedalIcon = FaMedal as any;

// --- LÓGICA DE NIVEL ---
const calculateLevel = (xp: number) => {
  if (xp < 100) return 1;
  if (xp < 500) return 2;
  if (xp < 1200) return 3;
  return Math.floor(xp / 500) + 1;
};

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState<AvatarAttributes | null>(null);
  const [pet, setPet] = useState<PetAttributes | null>(null);

  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showPetEditor, setShowPetEditor] = useState(false);

  // 👉 helper para guardar avatar+mascota juntos
  const persistAvatar = async (
    avatarToSave: AvatarAttributes,
    petToSave: PetAttributes | null
  ) => {
    const payload: any = { ...avatarToSave };
    if (petToSave) payload.pet = petToSave;

    try {
      await updateUserAvatar(payload);
      localStorage.setItem("userAvatar", JSON.stringify(payload));
    } catch (e) {
      console.error(e);
      alert("Error al guardar el avatar");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);

        let avatarFromServer: AvatarAttributes | null = null;
        let petFromServer: PetAttributes | null = null;

        if (data.avatarData) {
          try {
            const parsed = JSON.parse(data.avatarData);
            const { pet: parsedPet, ...rest } = parsed;
            avatarFromServer = rest as AvatarAttributes;
            petFromServer = parsedPet ?? DEFAULT_PET;
          } catch (e) {
            console.warn("Error parseando avatarData desde backend:", e);
          }
        }

        // Si no vino nada del servidor, buscamos en localStorage
        if (!avatarFromServer) {
          const saved = localStorage.getItem("userAvatar");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              const { pet: parsedPet, ...rest } = parsed;
              avatarFromServer = rest as AvatarAttributes;
              petFromServer = parsedPet ?? DEFAULT_PET;
            } catch (e) {
              console.warn("Error parseando avatar desde localStorage:", e);
            }
          }
        }

        setAvatar(avatarFromServer ?? DEFAULT_AVATAR);
        setPet(petFromServer ?? DEFAULT_PET);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading)
    return (
      <div style={{ color: "white", textAlign: "center", padding: "4rem" }}>
        Cargando perfil...
      </div>
    );
  if (!profile)
    return (
      <div style={{ color: "#ff4b4b", textAlign: "center", padding: "4rem" }}>
        Error de conexión.
      </div>
    );

  const currentLevel = calculateLevel(profile.totalXp);
  const joinedDate = new Date(profile.joinedAt).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "1rem",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center",
        }}
      >
        {/* 🧍‍♂️ TARJETA PRINCIPAL + SUBBURBUJA DE MASCOTA */}
        <div style={{ flex: "1 1 520px", maxWidth: "720px" }}>
          <div
            style={{
              backgroundColor: "#f0f4f7",
              borderRadius: "1.5rem",
              padding: "2rem",
              marginBottom: "2rem",
              position: "relative",
              display: "flex",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            {/* Racha y lingots */}
            <div
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                display: "flex",
                gap: "1rem",
                fontWeight: "bold",
              }}
            >
              <div style={{ color: "#ff9600" }}>
                <FireIcon /> {profile.currentStreak}
              </div>
              <div style={{ color: "#1cb0f6" }}>💎 {profile.lingots}</div>
            </div>

            {/* Botón editar avatar */}
            <button
              onClick={() => setShowAvatarEditor(true)}
              style={{
                position: "absolute",
                top: "1.5rem",
                left: "1.5rem",
                background: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                color: "#1cb0f6",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <PenIcon />
            </button>

            {/* COLUMNA IZQ: AVATAR + SUBBURBUJA MASCOTA */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "200px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background: "#fff",
                  border: "4px solid #1cb0f6",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                {/* Avatar grande */}
                {avatar ? (
                  <AnimatedAvatarRenderer avatar={avatar} size={180} />
                ) : (
                  <UserIcon size={80} color="#ccc" />
                )}

                {/* 🦉 Sub-burbuja de mascota (bottom-right) */}
                <div
                  onClick={() => setShowPetEditor(true)}
                  style={{
                    position: "absolute",
                    right: "-4px",
                    bottom: "-4px",
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 30% 20%, #ffffff, #c2e4ff)",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "2px solid #1cb0f6",
                  }}
                >
                  {pet ? (
                    <PetRenderer pet={pet} size={60} />
                  ) : (
                    <span style={{ fontSize: "2rem" }}>🦉</span>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DER: NOMBRE + TIP MASCOTA */}
            <div style={{ flex: 1, minWidth: "220px" }}>
              <h1
                style={{
                  fontSize: "1.8rem",
                  margin: "0 0 0.2rem 0",
                  fontWeight: 700,
                  color: "#4b4b4b",
                }}
              >
                {profile.fullName}
              </h1>
              <p style={{ color: "#777", margin: 0 }}>@{profile.username}</p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#999",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                Se unió en {joinedDate}
              </p>

              {/* Mini card de info mascota */}
              <div
                style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "1rem",
                  padding: "0.8rem 1rem",
                  fontSize: "0.8rem",
                  color: "#406083",
                  maxWidth: "260px",
                }}
              >
                <strong>Mascota:</strong> Tu compañero de estudio.  
                Personaliza su estilo en la tienda de mascota: puedes ponerlo
                feliz, con sueño o enojado.
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS */}
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
            Estadísticas
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <StatBox
              icon={<FireIcon color="#ff9600" />}
              value={profile.currentStreak.toString()}
              label="Racha"
            />
            <StatBox
              icon={<BoltIcon color="#ffc800" />}
              value={profile.totalXp.toString()}
              label="XP Total"
            />
            <StatBox
              icon={<CrownIcon color="#ce82ff" />}
              value={`Nivel ${currentLevel}`}
              label={profile.league}
            />
            <StatBox
              icon={<MedalIcon color="#00ffc2" />}
              value="0"
              label="Top 3"
            />
          </div>

          {/* LOGROS */}
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
            Logros e Insignias
          </h2>
          <div
            style={{
              border: "2px solid #e5e5e5",
              borderRadius: "1rem",
              backgroundColor: "white",
              overflow: "hidden",
            }}
          >
            <AchievementItem
              icon={<FireIcon />}
              color="#ff9600"
              title="En el blanco"
              desc="Racha de 7 días"
              level={
                profile.currentStreak >= 7
                  ? 3
                  : profile.currentStreak >= 1
                  ? 1
                  : 0
              }
              maxLevel={3}
            />
            <AchievementItem
              icon={<BoltIcon />}
              color="#58cc02"
              title="Intelectual"
              desc="Gana 500 XP"
              level={
                profile.totalXp >= 500
                  ? 3
                  : profile.totalXp >= 100
                  ? 1
                  : 0
              }
              maxLevel={3}
            />
          </div>
        </div>
      </div>

      {/* MODALES */}
      <AnimatePresence>
        {showAvatarEditor && avatar && (
          <AvatarEditor
            initialAvatar={avatar}
            onSave={async (newAvatar) => {
              setAvatar(newAvatar);
              setShowAvatarEditor(false);
              await persistAvatar(newAvatar, pet ?? DEFAULT_PET);
            }}
            onCancel={() => setShowAvatarEditor(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPetEditor && pet && (
          <PetEditor
            initialPet={pet}
            onSave={async (newPet) => {
              setPet(newPet);
              setShowPetEditor(false);
              await persistAvatar(avatar ?? DEFAULT_AVATAR, newPet);
            }}
            onCancel={() => setShowPetEditor(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// COMPONENTES AUXILIARES
const StatBox = ({ icon, value, label }: any) => (
  <div
    style={{
      border: "2px solid #e5e5e5",
      borderRadius: "1rem",
      padding: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
      backgroundColor: "white",
    }}
  >
    <span style={{ fontSize: "1.4rem" }}>{icon}</span>
    <div>
      <div
        style={{ fontWeight: "bold", fontSize: "1rem", color: "#4b4b4b" }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "#aaa",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

const AchievementItem = ({
  icon,
  color,
  title,
  desc,
  level,
  maxLevel,
}: any) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1.2rem",
      borderBottom: "1px solid #eee",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: level > 0 ? color : "#eee",
        color: "white",
        fontSize: "1.4rem",
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h4
        style={{
          margin: 0,
          fontSize: "1rem",
          color: "#4b4b4b",
          fontWeight: "bold",
        }}
      >
        {title}
      </h4>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#777" }}>{desc}</p>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "#eee",
          borderRadius: "4px",
          marginTop: "0.5rem",
        }}
      >
        <div
          style={{
            height: "100%",
            background: color,
            borderRadius: "4px",
            width: `${(level / maxLevel) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  </div>
);
