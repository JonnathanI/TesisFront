import { useState, useEffect } from "react";
import { generateClassroomCode } from "../../api/auth.service"; 

export const GenerateCodeSection = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // --- NUEVOS ESTADOS ---
  const [maxUses, setMaxUses] = useState<number>(30);
  const [expirationDate, setExpirationDate] = useState<string>("");

  // Inicializar con la fecha de mañana para evitar errores
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpirationDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Aquí puedes pasar { maxUses, expirationDate } si tu API lo requiere
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
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "20px" }}>
        🔐 Código para estudiantes
      </h2>

      <div style={cardStyle}>
        {/* FILA DE CONFIGURACIÓN */}
        <div style={configRowStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Límite de alumnos</label>
            <input 
              type="number" 
              value={maxUses} 
              onChange={(e) => setMaxUses(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Vence el día</label>
            <input 
              type="date" 
              value={expirationDate} 
              onChange={(e) => setExpirationDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: loading ? "#ccc" : "#1cb0f6",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generando..." : "Generar código"}
        </button>

        {code && (
          <div style={resultContainerStyle}>
            <p style={{ fontWeight: 600, color: "#777", fontSize: "14px", marginBottom: "5px" }}>
              CÓDIGO GENERADO
            </p>
            <h1 style={codeStyle}>{code}</h1>
            <p style={infoTextStyle}>
              Válido hasta el <strong>{expirationDate.split('-').reverse().join('/')}</strong> para <strong>{maxUses}</strong> estudiantes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS EN OBJETOS PARA LIMPIEZA ---

const cardStyle: React.CSSProperties = {
  background: "#fff",
  padding: "30px",
  borderRadius: "22px",
  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
  textAlign: "center",
};

const configRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  marginBottom: "25px",
};

const inputGroupStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
  gap: "8px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#555",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "12px",
  border: "2px solid #f0f2f5",
  fontSize: "15px",
  fontWeight: 700,
  outline: "none",
  backgroundColor: "#f9fafb",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  color: "#fff",
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  fontWeight: 800,
  fontSize: "16px",
  transition: "all 0.2s",
};

const resultContainerStyle: React.CSSProperties = {
  marginTop: "25px",
  paddingTop: "20px",
  borderTop: "2px dashed #eee",
};

const codeStyle: React.CSSProperties = {
  letterSpacing: "5px",
  color: "#1cb0f6",
  fontSize: "36px",
  fontWeight: 900,
  margin: "10px 0",
};

const infoTextStyle: React.CSSProperties = {
  color: "#afafaf",
  fontSize: "13px",
  marginTop: "10px",
};