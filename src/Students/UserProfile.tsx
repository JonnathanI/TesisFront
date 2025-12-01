import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Importamos los iconos y aplicamos el parche para TypeScript
import { FaFire, FaBolt, FaCrown, FaUser, FaPen, FaSearch, FaEnvelope, FaMedal } from 'react-icons/fa';

// Imports de tu proyecto
import { getUserProfile, updateUserAvatar, UserProfileData } from "../api/auth.service";
// IMPORTANTE: Importamos el editor Y el renderizador animado
import AvatarEditor, { AvatarAttributes, AnimatedAvatarRenderer } from './AvatarEditor';

// --- SOLUCIÓN AL ERROR DE TIPOS DE ICONOS ---
const FireIcon = FaFire as any;
const BoltIcon = FaBolt as any;
const CrownIcon = FaCrown as any;
const UserIcon = FaUser as any;
const PenIcon = FaPen as any;
const SearchIcon = FaSearch as any;
const EnvelopeIcon = FaEnvelope as any;
const MedalIcon = FaMedal as any;

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  
  // Estado para el avatar visual
  const [userAvatar, setUserAvatar] = useState<AvatarAttributes | undefined>(undefined);

  // 1. Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar datos del perfil del backend
        const data = await getUserProfile();
        setProfile(data);

        // Cargar avatar. Prioridad: BD > LocalStorage
        if (data.avatarData) {
            try {
                setUserAvatar(JSON.parse(data.avatarData));
            } catch(e) { console.error("Error parseando avatar de BD"); }
        } else {
            const saved = localStorage.getItem('userAvatar');
            if (saved) setUserAvatar(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div style={{ color: "white", textAlign: "center", padding: "4rem", fontSize: "1.2rem" }}>Cargando perfil...</div>;
  
  if (!profile) return <div style={{ color: "#ff4b4b", textAlign: "center", padding: "4rem" }}>No se pudo cargar el perfil.</div>;

  // Formatear fecha
  const dateObj = new Date(profile.joinedAt);
  const joinedText = `Se unió en ${dateObj.toLocaleString('es-ES', { month: 'long' })} de ${dateObj.getFullYear()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '1rem',
        fontFamily: "'DIN Round', 'Nunito', sans-serif",
        color: '#3c3c3c'
      }}
    >
      {/* CONTENEDOR FLEX RESPONSIVO */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', // Permite que baje si es pequeño
        gap: '2rem', 
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}>
        
        {/* === COLUMNA IZQUIERDA (Principal) === */}
        <div style={{ flex: '1 1 500px', minWidth: '300px', maxWidth: '700px' }}>
          
          {/* 1. TARJETA DE PERFIL */}
          <div style={{ 
            backgroundColor: '#dce6ea', 
            borderRadius: '1.2rem', 
            padding: '2rem', 
            marginBottom: '2rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            {/* Cabecera de iconos derecha */}
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem', fontWeight: 'bold', color: '#4b4b4b', fontSize: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <span>🇺🇸</span> US
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <FireIcon color="#ff9600" /> {profile.currentStreak}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1cb0f6' }}>
                 <span style={{ fontSize: '1.2rem' }}>💎</span> {profile.lingots}
              </div>
            </div>

            {/* Botón Editar (Lápiz) */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAvatarEditor(true)}
              style={{ 
                position: 'absolute', top: '1.5rem', left: '1.5rem', 
                background: 'white', border: 'none', borderRadius: '50%', 
                width: '45px', height: '45px', 
                boxShadow: '0 3px 0 #ccc', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#1cb0f6', fontSize: '1.2rem', zIndex: 10
              }}
            >
              <PenIcon />
            </motion.button>

            {/* --- AVATAR (ANIMADO AQUÍ) --- */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{
                  width: '180px', height: '180px', borderRadius: '50%',
                  background: '#e5e5e5', 
                  border: '5px solid #fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', marginBottom: '1rem'
                }}>
                  {userAvatar ? (
                    // ¡USAMOS EL COMPONENTE ANIMADO QUE CREAMOS ANTES!
                    <AnimatedAvatarRenderer attrs={userAvatar} size={180} />
                  ) : (
                    <UserIcon size={100} color="#d1d5db" />
                  )}
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#3c3c3c', margin: '0.5rem 0 0 0' }}>{profile.fullName}</h1>
                <p style={{ color: '#afafaf', fontSize: '1.1rem', margin: '0.2rem 0' }}>@{profile.username}</p>
                <p style={{ color: '#4b4b4b', fontSize: '0.95rem', marginTop: '1rem' }}>{joinedText}</p>
                
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', width: '100%', justifyContent: 'center' }}>
                   <div style={{ cursor: 'pointer' }}><strong style={{ color: '#3c3c3c' }}>0</strong> <span style={{ color: '#1cb0f6', fontWeight: 'bold' }}>Siguiendo</span></div>
                   <div style={{ cursor: 'pointer' }}><strong style={{ color: '#3c3c3c' }}>0</strong> <span style={{ color: '#1cb0f6', fontWeight: 'bold' }}>Seguidores</span></div>
                </div>
            </div>
          </div>

          {/* 2. ESTADÍSTICAS */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3c3c3c', marginBottom: '1rem' }}>Estadísticas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
             <StatBox icon={<FireIcon color="#ff9600" />} value={profile.currentStreak.toString()} label="Días de racha" />
             <StatBox icon={<BoltIcon color="#ffc800" />} value={profile.totalXp.toString()} label="XP Totales" />
             <StatBox icon={<CrownIcon color="#ce82ff" />} value={profile.league} label="División Actual" />
             <StatBox icon={<MedalIcon color="#00ffc2" />} value="0" label="Veces en el top 3" />
          </div>

          {/* 3. LOGROS */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3c3c3c', marginBottom: '1rem' }}>Logros</h2>
          <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', backgroundColor: 'white' }}>
             <AchievementItem 
                icon={<FireIcon />} 
                color="#ff9600"
                title="En el blanco" 
                desc="Alcanza una racha de 7 días" 
                level={profile.currentStreak >= 7 ? 3 : (profile.currentStreak > 0 ? 1 : 0)} 
                maxLevel={3} 
             />
             <AchievementItem 
                icon={<BoltIcon />} 
                color="#58cc02"
                title="Intelectual" 
                desc="Gana 100 XP" 
                level={profile.totalXp >= 100 ? 3 : (profile.totalXp > 0 ? 1 : 0)} 
                maxLevel={3} 
             />
          </div>

        </div>

        {/* === COLUMNA DERECHA (Lateral) === */}
        <div style={{ flex: '1 1 300px', minWidth: '280px', maxWidth: '350px' }}>
           
           {/* Cuadro Amigos */}
           <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: 'white' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3c3c3c', margin: '0 0 1.5rem 0' }}>Amigos</h3>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                 <p style={{ color: '#777', lineHeight: '1.5', fontSize: '0.95rem' }}>
                   Aprender es más divertido y efectivo cuando lo haces con amigos.
                 </p>
              </div>
           </div>

           {/* Cuadro Agregar Amigos */}
           <div style={{ border: '2px solid #e5e5e5', borderRadius: '1rem', padding: '0.5rem 0', backgroundColor: 'white' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3c3c3c', margin: '1rem 1.5rem' }}>Agregar amigos</h3>
              <MenuLink icon={<SearchIcon />} text="Encuentra a tus amigos" />
              <MenuLink icon={<EnvelopeIcon />} text="Invita a tus amigos" />
           </div>

           {/* Footer simple */}
           <div style={{ marginTop: '2rem', textAlign: 'center', color: '#afafaf', fontSize: '0.8rem' }}>
              <p>© 2025 EUROpeek</p>
              <p>Privacidad • Términos</p>
           </div>
        </div>

      </div>

      {/* === MODAL EDITOR DE AVATAR === */}
      <AnimatePresence>
        {showAvatarEditor && (
          <AvatarEditor
            initialAvatar={userAvatar}
            onSave={async (newAvatar) => {
                setUserAvatar(newAvatar); // Actualizar visualmente
                setShowAvatarEditor(false); // Cerrar modal
                
                // Guardar en Backend
                try {
                   await updateUserAvatar(newAvatar); 
                   // También en localStorage como respaldo rápido
                   localStorage.setItem('userAvatar', JSON.stringify(newAvatar));
                } catch(e) {
                   console.error("Error guardando avatar", e);
                   alert("Error al guardar el avatar en el servidor.");
                }
            }}
            onCancel={() => setShowAvatarEditor(false)}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// --- COMPONENTES AUXILIARES ---

const StatBox = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
  <div style={{ 
    border: '2px solid #e5e5e5', borderRadius: '1rem', padding: '1rem', 
    display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white' 
  }}>
     <span style={{ fontSize: '1.5rem' }}>{icon}</span>
     <div>
        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#3c3c3c' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#afafaf', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>{label}</div>
     </div>
  </div>
);

const AchievementItem = ({ icon, color, title, desc, level, maxLevel }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
    <div style={{ 
      width: '65px', height: '65px', borderRadius: '50%', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: '1.8rem', color: 'white',
      background: level > 0 ? `linear-gradient(135deg, ${color}, #ffd700)` : '#e5e5e5',
      boxShadow: level > 0 ? `0 4px 0 #b58900` : 'none'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3c3c3c', marginBottom: '0.3rem', margin: 0 }}>{title}</h3>
      <p style={{ color: '#777', fontSize: '0.95rem', margin: 0, lineHeight: '1.4' }}>{desc}</p>
      
      <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e5e5', borderRadius: '5px', marginTop: '0.8rem' }}>
        <div style={{ 
          height: '100%', background: color, borderRadius: '5px', 
          width: `${(level / maxLevel) * 100}%`,
          transition: 'width 0.5s ease'
        }}></div>
      </div>
    </div>
    <div style={{ color: '#afafaf', fontWeight: 'bold', fontSize: '0.9rem' }}>{level}/{maxLevel}</div>
  </div>
);

const MenuLink = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <motion.div 
    whileHover={{ backgroundColor: '#f7f7f7' }}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', 
      cursor: 'pointer', transition: 'background 0.2s'
    }}
  >
     <span style={{ fontSize: '1.2rem', color: '#1cb0f6' }}>{icon}</span>
     <span style={{ fontWeight: 'bold', color: '#4b4b4b', fontSize: '1rem' }}>{text}</span>
     <span style={{ marginLeft: 'auto', color: '#ccc', fontWeight: 'bold' }}>›</span>
  </motion.div>
);