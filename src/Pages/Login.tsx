// src/Pages/Login.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  login,
  forgotPassword,
  getToken,
  getUserRole,
} from "../api/auth.service";
import { AuthResponse } from "../api/auth.types";

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

  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverMessage, setRecoverMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // ✅ Si ya hay sesión guardada, mandar directo al dashboard
  useEffect(() => {
    const token = getToken();
    const role = getUserRole();

    if (token && role) {
      const path =
        role === "ADMIN"
          ? "/admin/dashboard"
          : role === "TEACHER"
          ? "/teacher/dashboard"
          : "/student/dashboard";

      navigate(path, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const id = "poppins-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap";
      document.head.appendChild(link);
    }
    document.body.style.margin = "0";
    document.body.style.backgroundColor = "transparent";
    document.body.style.color = COLOR_TEXT_DARK;
    document.body.style.fontFamily = "'Poppins', system-ui, sans-serif";
  }, []);

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

      // El login ya guarda token + rol en localStorage.
      // Aquí solo hacemos la navegación.
      setTimeout(() => {
        if (data.role === "ADMIN") navigate("/admin/dashboard");
        else if (data.role === "TEACHER") navigate("/teacher/dashboard");
        else navigate("/student/dashboard");
      }, 800);
    } catch (err: any) {
      setError(err?.message || "Credenciales inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    if (!recoverEmail) {
      setRecoverMessage("Ingresa tu correo.");
      return;
    }

    setIsLoading(true);
    setRecoverMessage(null);

    try {
      await forgotPassword(recoverEmail);
      setRecoverMessage("Si el correo existe, recibirás un enlace en breve.");
      setRecoverEmail("");

      setTimeout(() => {
        setShowRecover(false);
        setRecoverMessage(null);
      }, 3500);
    } catch (err: any) {
      setRecoverMessage("Error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  const css = `
.login-page{
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;

  background: url("/images/login-bg.jpg") no-repeat center center;
  background-size: cover;
}

    .login-logo{
      position: absolute;
      z-index: 1;
      left: 40px;
      top: 30px;
      font-size: 32px;
      font-weight: 900;
      color: ${COLOR_PRIMARY_BLUE};
      text-transform: uppercase;
      text-shadow: 2px 2px 0 ${COLOR_SECONDARY_YELLOW};
      cursor: pointer;
      user-select: none;
      line-height: 1;
    }

    .login-card{
    position: relative;
    z-index: 1;
      background: ${COLOR_CARD_BG};
      border-radius: 25px;
      padding: 64px 48px;
      width: 520px;
      max-width: 95%;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      box-sizing: border-box;
    }

    .login-title{
      font-size: 2.8rem;
      font-weight: 900;
      color: ${COLOR_PRIMARY_BLUE};
      margin: 0;
      line-height: 1.05;
    }

    .login-subtitle{
      margin: 14px 0 40px 0;
      font-size: 1.2rem;
      color: #666;
    }

    .login-input{
      width: 100%;
      padding: 18px 20px;
      border-radius: 20px;
      border: 2px solid ${COLOR_SECONDARY_YELLOW};
      font-size: 1.1rem;
      margin-bottom: 20px;
      text-align: center;
      box-sizing: border-box;
      outline: none;
      background: white;
    }

    .login-input:focus{
      border-color: ${COLOR_PRIMARY_BLUE};
      box-shadow: 0 0 0 4px rgba(39,141,206,0.15);
    }

    .login-message{
      min-height: 24px;
      margin-bottom: 12px;
      font-weight: 800;
    }

    .login-error{ color: #ff4d4f; }
    .login-success{ color: ${COLOR_SUCCESS}; }

    .login-btn{
      width: 100%;
      padding: 18px;
      font-size: 1.2rem;
      font-weight: 900;
      border-radius: 999px;
      background: ${COLOR_SECONDARY_YELLOW};
      cursor: pointer;
      border: none;
      margin-top: 10px;
      transition: transform 0.08s ease;
    }
    .login-btn:active{ transform: scale(0.98); }
    .login-btn:disabled{
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-row{
      margin-top: 20px;
      font-size: 0.98rem;
    }

    .login-link{
      color: ${COLOR_PRIMARY_BLUE};
      cursor: pointer;
      font-weight: 800;
    }

    .login-recover{
      color: ${COLOR_PRIMARY_BLUE};
      cursor: pointer;
      margin-top: 12px;
      display: inline-block;
      font-weight: 700;
    }

    .recover-input{
      width: 100%;
      padding: 16px;
      border-radius: 20px;
      border: 2px solid ${COLOR_PRIMARY_BLUE};
      font-size: 1rem;
      margin-bottom: 12px;
      text-align: center;
      box-sizing: border-box;
      outline: none;
      background: white;
    }

    .recover-btn{
      width: 100%;
      padding: 18px;
      font-size: 1.1rem;
      font-weight: 900;
      border-radius: 999px;
      background: ${COLOR_PRIMARY_BLUE};
      color: white;
      cursor: pointer;
      border: none;
    }
    .recover-btn:disabled{
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* ✅ Tablet */
    @media (max-width: 900px){
      .login-page{
        align-items: flex-start;
        padding: 18px;
        padding-top: 90px;
      }

      .login-logo{
        left: 50%;
        top: 22px;
        transform: translateX(-50%);
        font-size: 28px;
      }

      .login-card{
        width: 560px;
        max-width: 100%;
        padding: 44px 26px;
        border-radius: 22px;
      }

      .login-title{ font-size: 2.2rem; }
      .login-subtitle{ font-size: 1.05rem; margin-bottom: 26px; }
      .login-input{ padding: 16px 16px; font-size: 1rem; border-radius: 18px; }
      .login-btn{ padding: 16px; font-size: 1.1rem; }
    }
      @media (max-width: 768px){
  .login-page{
    background-position: top center;
  }
}

    /* ✅ Mobile */
    @media (max-width: 480px){
      .login-page{
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .login-logo{
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 26px;
        text-align: center;
      }

      .login-card{
        width: 100%;
        max-width: 420px;
        border-radius: 0;
        padding: 28px 22px;
        box-shadow: none;
      }

      .login-title{
        font-size: 1.9rem;
      }

      .login-subtitle{
        font-size: 0.95rem;
        margin-bottom: 22px;
      }

      .login-input{
        padding: 14px;
        font-size: 0.95rem;
        margin-bottom: 14px;
      }

      .login-btn,
      .recover-btn{
        padding: 14px;
        font-size: 1rem;
      }
    }
  `;

  return (
    <div className="login-page">
      <style>{css}</style>

      <div className="login-logo" onClick={() => navigate("/")}>
        Europeek
      </div>

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="login-card">
          {!showRecover ? (
            <>
              <h1 className="login-title">¡Bienvenido!</h1>
              <p className="login-subtitle">
                Aprende inglés de forma divertida
              </p>

              <input
                className="login-input"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="login-input"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />

              <div className="login-message login-error">{error}</div>
              {success && (
                <div className="login-message login-success">{success}</div>
              )}

              <button
                className="login-btn"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Iniciar sesión"}
              </button>

              <div className="login-row">
                ¿No tienes cuenta?{" "}
                <span
                  className="login-link"
                  onClick={() => navigate("/register")}
                >
                  Regístrate
                </span>
              </div>

              <div
                className="login-recover"
                onClick={() => setShowRecover(true)}
              >
                ¿Olvidaste tu contraseña?
              </div>
            </>
          ) : (
            <>
              <h2 className="login-title">Recuperar</h2>
              <p className="login-subtitle">
                Te enviaremos un correo para restablecer tu cuenta
              </p>

              <input
                className="recover-input"
                type="email"
                placeholder="Ingresa tu correo"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRecoverPassword()}
              />

              <div className="login-message login-success">
                {recoverMessage}
              </div>

              <button
                className="recover-btn"
                onClick={handleRecoverPassword}
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar enlace"}
              </button>

              <div
                className="login-recover"
                onClick={() => {
                  setShowRecover(false);
                  setRecoverMessage(null);
                }}
              >
                Volver al inicio de sesión
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};