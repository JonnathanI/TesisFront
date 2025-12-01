// LearningPathSVG.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LearningPathSVGProps {
  nodeRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  pathDataLength: number;
}

const LearningPathSVG: React.FC<LearningPathSVGProps> = ({ nodeRefs, pathDataLength }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pathD, setPathD] = useState('');
  
  // --- ¡NUEVO ESTADO PARA LA ALTURA! ---
  const [svgHeight, setSvgHeight] = useState(0); 

  const calculatePath = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const positions: NodePosition[] = [];
    nodeRefs.current.forEach((ref) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();
        positions.push({
          x: rect.left + rect.width / 2 - svgRect.left,
          y: rect.top + rect.height / 2 - svgRect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    });

    if (positions.length < 2) {
      setPathD('');
      return;
    }

    let d = `M ${positions[0].x} ${positions[0].y}`;
    
    // --- ¡NUEVA LÓGICA! ---
    // Encontrar la posición 'y' más baja para saber qué tan alto debe ser el SVG
    let maxY = positions[0].y + positions[0].height / 2;

    for (let i = 0; i < positions.length - 1; i++) {
      const p0 = positions[i];
      const p1 = positions[i + 1];

      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;

      const waveOffset = 30; 
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y + (p1.y - p0.y) / 3 + (i % 2 === 0 ? waveOffset : -waveOffset); 

      const cp2x = p1.x - (p1.x - p0.x) / 3;
      const cp2y = p1.y - (p1.y - p0.y) / 3 + (i % 2 === 0 ? -waveOffset : waveOffset); 

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      
      // Actualizar la altura máxima
      maxY = Math.max(maxY, p1.y + p1.height / 2);
    }

    setPathD(d);
    
    // --- ¡AQUÍ ESTÁ LA MAGIA! ---
    // Establecer la altura del SVG para que sea tan alta como el nodo más bajo
    // Se añaden 50px de espacio extra
    setSvgHeight(maxY + 50); 

  }, [nodeRefs]);

  useEffect(() => {
    calculatePath();
    window.addEventListener('resize', calculatePath);
    // Usamos un timeout para asegurarnos de que los nodos estén en su posición final
    const timeout = setTimeout(calculatePath, 100); 

    return () => {
      window.removeEventListener('resize', calculatePath);
      clearTimeout(timeout);
    };
  }, [calculatePath, pathDataLength]);

  const draw = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.0, delay: 0.5 } // Simple fade-in
    }
  };

  return (
    <svg 
      ref={svgRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
        // La altura ya no es '100%', sino la altura calculada (o '100vh' como fallback)
        height: svgHeight ? `${svgHeight}px` : '100vh', 
        pointerEvents: 'none', 
        zIndex: 0 
      }}
    >
      <motion.path
        d={pathD}
        fill="transparent"
        stroke="#4a4a5a" // Color de la línea
        strokeWidth="6"   // Grosor de la línea
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10 10" // Mantiene el efecto punteado
        variants={draw} 
        initial="hidden"
        animate="visible"
      />
    </svg>
  );
};

export default LearningPathSVG;