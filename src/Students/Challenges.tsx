import React from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaClock, FaCheckCircle } from 'react-icons/fa';

const BoltIcon = FaBolt as any;
const ClockIcon = FaClock as any;
const CheckIcon = FaCheckCircle as any;

// === SVG DEL PÁJARO AZUL CARTOON (ESTILO DUOLINGO) ===
const CartoonBlueBirdSVG = () => (
    <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cuerpo Redondo Azul */}
        <ellipse cx="100" cy="100" rx="70" ry="65" fill="#1CB0F6" />
        {/* Ala Izquierda (vista desde el frente) */}
        <path d="M50 80 Q20 60 10 100 Q40 120 70 110 Q90 90 50 80 Z" fill="#007AFF" />
        {/* Ala Derecha */}
        <path d="M150 80 Q180 60 190 100 Q160 120 130 110 Q110 90 150 80 Z" fill="#007AFF" />
        
        {/* Panza Blanca */}
        <ellipse cx="100" cy="135" rx="45" ry="25" fill="white" />

        {/* Ojos Grandes Blancos */}
        <circle cx="75" cy="85" r="22" fill="white" />
        <circle cx="125" cy="85" r="22" fill="white" />
        
        {/* Pupilas Negras */}
        <circle cx="80" cy="85" r="8" fill="black" />
        <circle cx="120" cy="85" r="8" fill="black" />
        
        {/* Brillo en los ojos */}
        <circle cx="82" cy="82" r="3" fill="white" />
        <circle cx="122" cy="82" r="3" fill="white" />

        {/* Pico Naranja */}
        <path d="M90 105 Q100 125 110 105 Q100 95 90 105 Z" fill="#FF9600" />
        
        {/* Patas Naranjas */}
        <path d="M80 160 L80 175 M90 160 L90 175" stroke="#FF9600" strokeWidth="6" strokeLinecap="round" />
        <path d="M110 160 L110 175 M120 160 L120 175" stroke="#FF9600" strokeWidth="6" strokeLinecap="round" />
        
        {/* Sombra suave para el pájaro */}
        <filter id="bird-shadow" x="0" y="0" width="200" height="200">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.2" />
        </filter>
        <rect width="200" height="200" fill="none" filter="url(#bird-shadow)"/> {/* Aplicar sombra a todo el grupo */}
    </svg>
);

// === SVG DEL ICONO DE RANA/POLLO VERDE (para el desafío 3) ===
const DuoFaceSVG = () => (
    <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#58CC02" />
        <circle cx="35" cy="45" r="12" fill="white" />
        <circle cx="65" cy="45" r="12" fill="white" />
        <circle cx="35" cy="45" r="5" fill="black" />
        <circle cx="65" cy="45" r="5" fill="black" />
        <path d="M45 65 Q50 70 55 65" stroke="#FF9600" strokeWidth="4" strokeLinecap="round" />
    </svg>
);


interface Challenge {
  id: number;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  progress: number;
  total: number;
}

const dailyChallenges: Challenge[] = [
  {
    id: 1,
    icon: <BoltIcon />,
    iconColor: '#FFC800', // Amarillo
    title: "Gana 10 EXP",
    progress: 0,
    total: 10,
  },
  {
    id: 2,
    icon: <ClockIcon />,
    iconColor: '#1CB0F6', // Azul
    title: "Aprende durante 5 minutos",
    progress: 0,
    total: 5,
  },
  {
    id: 3,
    icon: <DuoFaceSVG />, // Icono personalizado verde
    iconColor: '#58CC02', // Verde
    title: "Responde correctamente 10 veces seguidas en 2 lecciones",
    progress: 0,
    total: 2,
  }
];

export default function Challenges() {
  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '1rem', fontFamily: "'DIN Round', 'Nunito', sans-serif" }}>
      
      {/* 1. BANNER MORADO (Estilo de la imagen de referencia) */}
      <div style={{
        background: 'linear-gradient(145deg, #a462ff 10%, #8a2be2 90%)', // Degradado morado
        borderRadius: '1.5rem',
        padding: '2.5rem 2rem',
        color: 'white',
        marginBottom: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Para que el pájaro y el texto estén en los extremos
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 0 #6f22b5', // Sombra 3D morada oscura
        minHeight: '220px'
      }}>
         
         {/* PÁJARO AZUL ANIMADO Y ARCOIRIS */}
         <motion.div 
            animate={{ y: [0, -5, 0], rotate: [0, 1, -1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
                zIndex: 3, 
                position: 'absolute', // Posición absoluta para colocarlo con precisión
                left: '-20px', 
                bottom: '-20px',
                transform: 'rotate(5deg)' // Pequeña rotación para simular vuelo
            }}
         >
            <CartoonBlueBirdSVG />
            {/* Arcoiris saliendo del pájaro */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '100px', // Ajusta estos valores
                width: '180px', height: '180px', borderRadius: '50%',
                background: 'conic-gradient(from 180deg at 50% 100%, #FF4B4B 0deg 20deg, #FF9600 20deg 40deg, #FFC800 40deg 60deg, #A4E66C 60deg 80deg, #1CB0F6 80deg 100deg, transparent 100deg)',
                opacity: 0.8, zIndex: 0,
                transform: 'rotate(-20deg)', // Ángulo del arcoiris
            }}></div>
         </motion.div>

         {/* TEXTO */}
         <div style={{ zIndex: 3, maxWidth: '60%', textAlign: 'left', marginLeft: 'auto', marginRight: '20px' }}> {/* Mueve el texto a la derecha */}
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1.1' }}>
                ¡Desafíate y recibe recompensas!
            </h2>
            <p style={{ opacity: 0.95, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Hoy completaste 0 de 3 desafíos.
            </p>
         </div>

         {/* Nubes Decorativas */}
         {/* Nube Superior Izquierda */}
         <div style={{
           position: 'absolute', top: '0px', left: '20px',
           width: '100px', height: '50px', background: 'rgba(255,255,255,0.2)',
           borderRadius: '50px 50px 0 0', filter: 'blur(1px)', zIndex: 1
         }}></div>
         {/* Nube Superior Derecha */}
         <div style={{
           position: 'absolute', top: '10px', right: '10px',
           width: '80px', height: '40px', background: 'rgba(255,255,255,0.25)',
           borderRadius: '40px 40px 0 0', filter: 'blur(1px)', zIndex: 1
         }}></div>
         {/* Nube Inferior Derecha */}
         <div style={{
           position: 'absolute', bottom: '0px', right: '50px',
           width: '120px', height: '60px', background: 'rgba(255,255,255,0.15)',
           borderRadius: '60px 60px 0 0', filter: 'blur(1px)', zIndex: 1
         }}></div>

      </div>

      {/* 2. CABECERA DE LISTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
         <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', margin: 0 }}>Desafíos del día</h3>
         <span style={{ color: '#1cb0f6', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
            <ClockIcon /> 14 HORAS
         </span>
      </div>

      {/* 3. LISTA DE TARJETAS (Estilo Oscuro) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {dailyChallenges.map((challenge, index) => {
          const percent = Math.min(100, Math.max(0, (challenge.progress / challenge.total) * 100));
          
          return (
            <div 
              key={challenge.id}
              style={{
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                background: '#131f24', // Fondo oscuro
                border: '2px solid #2c363a', // Borde
                borderRadius: '1rem',
                position: 'relative'
              }}
            >
              {/* Icono Izquierdo */}
              <div style={{ fontSize: '2.5rem', color: challenge.iconColor, minWidth: '50px', textAlign: 'center' }}>
                {challenge.icon}
              </div>

              {/* Información Central */}
              <div style={{ flex: 1 }}>
                 <h4 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {challenge.title}
                 </h4>
                 
                 {/* Barra de Progreso */}
                 <div style={{ position: 'relative', height: '18px', background: '#2c363a', borderRadius: '10px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1 }}
                      style={{
                        height: '100%',
                        background: challenge.iconColor, 
                        borderRadius: '10px',
                      }}
                    ></motion.div>
                    
                    {/* Texto de progreso (centrado) */}
                    <span style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', opacity: 0.8
                    }}>
                      {challenge.progress} / {challenge.total}
                    </span>
                 </div>
              </div>

              {/* Cofre de Madera (Emoji) */}
              <div style={{ fontSize: '3rem', cursor: 'pointer', filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.5))' }}>
                 📦 
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}