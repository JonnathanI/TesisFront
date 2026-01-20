import React, { useState } from "react";

export function EvaluationsSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evaluations, setEvaluations] = useState<any[]>([]);

  const handleCreateEvaluation = () => {
    if (!title) return alert("Debes ingresar un título");

    const newEvaluation = {
      id: Date.now(),
      title,
      description,
    };

    setEvaluations([...evaluations, newEvaluation]);
    setTitle("");
    setDescription("");
  };

  return (
    <div>
      <h2>Crear Evaluación</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Título de la evaluación"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "8px", width: "300px", marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: "8px", width: "300px", marginRight: "10px" }}
        />
        <button
          onClick={handleCreateEvaluation}
          style={{ padding: "8px 16px", background: "#2ecc71", color: "white", border: "none", cursor: "pointer" }}
        >
          Crear
        </button>
      </div>

      <h3>Evaluaciones creadas</h3>
      <ul>
        {evaluations.map((e) => (
          <li key={e.id}>
            <strong>{e.title}</strong> - {e.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
