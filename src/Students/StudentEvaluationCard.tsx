import React, { useState, useEffect } from "react";
import { FiClock, FiAward } from "react-icons/fi";
import { getStudentPendingEvaluations } from "../api/auth.service";
import { useNavigate } from "react-router-dom";

// ✅ SOLUCIÓN AL ERROR TS2786: Castear los iconos como 'any'
const IconAward = FiAward as any;
const IconClock = FiClock as any;

export function StudentEvaluationCard({ userId }: { userId: string }) {
  const [pending, setPending] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      getStudentPendingEvaluations(userId)
        .then(setPending)
        .catch(console.error);
    }
  }, [userId]);

  if (pending.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-black text-[#3c3c3c] uppercase tracking-tighter ml-2 italic">
        Tareas de clase
      </h3>
      
      {pending.map((assignment) => (
        <div 
          key={assignment.id} 
          className="bg-white border-2 border-[#e5e5e5] rounded-[2rem] p-6 flex items-center justify-between shadow-sm hover:border-[#1cb0f6] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#ffc800] p-4 rounded-2xl text-white shadow-[0_4px_0_#e5a500]">
              {/* ✅ Usamos el icono casteado */}
              <IconAward size={24} />
            </div>
            <div>
              <p className="font-black text-[#4b4b4b] text-lg">
                {assignment.evaluation.title}
              </p>
              <div className="flex items-center gap-2 text-[#afafaf] font-bold text-xs uppercase tracking-tighter">
                {/* ✅ Usamos el icono casteado */}
                <IconClock /> 
                <span>Vence: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(`/evaluation/${assignment.id}`)}
            className="bg-[#1cb0f6] text-white px-6 py-3 rounded-2xl font-black shadow-[0_4px_0_#1899d6] active:translate-y-1 active:shadow-none transition-all uppercase text-sm"
          >
            Empezar
          </button>
        </div>
      ))}
    </div>
  );
}