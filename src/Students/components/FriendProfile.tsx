import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { FaFire, FaBolt, FaCrown, FaUser, FaMedal, FaArrowLeft } from 'react-icons/fa';

// Imports de tu proyecto
import { getStudentDetailProgress, DetailedStudentProgress } from '../../api/auth.service';
import { AnimatedAvatarRenderer } from '../AvatarEditor';

// --- ICONOS ---
const FireIcon = FaFire as any;
const BoltIcon = FaBolt as any;
const CrownIcon = FaCrown as any;
const UserIcon = FaUser as any;
const MedalIcon = FaMedal as any;
const BackIcon = FaArrowLeft as any;

const calculateLevel = (xp: number) => {
  if (xp < 100) return 1;
  if (xp < 500) return 2;
  if (xp < 1200) return 3;
  return Math.floor(xp / 500) + 1;
};

export const FriendProfile = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [progress, setProgress] = useState<DetailedStudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (friendId) fetchFriendData();
  }, [friendId]);

  const fetchFriendData = async () => {
    try {
      setLoading(true);
      const data = await getStudentDetailProgress(friendId!);
      setProgress(data);
    } catch (err) {
      console.error("Error cargando perfil del amigo", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: "#777", textAlign: "center", padding: "4rem" }}>Cargando perfil...</div>;
  if (!progress) return <div style={{ color: "#ff4b4b", textAlign: "center", padding: "4rem" }}>Error de conexión.</div>;

  // Cálculos de XP (Si el backend no envía xpTotal, lo calculamos)
  const displayXP = progress.xpTotal || progress.units?.reduce((acc, unit) => 
    acc + (unit.lessons?.reduce((lAcc, l) => lAcc + (l.xpEarned || 0), 0) || 0), 0
  ) || 0;

  const perfectLessons = progress.units?.reduce((acc, unit) => 
    acc + (unit.lessons?.filter(l => l.isCompleted && l.mistakesCount === 0).length || 0), 0
  ) || 0;

  const currentLevel = calculateLevel(displayXP);

  // Parsear Avatar
  const getAvatarAttrs = () => {
    try {
      return progress.avatarData ? JSON.parse(progress.avatarData) : null;
    } catch {
      return null;
    }
  };

  const avatarAttrs = getAvatarAttrs();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif' }}
    >
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#1cb0f6', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <BackIcon /> VOLVER
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        
        <div style={{ flex: '1 1 500px', maxWidth: '700px' }}>
          
          <div style={{ backgroundColor: '#f0f4f7', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', border: '2px solid #e5e5e5' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '160px', height: '160px', borderRadius: '50%', background: '#fff', 
                border: '4px solid #ce82ff', overflow: 'hidden', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' 
              }}>
                {avatarAttrs ? (
                  <AnimatedAvatarRenderer attrs={avatarAttrs} size={160} />
                ) : (
                  <UserIcon size={80} color="#ccc" />
                )}
              </div>
              
              <h1 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#4b4b4b', fontWeight: 'bold' }}>
                {progress.fullName}
              </h1>
              <p style={{ color: '#777', margin: 0 }}>@{progress.username}</p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#4b4b4b' }}>Estadísticas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatBox icon={<FireIcon color="#ff9600" />} value={(progress.currentStreak || 0).toString()} label="Racha" />
            <StatBox icon={<BoltIcon color="#ffc800" />} value={displayXP.toString()} label="XP Total" />
            <StatBox icon={<CrownIcon color="#ce82ff" />} value={`Nivel ${currentLevel}`} label="Rango" />
            <StatBox icon={<MedalIcon color="#00ffc2" />} value={perfectLessons.toString()} label="Perfectas" />
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#4b4b4b' }}>Logros e Insignias</h2>
          <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', backgroundColor: 'white', overflow: 'hidden' }}>
            <AchievementItem 
              icon={<FireIcon />} color="#ff9600" title="En el blanco" desc="Lecciones sin errores" 
              level={perfectLessons >= 10 ? 3 : (perfectLessons >= 1 ? 1 : 0)} maxLevel={3} 
            />
            <AchievementItem 
              icon={<BoltIcon />} color="#58cc02" title="Intelectual" desc="Gana experiencia" 
              level={displayXP >= 500 ? 3 : (displayXP >= 100 ? 1 : 0)} maxLevel={3} 
            />
          </div>
        </div>

        <div style={{ flex: '1 1 300px', maxWidth: '350px' }}>
          <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', padding: '1.5rem', backgroundColor: 'white' }}>
            <h3 style={{ marginTop: 0, color: '#4b4b4b' }}>Amigo</h3>
            <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Estás viendo el progreso detallado de tu amigo. ¡Compite con él para ganar más XP!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatBox = ({ icon, value, label }: any) => (
  <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: 'white' }}>
    <span style={{ fontSize: '1.4rem' }}>{icon}</span>
    <div>
      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#4b4b4b' }}>{value}</div>
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
      <h4 style={{ margin: 0, fontSize: '1rem', color: '#4b4b4b', fontWeight: 'bold' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#777' }}>{desc}</p>
      <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginTop: '0.5rem' }}>
        <div style={{ height: '100%', background: color, borderRadius: '4px', width: `${(level / maxLevel) * 100}%` }}></div>
      </div>
    </div>
  </div>
);