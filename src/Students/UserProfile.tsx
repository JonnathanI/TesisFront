// src/Students/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire, FaBolt, FaCrown, FaUser, FaPen, FaMedal } from "react-icons/fa";

import {
  getUserProfile,
  updateUserAvatar,
  buyShopItem,
} from "../api/auth.service";

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

  // ✅ skins que el usuario ya tiene
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);

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

  // 💎 compra/equipado de skins desde el perfil
// dentro de UserProfile.tsx (o StudentDashboard, si lo usas ahí también)
const handleAvatarSkinPurchase = async (
  skinId: string,
  cost: number
): Promise<boolean> => {
  if (!profile) return false;

  if (profile.lingots < cost) {
    alert("No tienes suficientes diamantes para este aspecto.");
    return false;
  }

  try {
    // 🔴 ANTES (da error de Ítem desconocido)
    // await buyShopItem(`SKIN_${skinId.toUpperCase()}`);

    // ✅ AHORA: mandamos el id TAL CUAL lo definiste en SEASONAL_SKINS
    await buyShopItem(skinId);

    // Recargar perfil para actualizar lingots y skins desbloqueados
    const fresh = await getUserProfile();
    setProfile(fresh);

    const unlocked = ((fresh as any).unlockedSkins || []) as string[];
    setOwnedSkins(unlocked);

    alert("¡Aspecto adquirido/equipado!");
    return true;
  } catch (error: any) {
    console.error(error);
    alert(error.message || "Error al comprar el aspecto.");
    return false;
  }
};

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);

        // ✅ leer skins desbloqueados del backend, si existen
        const unlocked = ((data as any).unlockedSkins || []) as string[];
        setOwnedSkins(unlocked);

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

  const styles = `
    .up-root{
      width: 100%;
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px;
      font-family: sans-serif;
    }

    .up-wrap{
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      justify-content: center;
    }

    .up-col{
      flex: 1 1 520px;
      max-width: 720px;
      min-width: 0;
    }

    .up-card{
      background-color: #f0f4f7;
      border-radius: 24px;
      padding: 24px;
      margin-bottom: 24px;
      position: relative;
      display: flex;
      gap: 24px;
      align-items: center;
      min-width: 0;
    }

    .up-top-right{
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 14px;
      font-weight: 800;
      font-size: 14px;
    }

    .up-edit-btn{
      position: absolute;
      top: 16px;
      left: 16px;
      background: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      color: #1cb0f6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .up-left{
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 200px;
      flex: 0 0 auto;
    }

    .up-avatar-bubble{
      position: relative;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: #fff;
      border: 4px solid #1cb0f6;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      flex: 0 0 auto;
    }

    .up-pet-bubble{
      position: absolute;
      right: -4px;
      bottom: -4px;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 20%, #ffffff, #c2e4ff);
      box-shadow: 0 6px 12px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid #1cb0f6;
    }

    .up-right{
      flex: 1;
      min-width: 220px;
      min-width: 0;
    }

    .up-name{
      font-size: 1.8rem;
      margin: 0 0 4px 0;
      font-weight: 800;
      color: #4b4b4b;
      word-break: break-word;
    }

    .up-user{
      color: #777;
      margin: 0;
      word-break: break-word;
    }

    .up-joined{
      font-size: 0.9rem;
      color: #999;
      margin-top: 8px;
      margin-bottom: 14px;
    }

    .up-pet-tip{
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      padding: 12px 14px;
      font-size: 0.85rem;
      color: #406083;
      max-width: 260px;
    }

    .up-h2{
      font-size: 1.4rem;
      margin: 0 0 12px 0;
    }

    .up-stats-grid{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .up-achievements{
      border: 2px solid #e5e5e5;
      border-radius: 16px;
      background-color: white;
      overflow: hidden;
    }

    /* ✅ Tablet: ajustes suaves */
    @media (max-width: 1024px){
      .up-card{ padding: 20px; }
      .up-avatar-bubble{ width: 160px; height: 160px; }
      .up-pet-bubble{ width: 66px; height: 66px; }
      .up-left{ min-width: 180px; }
      .up-name{ font-size: 1.6rem; }
      .up-pet-tip{ max-width: 100%; }
    }

    /* ✅ Mobile: tarjeta en columna + elementos compactos */
    @media (max-width: 600px){
      .up-root{ padding: 12px; }
      .up-card{
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 14px;
        padding-top: 58px; /* deja espacio para botones arriba */
      }

      .up-top-right{
        top: 12px;
        right: 12px;
        gap: 10px;
        font-size: 13px;
      }

      .up-edit-btn{
        top: 12px;
        left: 12px;
      }

      .up-left{
        min-width: 0;
      }

      .up-avatar-bubble{
        width: 140px;
        height: 140px;
      }

      .up-pet-bubble{
        width: 60px;
        height: 60px;
      }

      .up-right{
        min-width: 0;
        width: 100%;
      }

      .up-name{
        font-size: 1.4rem;
      }

      .up-pet-tip{
        max-width: 100%;
        margin: 0 auto;
      }

      .up-stats-grid{
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    /* ✅ Extra small */
    @media (max-width: 380px){
      .up-stats-grid{
        grid-template-columns: 1fr;
      }
      .up-avatar-bubble{
        width: 130px;
        height: 130px;
      }
    }
  `;

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
      className="up-root"
    >
      <style>{styles}</style>

      <div className="up-wrap">
        {/* 🧍‍♂️ TARJETA PRINCIPAL + SUBBURBUJA DE MASCOTA */}
        <div className="up-col">
          <div className="up-card">
            {/* Racha y lingots */}
            <div className="up-top-right">
              <div
                style={{
                  color: "#ff9600",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <FireIcon /> {profile.currentStreak}
              </div>
              <div
                style={{
                  color: "#1cb0f6",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                💎 {profile.lingots}
              </div>
            </div>

            {/* Botón editar avatar */}
            <button
              className="up-edit-btn"
              onClick={() => setShowAvatarEditor(true)}
            >
              <PenIcon />
            </button>

            {/* COLUMNA IZQ: AVATAR + SUBBURBUJA MASCOTA */}
            <div className="up-left">
              <div className="up-avatar-bubble">
                {avatar ? (
                  <AnimatedAvatarRenderer avatar={avatar} size={180} />
                ) : (
                  <UserIcon size={80} color="#ccc" />
                )}

                {/* Sub-burbuja mascota */}
                <div
                  className="up-pet-bubble"
                  onClick={() => setShowPetEditor(true)}
                >
                  {pet ? (
                    <PetRenderer pet={pet} size={60} />
                  ) : (
                    <span style={{ fontSize: "2rem" }}>🦉</span>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DER: NOMBRE + TIP */}
            <div className="up-right">
              <h1 className="up-name">{profile.fullName}</h1>
              <p className="up-user">@{profile.username}</p>
              <p className="up-joined">Se unió en {joinedDate}</p>

              <div className="up-pet-tip">
                <strong>Mascota:</strong> Tu compañero de estudio. Personaliza
                su estilo en la tienda de mascota: puedes ponerlo feliz, con
                sueño o enojado.
              </div>
            </div>
          </div>

          {/* ESTADÍSTICAS */}
          <h2 className="up-h2">Estadísticas</h2>
          <div className="up-stats-grid">
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
          <h2 className="up-h2">Logros e Insignias</h2>
          <div className="up-achievements">
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
                profile.totalXp >= 500 ? 3 : profile.totalXp >= 100 ? 1 : 0
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
            // 👇 ahora este editor también ve tus lingots y skins
            userLingots={profile.lingots}
            ownedSkins={ownedSkins}
            onPurchase={handleAvatarSkinPurchase}
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
      minWidth: 0,
    }}
  >
    <span style={{ fontSize: "1.4rem" }}>{icon}</span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: "bold", fontSize: "1rem", color: "#4b4b4b" }}>
        {value}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "#aaa",
          textTransform: "uppercase",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
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
      flexWrap: "wrap",
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
        flex: "0 0 auto",
      }}
    >
      {icon}
    </div>

    <div style={{ flex: 1, minWidth: 220 }}>
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
        />
      </div>
    </div>
  </div>
);