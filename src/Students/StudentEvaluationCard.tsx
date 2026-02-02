import React, { useEffect, useState } from "react";
import { FiClock, FiAward, FiAlertCircle } from "react-icons/fi";
import { getStudentPendingEvaluations } from "../api/auth.service";
import { useNavigate } from "react-router-dom";

// Evitar conflictos JSX con react-icons
const IconAward = FiAward as any;
const IconClock = FiClock as any;
const IconAlert = FiAlertCircle as any;

// 🔐 Obtener studentId desde el JWT
const getStudentIdFromToken = (): string | null => {
  const token = localStorage.getItem("jwt-token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
};

interface PendingEvaluation {
  assignmentId: string;
  evaluationId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  score?: number | null;
}

export function StudentEvaluationCard() {
  const [pending, setPending] = useState<PendingEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvaluations = async () => {
      const studentId = getStudentIdFromToken();

      if (!studentId) {
        setError("No se pudo identificar al usuario");
        setLoading(false);
        return;
      }

      try {
        const data = await getStudentPendingEvaluations(studentId);
        setPending(data);
      } catch (err) {
        console.error("Error al cargar evaluaciones:", err);
        setError("No se pudieron cargar las evaluaciones");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  // ⏳ Cargando
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] border-2 border-[#e5e5e5] animate-pulse">
        <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
        <p className="text-[#afafaf] font-black uppercase text-xs tracking-widest">
          Cargando evaluaciones…
        </p>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2rem] text-center">
        <IconAlert size={32} className="mx-auto text-red-400 mb-2" />
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  // ✨ Sin tareas
  if (pending.length === 0) {
    return (
      <div className="bg-white border-2 border-[#e5e5e5] rounded-[2rem] p-10 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-xl font-black text-[#3c3c3c] uppercase">
          ¡Estás al día!
        </h3>
        <p className="text-[#afafaf] font-bold mt-2">
          No tienes evaluaciones pendientes.
        </p>
      </div>
    );
  }

  // 📋 Lista de evaluaciones
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-black text-[#3c3c3c] uppercase ml-2 italic">
        Mis tareas
      </h3>

      {pending.map((assignment) => (
        <div
          key={assignment.assignmentId}
          className="bg-white border-2 border-[#e5e5e5] rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between shadow-sm hover:border-[#1cb0f6] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#ffc800] p-4 rounded-2xl text-white shadow-[0_4px_0_#e5a500] group-hover:scale-105 transition-transform">
              <IconAward size={24} />
            </div>

            <div>
              <p className="font-black text-[#4b4b4b] text-lg">
                {assignment.title}
              </p>

              <div className="flex items-center gap-2 text-[#afafaf] font-bold text-xs uppercase mt-1">
                <IconClock size={14} />
                <span>
                  Vence:{" "}
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/evaluation/${assignment.assignmentId}`)
            }
            className="mt-4 md:mt-0 bg-[#1cb0f6] text-white px-8 py-3 rounded-2xl font-black shadow-[0_4px_0_#1899d6] active:translate-y-1 active:shadow-none transition-all uppercase text-sm"
          >
            Empezar
          </button>
        </div>
      ))}
    </div>
  );
}
