// src/Teachers/components/GenerateCodeSection.tsx
import { useState } from "react";
import { generateClassroomCode } from "../../api/auth.service";

export const GenerateCodeSection = () => {
  const [code, setCode] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState<number>(1); // 👈 cuántas veces será válido
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!maxUses || maxUses <= 0) {
      alert("Ingresa un número de usos mayor a 0");
      return;
    }

    setLoading(true);
    try {
      const newCode = await generateClassroomCode(maxUses);
      setCode(newCode);
    } catch (error) {
      console.error("Error al generar código de aula:", error);
      alert("No se pudo generar el código. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "520px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: 12 }}>
        🔐 Código para estudiantes
      </h2>

      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
        Genera un código que tus estudiantes podrán usar para unirse a tu aula.
      </p>

      <div
        style={{
          background: "#ffffff",
          padding: 24,
          borderRadius: 18,
          boxShadow: "0 10px 24px rgba(0,0,0,.08)",
          marginTop: 12,
        }}
      >
        {/* Campo: cantidad de usos */}
        <div style={{ marginBottom: 20, textAlign: "left" }}>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 6,
              color: "#374151",
            }}
          >
            Número de veces que se puede usar el código
          </label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "2px solid #e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* Botón generar */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#1cb0f6",
              color: "#fff",
              padding: "12px 22px",
              borderRadius: 14,
              border: "none",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              minWidth: 180,
            }}
          >
            {loading ? "Generando..." : "Generar código"}
          </button>
        </div>

        {/* Resultado */}
        {code && (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              borderTop: "1px dashed #e5e7eb",
              paddingTop: 16,
            }}
          >
            <p style={{ fontWeight: 600, color: "#4b5563", marginBottom: 4 }}>
              Código generado:
            </p>
            <h1
              style={{
                letterSpacing: "4px",
                color: "#1cb0f6",
                fontSize: "32px",
                margin: "4px 0",
              }}
            >
              {code}
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              🔁 Usos permitidos:{" "}
              <strong style={{ color: "#111827" }}>{maxUses}</strong>
            </p>
            <small style={{ color: "#9ca3af" }}>
              Compártelo con tus estudiantes para que se unan al Grupo.
            </small>
          </div>
        )}
      </div>
    </div>
  );
};
