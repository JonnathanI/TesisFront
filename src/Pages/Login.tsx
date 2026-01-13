import React, { useEffect, useMemo, useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// Importamos las funciones necesarias de tu service
import { login, forgotPassword, AuthResponse } from "../api/auth.service";

const COLOR_PRIMARY_BLUE = "#278DCE";
const COLOR_SECONDARY_YELLOW = "#FFD700";
const COLOR_BG_LIGHT = "#E5E6E6";
const COLOR_CARD_BG = "rgba(255, 255, 255, 0.95)";
const COLOR_TEXT_DARK = "#4A4A4A";
const COLOR_SUCCESS = "#52c41a";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para recuperación
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverMessage, setRecoverMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // --- FUENTE Y ESTILOS GLOBALES ---
  useEffect(() => {
    const id = "poppins-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap";
      document.head.appendChild(link);
    }
    document.body.style.margin = "0";
    document.body.style.backgroundColor = COLOR_BG_LIGHT;
    document.body.style.color = COLOR_TEXT_DARK;
    document.body.style.fontFamily = "'Poppins', system-ui, sans-serif";
  }, []);

  const styles = useMemo<Record<string, CSSProperties>>(() => ({
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      padding: 24,
    },
    logoText: {
      position: "absolute",
      left: 40,
      top: 30,
      fontSize: 32,
      fontWeight: 900,
      color: COLOR_PRIMARY_BLUE,
      textTransform: "uppercase",
      textShadow: `2px 2px 0 ${COLOR_SECONDARY_YELLOW}`,
      cursor: "pointer",
    },
    card: {
      background: COLOR_CARD_BG,
      borderRadius: 25,
      padding: "64px 48px",
      width: 520,
      maxWidth: "95%",
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
    title: { fontSize: "2.8rem", fontWeight: 900, color: COLOR_PRIMARY_BLUE, margin: 0 },
    subtitle: { marginBottom: 40, fontSize: "1.2rem", color: "#666" },
    input: {
      width: "100%",
      padding: "18px 20px",
      borderRadius: 20,
      border: `2px solid ${COLOR_SECONDARY_YELLOW}`,
      fontSize: "1.1rem",
      marginBottom: 20,
      textAlign: "center",
      boxSizing: "border-box"
    },
    message: { minHeight: 24, marginBottom: 12, fontWeight: 800 },
    error: { color: "#ff4d4f" },
    success: { color: COLOR_SUCCESS },
    button: {
      width: "100%",
      padding: 18,
      fontSize: "1.2rem",
      fontWeight: 900,
      borderRadius: 50,
      background: COLOR_SECONDARY_YELLOW,
      cursor: "pointer",
      border: "none",
      marginTop: 10,
    },
    register: { marginTop: 20 },
    registerLink: { color: COLOR_PRIMARY_BLUE, cursor: "pointer", fontWeight: 800 },
    recoverLink: { color: COLOR_PRIMARY_BLUE, cursor: "pointer", marginTop: 12, display: "inline-block", fontWeight: 700 },
    recoverInput: {
      width: "100%",
      padding: 16,
      borderRadius: 20,
      border: `2px solid ${COLOR_PRIMARY_BLUE}`,
      fontSize: "1rem",
      marginBottom: 12,
      textAlign: "center",
      boxSizing: "border-box"
    },
  }), []);

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, ingresa correo y contraseña.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data: AuthResponse = await login({ username: email, password });
      setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
      
      setTimeout(() => {
        if (data.role === "ADMIN" || data.role === "TEACHER") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE RECUPERACIÓN REAL ---
  const handleRecoverPassword = async () => {
    if (!recoverEmail) {
      setRecoverMessage("Ingresa tu correo.");
      return;
    }

    setIsLoading(true);
    setRecoverMessage(null);

    try {
      // Llamada a tu backend: /api/auth/password/forgot
      await forgotPassword(recoverEmail);
      setRecoverMessage("Si el correo existe, recibirás un enlace en breve.");
      setRecoverEmail("");
      
      // Cerrar panel después de unos segundos
      setTimeout(() => {
        setShowRecover(false);
        setRecoverMessage(null);
      }, 4000);
    } catch (err: any) {
      setRecoverMessage("Error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.logoText} onClick={() => navigate("/")}>Europeek</div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={styles.card}>
          {!showRecover ? (
            <>
              <h1 style={styles.title}>¡Bienvenido!</h1>
              <p style={styles.subtitle}>Aprende inglés de forma divertida</p>

              <input
                style={styles.input}
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                style={styles.input}
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />

              <div style={{ ...styles.message, ...styles.error }}>{error}</div>
              {success && <div style={{ ...styles.message, ...styles.success }}>{success}</div>}

              <button style={styles.button} onClick={handleLogin} disabled={isLoading}>
                {isLoading ? "Cargando..." : "Iniciar sesión"}
              </button>

              <div style={styles.register}>
                ¿No tienes cuenta?{" "}
                <span style={styles.registerLink} onClick={() => navigate("/register")}>Regístrate</span>
              </div>

              <div style={styles.recoverLink} onClick={() => setShowRecover(true)}>
                ¿Olvidaste tu contraseña?
              </div>
            </>
          ) : (
            <>
              <h2 style={styles.title}>Recuperar</h2>
              <p style={styles.subtitle}>Te enviaremos un correo para restablecer tu cuenta</p>

              <input
                style={styles.recoverInput}
                type="email"
                placeholder="Ingresa tu correo"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRecoverPassword()}
              />

              <div style={{ ...styles.message, ...styles.success }}>{recoverMessage}</div>

              <button 
                style={{...styles.button, background: COLOR_PRIMARY_BLUE, color: 'white'}} 
                onClick={handleRecoverPassword}
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar enlace"}
              </button>

              <div style={styles.recoverLink} onClick={() => { setShowRecover(false); setRecoverMessage(null); }}>
                Volver al inicio de sesión
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};