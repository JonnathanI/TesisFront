import React from "react";
import { StudentEvaluationCard } from "../StudentEvaluationCard";

export const EvaluationsSection = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#3c3c3c] tracking-tight">
          Mis Tareas
        </h2>
        <p className="text-[#777] font-bold">
          Completa tus exámenes pendientes para ganar XP extra y mejorar tu nota.
        </p>
      </div>

      {/* ✅ Ya NO se pasa userId */}
      <StudentEvaluationCard />

      <div className="mt-12 p-8 border-2 border-dashed border-[#e5e5e5] rounded-[2rem] text-center">
        <p className="text-[#afafaf] font-bold text-sm uppercase">
          Las tareas completadas aparecerán en tu historial de perfil.
        </p>
      </div>
    </div>
  );
};
