import React, { useEffect, useState, useRef } from 'react';

interface LearningPathSVGProps {
  nodeRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  pathDataLength: number;
}

const LearningPathSVG: React.FC<LearningPathSVGProps> = ({ nodeRefs, pathDataLength }) => {
  const [pathD, setPathD] = useState('');
  // Ref para acceder al elemento <path> real en el DOM
  const pathElementRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  // 1. Calcular la forma del camino (igual que antes)
  const calculatePath = () => {
    if (pathDataLength === 0 || nodeRefs.current.length === 0) return;
    const firstNode = nodeRefs.current[0];
    if (!firstNode || !firstNode.offsetParent) return;

    let d = '';
    for (let i = 0; i < pathDataLength - 1; i++) {
      const current = nodeRefs.current[i];
      const next = nodeRefs.current[i + 1];
      if (current && next) {
        const x1 = current.offsetLeft + current.offsetWidth / 2;
        const y1 = current.offsetTop + current.offsetHeight / 2;
        const x2 = next.offsetLeft + next.offsetWidth / 2;
        const y2 = next.offsetTop + next.offsetHeight / 2;
        if (i === 0) d += `M ${x1} ${y1} `;
        const halfY = (y2 - y1) / 2;
        d += `C ${x1} ${y1 + halfY}, ${x2} ${y2 - halfY}, ${x2} ${y2} `;
      }
    }
    setPathD(d);
  };

  // 2. Efecto para calcular la ruta y luego preparar la animación
  useEffect(() => {
    calculatePath();
    window.addEventListener('resize', calculatePath);
    const timeout = setTimeout(calculatePath, 500);
    return () => {
      window.removeEventListener('resize', calculatePath);
      clearTimeout(timeout);
    };
  }, [pathDataLength, nodeRefs]);

  // 3. Efecto NUEVO para medir la línea y activar la animación cuando 'pathD' cambia
  useEffect(() => {
      if (pathElementRef.current && pathD) {
          // Obtener la longitud total de la línea dibujada
          const length = pathElementRef.current.getTotalLength();
          setPathLength(length);

          // Resetear la animación: ocultar la línea
          pathElementRef.current.style.transition = 'none';
          pathElementRef.current.style.strokeDasharray = `${length} ${length}`;
          pathElementRef.current.style.strokeDashoffset = `${length}`;

          // Forzar un reflow del navegador para que aplique los estilos anteriores
          pathElementRef.current.getBoundingClientRect();

          // Activar la animación hacia strokeDashoffset: 0
          setTimeout(() => {
              if(pathElementRef.current) {
                  // Duración de 1.5s con efecto de desaceleración suave
                  pathElementRef.current.style.transition = 'stroke-dashoffset 1.5s ease-out';
                  pathElementRef.current.style.strokeDashoffset = '0';
              }
          }, 50);
      }
  }, [pathD]);

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', overflow: 'visible', zIndex: 0
      }}
    >
      {/* Sombra de la línea para profundidad */}
      <path d={pathD} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="14" strokeLinecap="round" />
      
      {/* La línea principal que se anima */}
      <path
        ref={pathElementRef}
        d={pathD}
        fill="none"
        stroke="#e5e5e5"
        strokeWidth="10"
        strokeLinecap="round"
        // NOTA: Quitamos strokeDasharray="12 12" (punteado) porque interfiere 
        // con la animación de dibujado. La línea sólida se ve mejor animada.
      />
    </svg>
  );
};

export default LearningPathSVG;