import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';

// --- 1. DEFINICIÓN DE ATRIBUTOS ---
export interface AvatarAttributes {
  skinTone: string;
  shirtColor: string;
  eyeColor: string;
  bodyType: 'default' | 'slim' | 'broad';
  eyes: 'default' | 'happy' | 'wink' | 'angry' | 'surprised' | 'sleepy';
  mouth: 'smile' | 'frown' | 'open' | 'smirk';
  accessory: 'none' | 'hat' | 'bowtie' | 'glasses';
}

const defaultAvatar: AvatarAttributes = {
  skinTone: '#E0AC69', 
  shirtColor: '#9C6FD6',
  eyeColor: '#9C6FD6', 
  bodyType: 'default',
  eyes: 'default',
  mouth: 'smile',
  accessory: 'none',
};

// --- COMPONENTE AUXILIAR: PREVISUALIZACIÓN DE EXPRESIÓN DE OJOS (CON ESTILO DUOLINGO) ---
interface EyeExpressionPreviewProps {
  skinTone: string;
  eyeColor: string;
  expression: AvatarAttributes['eyes'];
  size?: number; 
}

const EyeExpressionPreview: React.FC<EyeExpressionPreviewProps> = ({ skinTone, eyeColor, expression, size = 80 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* CABEZA ESTILO DUOLINGO (Squircle) */}
      <rect x="25" y="20" width="150" height="130" rx="40" fill={skinTone} />
      
      {/* OJOS CON LA EXPRESIÓN DADA */}
      <g transform="translate(0, -15)"> {/* Ajuste vertical para centrar en la preview */}
        {expression === 'default' && (
            <g>
            <ellipse cx="70" cy="85" rx="22" ry="28" fill="white" />
            <ellipse cx="130" cy="85" rx="22" ry="28" fill="white" />
            <ellipse cx="70" cy="85" rx="10" ry="12" fill={eyeColor} />
            <ellipse cx="130" cy="85" rx="10" ry="12" fill={eyeColor} />
            <circle cx="75" cy="80" r="3" fill="white" opacity="0.8" />
            <circle cx="135" cy="80" r="3" fill="white" opacity="0.8" />
            </g>
        )}
        {expression === 'surprised' && (
            <g>
            <ellipse cx="70" cy="85" rx="25" ry="30" fill="white" />
            <ellipse cx="130" cy="85" rx="25" ry="30" fill="white" />
            <ellipse cx="70" cy="85" rx="8" ry="10" fill={eyeColor} />
            <ellipse cx="130" cy="85" rx="8" ry="10" fill={eyeColor} />
            </g>
        )}
        {expression === 'sleepy' && (
            <g>
            <path d="M50 95 Q70 110 90 95" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M110 95 Q130 110 150 95" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
        )}
        {expression === 'happy' && (
            <g stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M55 95 Q70 75 85 95" />
            <path d="M115 95 Q130 75 145 95" />
            </g>
        )}
        {expression === 'angry' && (
            <g>
            <line x1="55" y1="65" x2="85" y2="75" stroke="#333" strokeWidth="4" strokeLinecap="round" />
            <line x1="115" y1="75" x2="145" y2="65" stroke="#333" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="70" cy="90" rx="18" ry="24" fill="white" />
            <ellipse cx="130" cy="90" rx="18" ry="24" fill="white" />
            <ellipse cx="70" cy="90" rx="8" ry="10" fill={eyeColor} />
            <ellipse cx="130" cy="90" rx="8" ry="10" fill={eyeColor} />
            </g>
        )}
        {expression === 'wink' && (
            <g>
            <ellipse cx="70" cy="85" rx="22" ry="28" fill="white" />
            <ellipse cx="70" cy="85" rx="10" ry="12" fill={eyeColor} />
            <circle cx="75" cy="80" r="3" fill="white" opacity="0.8" />
            <path d="M110 95 Q130 105 150 95" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
        )}
      </g>
    </svg>
  );
};


// --- 2. RENDERIZADOR ANIMADO (CON ESTILO DUOLINGO Y CUERPO PROPORCIONADO) ---
const AnimatedAvatarRenderer = ({ attrs, size = 200 }: { attrs: AvatarAttributes, size?: number }) => {
  const { skinTone, shirtColor, eyeColor, bodyType, eyes, mouth, accessory } = attrs;
  
  // Proporciones del cuerpo Duolingo
  const bodyBaseY = 145; 
  const bodyHeight = 105;
  let bodyWidth = 150; 
  let bodyX = 25;    
  
  // Ajustes de tipo de cuerpo (afecta el ancho del cuerpo y la posición X para centrar)
  if (bodyType === 'slim') {
    bodyWidth = 120;
    bodyX = 40;
  } else if (bodyType === 'broad') {
    bodyWidth = 180;
    bodyX = 10;
  }


  const armWidth = 40;
  const armHeight = 80;
  const armRx = 20; 
  const armY = bodyBaseY + 20;

  // Variantes de animación
  const breathingVariant: Variants = { initial: { y: 0 }, animate: { y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } } };
  const headBobVariant: Variants = { initial: { rotate: 0 }, animate: { rotate: [-1, 1, -1], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } } };
  const blinkVariant: Variants = { initial: { scaleY: 1 }, animate: { scaleY: [1, 1, 1, 1, 0.1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.8, 0.9, 0.95, 0.98, 1] } } };
  
  const armLeftVariant: Variants = {
    initial: { rotate: 0, x: 0 },
    animate: { rotate: [0, 8, 0], x: [0, -2, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
  };
  const armRightVariant: Variants = {
    initial: { rotate: 0, x: 0 },
    animate: { rotate: [0, -8, 0], x: [0, 2, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
  };

  return (
    <motion.svg 
      width={size} height={size * 1.25} viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg"
      variants={breathingVariant} initial="initial" animate="animate"
    >
      {/* --- GRUPO DE CUERPO (Brazos y Torso) --- */}
      <g>
        {/* BRAZO IZQUIERDO */}
        <motion.rect 
          x={bodyX - 20} y={armY} width={armWidth} height={armHeight} rx={armRx} fill={skinTone} 
          style={{ originX: `${bodyX + 10}px`, originY: `${armY}px` }} // Pivote más dinámico
          variants={armLeftVariant} initial="initial" animate="animate" 
        />
        {/* BRAZO DERECHO */}
        <motion.rect 
          x={bodyX + bodyWidth - (armWidth - 20)} y={armY} width={armWidth} height={armHeight} rx={armRx} fill={skinTone} 
          style={{ originX: `${bodyX + bodyWidth - 10}px`, originY: `${armY}px` }} // Pivote más dinámico
          variants={armRightVariant} initial="initial" animate="animate" 
        />
        {/* CUERPO (Camiseta) */}
        <rect x={bodyX} y={bodyBaseY} width={bodyWidth} height={bodyHeight} rx="40" fill={shirtColor} />
      </g>
      
      {/* --- GRUPO DE CABEZA --- */}
      <motion.g variants={headBobVariant} initial="initial" animate="animate" style={{ originX: '100px', originY: '110px' }}>
        {/* Cuello */}
        <rect x="75" y="115" width="50" height="30" rx="10" fill={skinTone} />

        {/* CABEZA BASE (Squircle) */}
        <rect x="25" y="40" width="150" height="130" rx="40" fill={skinTone} />
        
        {/* Orejas */}
        <circle cx="25" cy="105" r="15" fill={skinTone} />
        <circle cx="175" cy="105" r="15" fill={skinTone} />

        {/* Nariz (Triangular) */}
        <path d="M100 110 L90 125 L110 125 Z" fill="#8D5F4D" /> 

        {/* --- OJOS (CON ESTILO DUOLINGO) --- */}
        <motion.g 
          variants={blinkVariant}
          animate={(eyes === 'wink' || eyes === 'happy' || eyes === 'sleepy' || accessory === 'glasses') ? undefined : "animate"}
          style={{ originY: '85px' }}
        >
          {eyes === 'default' && (
            <g>
              <ellipse cx="70" cy="85" rx="22" ry="28" fill="white" />
              <ellipse cx="130" cy="85" rx="22" ry="28" fill="white" />
              <ellipse cx="70" cy="85" rx="10" ry="12" fill={eyeColor} />
              <ellipse cx="130" cy="85" rx="10" ry="12" fill={eyeColor} />
              <circle cx="75" cy="80" r="3" fill="white" opacity="0.8" />
              <circle cx="135" cy="80" r="3" fill="white" opacity="0.8" />
            </g>
          )}
          {eyes === 'surprised' && (
             <g>
               <ellipse cx="70" cy="85" rx="25" ry="30" fill="white" />
               <ellipse cx="130" cy="85" rx="25" ry="30" fill="white" />
               <ellipse cx="70" cy="85" rx="8" ry="10" fill={eyeColor} />
               <ellipse cx="130" cy="85" rx="8" ry="10" fill={eyeColor} />
             </g>
          )}
          {eyes === 'sleepy' && (
             <g>
               <path d="M50 95 Q70 110 90 95" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
               <path d="M110 95 Q130 110 150 95" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
             </g>
          )}
          {eyes === 'happy' && (
            <g stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round">
              <path d="M55 95 Q70 75 85 95" />
              <path d="M115 95 Q130 75 145 95" />
            </g>
          )}
          {eyes === 'angry' && (
            <g>
              <line x1="55" y1="65" x2="85" y2="75" stroke="#333" strokeWidth="4" strokeLinecap="round" />
              <line x1="115" y1="75" x2="145" y2="65" stroke="#333" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="70" cy="90" rx="18" ry="24" fill="white" />
              <ellipse cx="130" cy="90" rx="18" ry="24" fill="white" />
              <ellipse cx="70" cy="90" rx="8" ry="10" fill={eyeColor} />
              <ellipse cx="130" cy="90" rx="8" ry="10" fill={eyeColor} />
            </g>
          )}
          {eyes === 'wink' && (
            <g>
               <ellipse cx="70" cy="85" rx="22" ry="28" fill="white" />
               <ellipse cx="70" cy="85" rx="10" ry="12" fill={eyeColor} />
               <circle cx="75" cy="80" r="3" fill="white" opacity="0.8" />
               <path d="M110 95 Q130 105 150 95" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
          )}
        </motion.g>

        {/* BOCA */}
        {mouth === 'smile' && <path d="M75 135 Q100 150 125 135" stroke="black" strokeWidth="4" strokeLinecap="round" fill="none" />}
        {mouth === 'frown' && <path d="M75 145 Q100 130 125 145" stroke="black" strokeWidth="4" strokeLinecap="round" fill="none" />}
        {mouth === 'open' && <ellipse cx="100" cy="140" rx="15" ry="10" fill="black" />}
        {mouth === 'smirk' && <path d="M75 140 Q100 140 125 130" stroke="black" strokeWidth="4" strokeLinecap="round" fill="none" />}

        {/* ACCESORIOS DE CABEZA */}
        {accessory === 'hat' && (
           <g>
             <rect x="20" y="30" width="160" height="20" rx="5" fill="#333" />
             <rect x="50" y="-10" width="100" height="50" rx="10" fill="#333" />
           </g>
        )}
        {accessory === 'glasses' && (
           <g>
             <ellipse cx="70" cy="85" rx="28" ry="34" stroke="black" strokeWidth="3" fill="none" />
             <ellipse cx="130" cy="85" rx="28" ry="34" stroke="black" strokeWidth="3" fill="none" />
             <line x1="97" y1="85" x2="103" y2="85" stroke="black" strokeWidth="3" />
             <line x1="42" y1="85" x2="15" y2="75" stroke="black" strokeWidth="3" />
             <line x1="158" y1="85" x2="185" y2="75" stroke="black" strokeWidth="3" />
           </g>
        )}
      </motion.g>

      {/* Accesorios de cuerpo */}
      {accessory === 'bowtie' && (
           <g fill="#FF4B4B">
             {/* Ajustado el Y para que el corbatín esté más abajo */}
             <polygon points="100,165 80,155 80,175" /> 
             <polygon points="100,165 120,155 120,175" />
             <circle cx="100" cy="165" r="5" fill="#cc0000" />
           </g>
      )}
    </motion.svg>
  );
};

// --- 3. COMPONENTE EDITOR ---
interface AvatarEditorProps {
  initialAvatar?: AvatarAttributes;
  onSave: (avatar: AvatarAttributes) => void;
  onCancel: () => void;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({ initialAvatar, onSave, onCancel }) => {
  const [currentAvatar, setCurrentAvatar] = useState<AvatarAttributes>(initialAvatar || defaultAvatar);
  const [activeTab, setActiveTab] = useState('eyes'); 

  const updateAttr = (key: keyof AvatarAttributes, value: any) => {
    setCurrentAvatar(prev => ({ ...prev, [key]: value }));
  };

  // Paletas de colores
  const skinTones = ['#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5D4037'];
  const shirtColors = ['#9C6FD6', '#58CC02', '#1CB0F6', '#FF4B4B', '#FFC800', '#FFFFFF', '#333333'];
  const eyeColors = [
    '#000000', '#634e34', '#2e536f', '#3d6e70', '#7d5d8c', '#9b111e', '#ffc800', '#999999',
  ];

  const TabBtn = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{ 
        padding: '0.5rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer',
        borderBottom: activeTab === id ? '3px solid #1cb0f6' : '3px solid transparent',
        color: activeTab === id ? 'white' : '#aaa', fontWeight: 'bold', whiteSpace: 'nowrap'
      }}
    >
      {label}
    </button>
  );

  const OptionBox = ({ children, onClick, isSelected }: any) => (
    <motion.div 
      whileTap={{ scale: 0.95 }} onClick={onClick} 
      style={{
        padding: '0.8rem', borderRadius: '0.8rem', background: '#2d3748', cursor: 'pointer',
        border: isSelected ? '2px solid #1cb0f6' : '2px solid #4a5568', 
        textAlign: 'center', color: 'white',
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        fontSize: '0.9rem', flexDirection: 'column', gap: '0.5rem'
      }}
    >
      {children}
    </motion.div>
  );

  const ColorCircle = ({ color, isSelected, onClick }: any) => (
     <motion.div whileTap={{ scale: 0.9 }} onClick={onClick} style={{
        width: '50px', height: '50px', borderRadius: '50%', background: color, cursor: 'pointer',
        border: isSelected ? '4px solid #1cb0f6' : '2px solid transparent',
        boxShadow: isSelected ? '0 0 10px #1cb0f6' : 'none'
     }} />
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#1A202C', padding: '2rem', borderRadius: '1.5rem',
          width: '95%', maxWidth: '900px', height: '90vh', display: 'flex', gap: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)', overflow: 'hidden', flexDirection: 'row'
        }}
      >
        {/* PREVISUALIZACIÓN */}
        <div style={{ 
            flex: '0 0 350px', background: '#EDF2F7', borderRadius: '1rem', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
        }}>
           <AnimatedAvatarRenderer attrs={currentAvatar} size={300} />
        </div>

        {/* CONTROLES */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h2 style={{ color: 'white', margin: '0 0 1.5rem 0' }}>Edita tu Avatar</h2>
          
          {/* Pestañas */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #4a5568', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '5px' }}>
             <TabBtn id="skin" label="Piel" />
             <TabBtn id="eyes" label="Ojos" />
             <TabBtn id="mouth" label="Boca" />
             <TabBtn id="body" label="Cuerpo" />
             <TabBtn id="shirt" label="Ropa" />
             <TabBtn id="extra" label="Extras" />
          </div>

          {/* Contenido de la pestaña */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
             
             {/* === SECCIÓN DE OJOS === */}
             {activeTab === 'eyes' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* 1. Selector de COLOR de ojos */}
                  <div>
                    <h4 style={{ color: '#A0AEC0', marginBottom: '0.8rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Color de ojos</h4>
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      {eyeColors.map(c => (
                         <ColorCircle key={c} color={c} isSelected={currentAvatar.eyeColor === c} onClick={() => updateAttr('eyeColor', c)} />
                      ))}
                    </div>
                  </div>

                  {/* 2. Selector de EXPRESIÓN */}
                  <div>
                    <h4 style={{ color: '#A0AEC0', marginBottom: '0.8rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Expresión</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '1rem' }}>
                        {(['default', 'happy', 'wink', 'angry', 'surprised', 'sleepy'] as AvatarAttributes['eyes'][]).map(exp => (
                            <OptionBox key={exp} onClick={() => updateAttr('eyes', exp)} isSelected={currentAvatar.eyes === exp}>
                                <EyeExpressionPreview skinTone={currentAvatar.skinTone} eyeColor={currentAvatar.eyeColor} expression={exp} size={80} />
                                <span style={{fontSize: '0.8rem', color: '#ccc', textTransform: 'capitalize'}}>
                                    {exp === 'default' ? 'Normal' : exp === 'happy' ? 'Feliz' : exp === 'wink' ? 'Guiño' : exp === 'angry' ? 'Enojado' : exp === 'surprised' ? 'Sorpresa' : 'Sueño'}
                                </span>
                            </OptionBox>
                        ))}
                    </div>
                  </div>
               </div>
             )}

             {/* Resto de pestañas... */}
             {activeTab === 'skin' && (
               <div>
                 <h4 style={{ color: '#A0AEC0', marginBottom: '0.8rem' }}>TONO DE PIEL</h4>
                 <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                   {skinTones.map(c => <ColorCircle key={c} color={c} isSelected={currentAvatar.skinTone === c} onClick={() => updateAttr('skinTone', c)} />)}
                 </div>
               </div>
             )}
             {activeTab === 'shirt' && (
               <div>
                 <h4 style={{ color: '#A0AEC0', marginBottom: '0.8rem' }}>COLOR DE ROPA</h4>
                 <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                   {shirtColors.map(c => <ColorCircle key={c} color={c} isSelected={currentAvatar.shirtColor === c} onClick={() => updateAttr('shirtColor', c)} />)}
                 </div>
               </div>
             )}
             {activeTab === 'mouth' && (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <OptionBox onClick={() => updateAttr('mouth', 'smile')} isSelected={currentAvatar.mouth === 'smile'}>
                    <div style={{fontSize: '2.5rem'}}>😄</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Sonrisa</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('mouth', 'frown')} isSelected={currentAvatar.mouth === 'frown'}>
                    <div style={{fontSize: '2.5rem'}}>🙁</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Triste</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('mouth', 'open')} isSelected={currentAvatar.mouth === 'open'}>
                    <div style={{fontSize: '2.5rem'}}>😮</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Sorpresa</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('mouth', 'smirk')} isSelected={currentAvatar.mouth === 'smirk'}>
                    <div style={{fontSize: '2.5rem'}}>😏</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Mueca</span>
                  </OptionBox>
               </div>
             )}
             {activeTab === 'body' && (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <OptionBox onClick={() => updateAttr('bodyType', 'default')} isSelected={currentAvatar.bodyType === 'default'}>
                    <div style={{fontSize: '2.5rem'}}>🧍</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Normal</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('bodyType', 'slim')} isSelected={currentAvatar.bodyType === 'slim'}>
                    <div style={{fontSize: '2.5rem'}}>🚶‍♀️</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Delgado</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('bodyType', 'broad')} isSelected={currentAvatar.bodyType === 'broad'}>
                    <div style={{fontSize: '2.5rem'}}>💪</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Ancho</span>
                  </OptionBox>
               </div>
             )}
             {activeTab === 'extra' && (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <OptionBox onClick={() => updateAttr('accessory', 'none')} isSelected={currentAvatar.accessory === 'none'}>
                    <div style={{fontSize: '2.5rem'}}>🚫</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Ninguno</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('accessory', 'hat')} isSelected={currentAvatar.accessory === 'hat'}>
                    <div style={{fontSize: '2.5rem'}}>🎩</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Sombrero</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('accessory', 'glasses')} isSelected={currentAvatar.accessory === 'glasses'}>
                    <div style={{fontSize: '2.5rem'}}>👓</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Lentes</span>
                  </OptionBox>
                  <OptionBox onClick={() => updateAttr('accessory', 'bowtie')} isSelected={currentAvatar.accessory === 'bowtie'}>
                    <div style={{fontSize: '2.5rem'}}>🎀</div><span style={{fontSize: '0.8rem', color: '#ccc'}}>Corbatín</span>
                  </OptionBox>
               </div>
             )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #2d3748' }}>
             <button onClick={onCancel} style={{ background: 'transparent', border: '2px solid #a0aec0', color: '#a0aec0', padding: '0.8rem 1.5rem', borderRadius: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
             <button onClick={() => onSave(currentAvatar)} style={{ background: '#58CC02', border: 'none', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.8rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 0 #46a302' }}>Guardar Cambios</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { AnimatedAvatarRenderer };
export default AvatarEditor;