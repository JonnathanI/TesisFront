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
    } catch (err: any) {
      alert(err.message || "Error al generar el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>🔐 Código de registro para estudiantes</h2>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generando..." : "Generar código"}
      </button>

      {code && (
        <div style={{ marginTop: "1rem" }}>
          <p>Código generado:</p>
          <h3 style={{ letterSpacing: "4px" }}>{code}</h3>
          <small>Compártelo con tus estudiantes</small>
        </div>
      )}
    </div>
  );
};
