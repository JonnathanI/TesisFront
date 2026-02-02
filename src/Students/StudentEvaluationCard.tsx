import React, { useEffect, useState } from "react";
import { FiClock, FiAward, FiAlertCircle } from "react-icons/fi";
import { getStudentPendingEvaluations } from "../api/auth.service";
import { useNavigate } from "react-router-dom";
import "./StudentEvaluationCard.css";

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

      console.log("📌 studentId:", studentId);

      if (!studentId) {
        setError("No se pudo identificar al usuario");
        setLoading(false);
        return;
      }

      try {
        const data = await getStudentPendingEvaluations(studentId);
        console.log("📦 Evaluaciones recibidas:", data);
        setPending(data);
      } catch (err) {
        console.error("❌ Error cargando evaluaciones:", err);
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
      <div className="eval-loading">
        <div className="loader-circle"></div>
        <p>Cargando evaluaciones…</p>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="eval-error">
        <IconAlert size={28} />
        <p>{error}</p>
      </div>
    );
  }

  // ✨ Sin tareas
  if (pending.length === 0) {
    return (
      <div className="eval-empty">
        <span>✨</span>
        <h3>¡Estás al día!</h3>
        <p>No tienes evaluaciones pendientes.</p>
      </div>
    );
  }

  return (
    <div className="evaluations">
      <h3>Mis Evaluaciones</h3>

      {pending.map((assignment) => {
        // ✅ CONSOLE BIEN COLOCADOS
        console.log("➡️ assignmentId:", assignment.assignmentId);
        console.log("➡️ evaluationId:", assignment.evaluationId);

        return (
          <div
            key={assignment.assignmentId}
            className="evaluation-card"
          >
            <div className="evaluation-left">
              <div className="evaluation-icon">
                <IconAward />
              </div>

              <div>
                <div className="evaluation-title">
                  {assignment.title}
                </div>

                <div className="evaluation-date">
                  <IconClock size={14} />
                  <span>
                    Vence:{" "}
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

           <button
  className="evaluation-btn"
  onClick={() => {
    console.log("🚀 Navegando con assignmentId:", assignment.assignmentId);
    navigate(`/evaluation/${assignment.assignmentId}`);
  }}
>
  Empezar
</button>

          </div>
        );
      })}
    </div>
  );
}
