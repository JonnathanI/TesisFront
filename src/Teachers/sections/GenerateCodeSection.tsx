import { useState } from "react";
// 1. Cambiamos la importación a la función de aula (estudiantes)
import { generateClassroomCode } from "../../api/auth.service"; 

export const GenerateCodeSection = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // 2. Llamamos a la función que apunta a /api/teacher/generate-classroom-code
      const newCode = await generateClassroomCode(); 
      setCode(newCode);
    } catch (error) {
      console.error("Error al generar código de aula:", error);
      alert("No se pudo generar el código. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800 }}>
        🔐 Código para estudiantes
      </h2>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 18,
          boxShadow: "0 10px 24px rgba(0,0,0,.08)",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: loading ? "#ccc" : "#1cb0f6", // Cambio de color si carga
            color: "#fff",
            padding: "14px 22px",
            borderRadius: 14,
            border: "none",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generando..." : "Generar código"}
        </button>

        {code && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontWeight: 600, color: "#777" }}>Código generado</p>
            {/* El código ahora aparecerá como AULA-XXXXXX */}
            <h1 style={{ letterSpacing: "4px", color: "#1cb0f6", fontSize: "32px" }}>
              {code}
            </h1>
            <small style={{ color: "#afafaf" }}>
              Compártelo con tus estudiantes para que se unan a tu clase
            </small>
          </div>
        )}
      </div>
    </div>
  );
};