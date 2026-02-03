import React, { useEffect, useState } from "react";
import { FiClock, FiAward, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { getStudentAllEvaluations } from "../api/auth.service";
import { useNavigate } from "react-router-dom";
import "./StudentEvaluationCard.css";

// Evitar conflictos JSX con react-icons
const IconAward = FiAward as any;
const IconClock = FiClock as any;
const IconAlert = FiAlertCircle as any;
const IconCheckCircle = FiCheckCircle as any;

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

interface StudentEvaluation {
  assignmentId: string;
  evaluationId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  score?: number | null;
}

export function StudentEvaluationCard() {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
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
        const data = await getStudentAllEvaluations(studentId);
        console.log("📦 Evaluaciones recibidas:", data);
        setEvaluations(data);
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

  const pendingList = evaluations.filter((e) => !e.completed);
  const completedList = evaluations.filter((e) => e.completed);

  // Si no hay nada de nada
  if (pendingList.length === 0 && completedList.length === 0) {
    return (
      <div className="eval-empty">
        <span>✨</span>
        <h3>¡Estás al día!</h3>
        <p>No tienes evaluaciones asignadas.</p>
      </div>
    );
  }

  return (
    <div className="evaluations">
      <h3>Mis Evaluaciones</h3>

      {/* PENDIENTES */}
      <section className="eval-section">
        <h4 className="eval-section-title">Pendientes</h4>

        {pendingList.length === 0 ? (
          <div className="eval-empty-inline">
            <span>✔</span>
            <p>No tienes evaluaciones pendientes.</p>
          </div>
        ) : (
          pendingList.map((assignment) => (
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
                  console.log(
                    "🚀 Navegando (pendiente) con assignmentId:",
                    assignment.assignmentId
                  );
                  navigate(`/evaluation/${assignment.assignmentId}`);
                }}
              >
                Empezar
              </button>
            </div>
          ))
        )}
      </section>

      {/* COMPLETADAS */}
      <section className="eval-section">
        <h4 className="eval-section-title">Completadas</h4>

        {completedList.length === 0 ? (
          <div className="eval-empty-inline">
            <p>Todavía no has completado ninguna evaluación.</p>
          </div>
        ) : (
          completedList.map((assignment) => (
            <div
              key={assignment.assignmentId}
              className="evaluation-card evaluation-card-completed"
            >
              <div className="evaluation-left">
                <div className="evaluation-icon completed">
                  <IconCheckCircle />
                </div>

                <div>
                  <div className="evaluation-title">
                    {assignment.title}
                  </div>

                  <div className="evaluation-date">
                    <span>
                      ✅ Completada – Puntaje:{" "}
                      {assignment.score ?? 0}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="evaluation-btn evaluation-btn-secondary"
                onClick={() => {
                  console.log(
                    "👀 Ver detalle (completada) assignmentId:",
                    assignment.assignmentId
                  );
                  navigate(`/evaluation/${assignment.assignmentId}`, {
                    state: { readOnly: true },
                  });
                }}
              >
                Ver detalle
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
