import { useState } from "react";
import { generateTeacherRegistrationCode } from "../../api/auth.service";

export const GenerateCodeSection = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newCode = await generateTeacherRegistrationCode();
      setCode(newCode);
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
            background: "#1cb0f6",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: 14,
            border: "none",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {loading ? "Generando..." : "Generar código"}
        </button>

        {code && (
          <div style={{ marginTop: 20 }}>
            <p>Código generado</p>
            <h1 style={{ letterSpacing: "6px", color: "#1cb0f6" }}>{code}</h1>
            <small>Compártelo con tus estudiantes</small>
          </div>
        )}
      </div>
    </div>
  );
};
