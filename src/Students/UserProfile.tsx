import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire, FaBolt, FaCrown, FaUser, FaPen, FaSearch, FaEnvelope, FaMedal } from 'react-icons/fa';

// Imports de tu proyecto
import { getUserProfile, updateUserAvatar, UserProfileData } from "../api/auth.service";
import AvatarEditor, { AvatarAttributes, AnimatedAvatarRenderer } from './AvatarEditor';

// --- SOLUCIÓN DE TIPOS ---
const FireIcon = FaFire as any;
const BoltIcon = FaBolt as any;
const CrownIcon = FaCrown as any;
const UserIcon = FaUser as any;
const PenIcon = FaPen as any;
const SearchIcon = FaSearch as any;
const EnvelopeIcon = FaEnvelope as any;
const MedalIcon = FaMedal as any;

// --- LÓGICA DE GAMIFICACIÓN (REQ-005) ---
const calculateLevel = (xp: number) => {
  if (xp < 100) return 1;
  if (xp < 500) return 2;
  if (xp < 1200) return 3;
  return Math.floor(xp / 500) + 1;
};

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [userAvatar, setUserAvatar] = useState<AvatarAttributes | undefined>(undefined);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);

        if (data.avatarData) {
          setUserAvatar(JSON.parse(data.avatarData));
        } else {
          const saved = localStorage.getItem('userAvatar');
          if (saved) setUserAvatar(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div style={{ color: "white", textAlign: "center", padding: "4rem" }}>Cargando perfil...</div>;
  if (!profile) return <div style={{ color: "#ff4b4b", textAlign: "center", padding: "4rem" }}>Error de conexión.</div>;

  const currentLevel = calculateLevel(profile.totalXp);
  const joinedDate = new Date(profile.joinedAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif' }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        
        {/* COLUMNA PRINCIPAL */}
        <div style={{ flex: '1 1 500px', maxWidth: '700px' }}>
          
          {/* TARJETA DE PERFIL (REQ-005: Mostrar nivel y XP) */}
          <div style={{ backgroundColor: '#f0f4f7', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
              <div style={{ color: '#ff9600' }}><FireIcon /> {profile.currentStreak}</div>
              <div style={{ color: '#1cb0f6' }}>💎 {profile.lingots}</div>
            </div>

            <button 
              onClick={() => setShowAvatarEditor(true)}
              style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: '#1cb0f6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <PenIcon />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: '#fff', border: '4px solid #1cb0f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                {userAvatar ? <AnimatedAvatarRenderer attrs={userAvatar} size={160} /> : <UserIcon size={80} color="#ccc" />}
              </div>
              <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>{profile.fullName}</h1>
              <p style={{ color: '#777', margin: 0 }}>@{profile.username}</p>
              <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>Se unió en {joinedDate}</p>
            </div>
          </div>

          {/* ESTADÍSTICAS (REQ-005: Puntos acumulados) */}
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Estadísticas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatBox icon={<FireIcon color="#ff9600" />} value={profile.currentStreak.toString()} label="Racha" />
            <StatBox icon={<BoltIcon color="#ffc800" />} value={profile.totalXp.toString()} label="XP Total" />
            <StatBox icon={<CrownIcon color="#ce82ff" />} value={`Nivel ${currentLevel}`} label={profile.league} />
            <StatBox icon={<MedalIcon color="#00ffc2" />} value="0" label="Top 3" />
          </div>

          {/* LOGROS (REQ-005: Mostrar insignias) */}
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Logros e Insignias</h2>
          <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', backgroundColor: 'white', overflow: 'hidden' }}>
            <AchievementItem 
              icon={<FireIcon />} color="#ff9600" title="En el blanco" desc="Racha de 7 días" 
              level={profile.currentStreak >= 7 ? 3 : (profile.currentStreak >= 1 ? 1 : 0)} maxLevel={3} 
            />
            <AchievementItem 
              icon={<BoltIcon />} color="#58cc02" title="Intelectual" desc="Gana 500 XP" 
              level={profile.totalXp >= 500 ? 3 : (profile.totalXp >= 100 ? 1 : 0)} maxLevel={3} 
            />
          </div>
        </div>

      
      </div>

      {/* MODAL DEL EDITOR */}
      <AnimatePresence>
        {showAvatarEditor && (
          <AvatarEditor
            initialAvatar={userAvatar}
            onSave={async (newAvatar) => {
              setUserAvatar(newAvatar);
              setShowAvatarEditor(false);
              try {
                await updateUserAvatar(newAvatar);
                localStorage.setItem('userAvatar', JSON.stringify(newAvatar));
              } catch(e) { alert("Error al guardar"); }
            }}
            onCancel={() => setShowAvatarEditor(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// COMPONENTES INTERNOS
const StatBox = ({ icon, value, label }: any) => (
  <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: 'white' }}>
    <span style={{ fontSize: '1.4rem' }}>{icon}</span>
    <div>
      <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase' }}>{label}</div>
    </div>
  </div>
);

const AchievementItem = ({ icon, color, title, desc, level, maxLevel }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', borderBottom: '1px solid #eee' }}>
    <div style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: level > 0 ? color : '#eee', color: 'white', fontSize: '1.4rem' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: '1rem' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#777' }}>{desc}</p>
      <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginTop: '0.5rem' }}>
        <div style={{ height: '100%', background: color, borderRadius: '4px', width: `${(level / maxLevel) * 100}%` }}></div>
      </div>
    </div>
  </div>
);

const MenuLink = ({ icon, text }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', color: '#1cb0f6', fontWeight: 'bold', fontSize: '0.9rem' }}>
    {icon} <span>{text}</span>
  </div>
);