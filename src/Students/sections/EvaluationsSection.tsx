import React from "react";
import { StudentEvaluationCard } from "../StudentEvaluationCard";

export const EvaluationsSection = () => {
  return (
    <div className="animate-in fade-in duration-500">
      

      {/* ✅ Ya NO se pasa userId */}
      <StudentEvaluationCard />

      
    </div>
  );
};
