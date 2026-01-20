import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Token inválido o expirado");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (!res.ok) throw new Error("Error al cambiar contraseña");

      setMessage("¡Contraseña actualizada con éxito!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("No se pudo restablecer la contraseña. Intenta de nuevo.");
    }
  };

  return (
    <div style={styles.container}>
      {/* Logo superior igual al Login */}
      <div style={styles.logoContainer}>
        <span style={styles.logoBlue}>EURO</span>
        <span style={styles.logoYellow}>PEEK</span>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Nueva contraseña</h1>
        <p style={styles.subtitle}>Crea una contraseña segura para tu cuenta</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.errorText}>{error}</p>}
          {message && <p style={styles.successText}>{message}</p>}

          <button type="submit" style={styles.button}>
            Restablecer contraseña
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.link} onClick={() => navigate("/login")}>
            Volver al inicio de sesión
          </span>
        </div>
      </div>
    </div>
  );
}

// --- ESTILOS PARA COINCIDIR CON LA IMAGEN ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#e5e5e5", // Gris claro de fondo
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  logoContainer: {
    position: "absolute",
    top: "30px",
    left: "30px",
    fontSize: "28px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  logoBlue: { color: "#1cb0f6" },
  logoYellow: { color: "#ffc800" },
  card: {
    backgroundColor: "#ffffff",
    padding: "50px 40px",
    borderRadius: "20px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "450px",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    color: "#3c3c3c",
    marginBottom: "10px",
    fontWeight: "800",
  },
  subtitle: {
    color: "#777",
    fontSize: "16px",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "15px 20px",
    borderRadius: "15px",
    border: "2px solid #efefef",
    outline: "none",
    fontSize: "16px",
    transition: "border 0.2s",
    backgroundColor: "#f7f7f7",
  },
  // Nota: Para que el borde cambie a amarillo al hacer focus, 
  // podrías usar una clase CSS, pero aquí lo mantenemos simple.
  button: {
    backgroundColor: "#ffc800",
    color: "#3c3c3c",
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "uppercase",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0px 4px 0px #e5a500", // Efecto 3D del botón de Duolingo
  },
  errorText: {
    color: "#ff4b4b",
    fontSize: "14px",
    margin: "5px 0",
  },
  successText: {
    color: "#58cc02",
    fontSize: "14px",
    margin: "5px 0",
  },
  footer: {
    marginTop: "25px",
  },
  link: {
    color: "#1cb0f6",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "none",
  },
};