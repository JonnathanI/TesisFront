import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaClock, FaCheckCircle } from 'react-icons/fa';
// Importamos el servicio y la interfaz desde tu archivo de servicios
import { getUserChallenges, UserChallengesDTO } from '../api/auth.service';

// Casting de iconos para evitar errores de TS2786
const BoltIcon = FaBolt as any;
const ClockIcon = FaClock as any;
const CheckIcon = FaCheckCircle as any;

// === SVGs Estilo Duolingo ===
const CartoonBlueBirdSVG = () => (
    <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="100" rx="70" ry="65" fill="#1CB0F6" />
        <path d="M50 80 Q20 60 10 100 Q40 120 70 110 Q90 90 50 80 Z" fill="#007AFF" />
        <path d="M150 80 Q180 60 190 100 Q160 120 130 110 Q110 90 150 80 Z" fill="#007AFF" />
        <ellipse cx="100" cy="135" rx="45" ry="25" fill="white" />
        <circle cx="75" cy="85" r="22" fill="white" />
        <circle cx="125" cy="85" r="22" fill="white" />
        <circle cx="80" cy="85" r="8" fill="black" />
        <circle cx="120" cy="85" r="8" fill="black" />
        <path d="M90 105 Q100 125 110 105 Q100 95 90 105 Z" fill="#FF9600" />
        <path d="M80 160 L80 175 M90 160 L90 175" stroke="#FF9600" strokeWidth="6" strokeLinecap="round" />
        <path d="M110 160 L110 175 M120 160 L120 175" stroke="#FF9600" strokeWidth="6" strokeLinecap="round" />
    </svg>
);

const DuoFaceSVG = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#58CC02" />
        <circle cx="35" cy="45" r="12" fill="white" />
        <circle cx="65" cy="45" r="12" fill="white" />
        <circle cx="35" cy="45" r="5" fill="black" />
        <circle cx="65" cy="45" r="5" fill="black" />
        <path d="M45 65 Q50 70 55 65" stroke="#FF9600" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

export default function Challenges() {
    const [data, setData] = useState<UserChallengesDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserChallenges()
            .then(setData)
            .catch(err => console.error("Error al obtener desafíos:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ color: 'white', textAlign: 'center', padding: '100px', background: '#131f24', minHeight: '100vh' }}>
            Cargando desafíos diarios...
        </div>
    );

    const challengeList = [
        {
            id: 1,
            icon: <BoltIcon />,
            color: '#FFC800',
            title: `Gana ${data?.dailyExpGoal || 10} EXP`,
            progress: data?.dailyExpProgress || 0,
            total: data?.dailyExpGoal || 10
        },
        {
            id: 2,
            icon: <ClockIcon />,
            color: '#1CB0F6',
            title: `Aprende ${data?.minutesGoal || 5} min`,
            progress: data?.minutesLearned || 0,
            total: data?.minutesGoal || 5
        },
        {
            id: 3,
            icon: <DuoFaceSVG />,
            color: '#58CC02',
            title: "Lecciones perfectas",
            progress: data?.perfectLessonsCount || 0,
            total: data?.perfectLessonsGoal || 2
        }
    ];

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
            
            {/* Banner Estilo Duolingo */}
            <div style={{
                background: 'linear-gradient(145deg, #a462ff, #8a2be2)',
                borderRadius: '1.5rem',
                padding: '2rem',
                color: 'white',
                position: 'relative',
                boxShadow: '0 8px 0 #6f22b5',
                marginBottom: '2.5rem',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '65%' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: 1 }}>DESAFÍOS DIARIOS</h2>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                        Has completado {data?.challengesCompleted || 0} de 3 hoy.
                    </p>
                </div>
                <div style={{ position: 'absolute', right: '-15px', bottom: '-20px', zIndex: 1 }}>
                    <CartoonBlueBirdSVG />
                </div>
            </div>

            {/* Lista de Tarjetas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {challengeList.map((ch) => {
                    const percent = Math.min(100, (ch.progress / ch.total) * 100);
                    const isDone = ch.progress >= ch.total;

                    return (
                        <div key={ch.id} style={{
                            background: '#131f24',
                            border: '2px solid #2c363a',
                            borderRadius: '1.2rem',
                            padding: '1.2rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.2rem'
                        }}>
                            <div style={{ fontSize: '2.2rem', color: ch.color, display: 'flex' }}>{ch.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.1rem' }}>{ch.title}</div>
                                <div style={{ height: '14px', background: '#2c363a', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        style={{ height: '100%', background: ch.color }}
                                    />
                                </div>
                            </div>
                            <div style={{ color: isDone ? '#58CC02' : '#52656d', fontWeight: '900', minWidth: '60px', textAlign: 'right' }}>
                                {isDone ? <CheckIcon size={28} /> : `${ch.progress}/${ch.total}`}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}