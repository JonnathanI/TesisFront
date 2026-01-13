import React, { useEffect, useState, RefObject } from 'react';

interface Props {
  nodeRefs: RefObject<Array<HTMLDivElement | null>>;
  pathDataLength: number;
}

const LearningPathSVG: React.FC<Props> = ({ nodeRefs, pathDataLength }) => {
  const [points, setPoints] = useState<string>("");

  useEffect(() => {
    const updatePath = () => {
      if (!nodeRefs.current) return;
      
      const coords = nodeRefs.current
        .filter(ref => ref !== null)
        .map(ref => {
          const rect = ref!.getBoundingClientRect();
          const parentRect = ref!.parentElement!.getBoundingClientRect();
          // Calculamos el centro exacto de cada círculo
          return {
            x: rect.left - parentRect.left + rect.width / 2,
            y: rect.top - parentRect.top + rect.height / 2
          };
        });

      if (coords.length < 2) return;

      // Iniciar el camino en el primer nodo
      let d = `M ${coords[0].x} ${coords[0].y}`;
      
      for (let i = 0; i < coords.length - 1; i++) {
        const curr = coords[i];
        const next = coords[i + 1];
        
        // --- CÁLCULO DE LA CURVA DE SERPIENTE ---
        // Usamos la mitad de la distancia vertical para los puntos de control
        // Esto crea el efecto de "S" suave entre los nodos desplazados
        const controlY = curr.y + (next.y - curr.y) / 2;
        
        // Curva Bézier Cúbica: C (control1_x control1_y) (control2_x control2_y) (fin_x fin_y)
        d += ` C ${curr.x} ${controlY}, ${next.x} ${controlY}, ${next.x} ${next.y}`;
      }
      
      setPoints(d);
    };

    // Timeout ligero para asegurar que el DOM y las posiciones de Framer Motion se estabilicen
    const timer = setTimeout(updatePath, 100);
    
    window.addEventListener('resize', updatePath);
    return () => {
      window.removeEventListener('resize', updatePath);
      clearTimeout(timer);
    };
  }, [nodeRefs, pathDataLength]);

  return (
    <svg 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 0 // Detrás de los círculos
      }}
    >
      {/* 1. Sombra de la carretera (le da profundidad 3D) */}
      <path
        d={points}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="28"
        strokeLinecap="round"
        style={{ transform: 'translateY(4px)' }} 
      />

      {/* 2. Cuerpo principal de la carretera (Verde o Gris oscuro) */}
      <path
        d={points}
        fill="none"
        stroke="#46a302" // Color verde oscuro tipo Duolingo/Juego
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* 3. Línea central decorativa (Líneas blancas discontinuas) */}
      <path
        d={points}
        fill="none"
        stroke="rgba(255,255,255,0.4)" 
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="15, 20" // Crea el efecto de "casillas" o carretera
      />
    </svg>
  );
};

export default LearningPathSVG;