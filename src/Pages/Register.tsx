import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { register, RegisterCredentials } from "../api/auth.service";

export default function Register() {
  // 🎨 Colores reales del diseño
  const BLUE = "#1D8DD9";
  const BLUE_DARK = "#0F6CA8";
  const YELLOW = "#FFE45C";
  const YELLOW_BORDER = "#FFDD33";
  const INPUT_BG = "#FFFBEA";
  const PAGE_BG = "#E8E8E8";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const credentials: RegisterCredentials = {
      username: email,
      password: password,
      fullName: fullName,
      adminCode: adminCode || undefined,
    };

    try {
      await register(credentials);
      navigate("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al registrar. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          height: 100%;
          font-family: 'Poppins', sans-serif;
        }
        body {
          background: ${PAGE_BG};
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: #333;
        }

        /* ----- CARD ----- */
        .register-card {
          background: #FFFFFF;
          border-radius: 25px;
          padding: 4rem 3rem;
          width: 520px;
          max-width: 95%;
          text-align: center;
          box-shadow: 0 4px 25px rgba(0,0,0,0.1);
          position: relative;
        }

        .home-icon {
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 1.8rem;
          cursor: pointer;
          color: ${BLUE};
          transition: transform 0.2s;
        }
        .home-icon:hover {
          transform: scale(1.15);
        }

        /* ----- TEXTS ----- */
        .register-title {
          font-size: 2.6rem;
          font-weight: 900;
          margin-bottom: 1rem;
          color: ${BLUE};
        }

        .register-subtitle {
          margin-bottom: 2.5rem;
          font-size: 1.1rem;
          opacity: 0.8;
        }

        /* ----- INPUTS ----- */
        .register-input {
          width: 90%;
          padding: 1.1rem 1.3rem;
          border-radius: 12px;
          border: 2px solid ${YELLOW_BORDER};
          background: ${INPUT_BG};
          font-size: 1.15rem;
          outline: none;
          margin-bottom: 1.8rem;
          transition: 0.2s;
          text-align: center;
          color: #333;
        }
        .register-input::placeholder {
          color: #A6A6A6;
        }
        .register-input:focus {
          border-color: ${BLUE};
        }

        /* ----- BUTTON ----- */
        .btn-register {
          width: 90%;
          padding: 1.2rem;
          font-size: 1.25rem;
          font-weight: 900;
          border-radius: 50px;
          cursor: pointer;
          background: ${YELLOW};
          color: ${BLUE_DARK};
          border: 2px solid ${YELLOW_BORDER};
          margin-top: 1.2rem;
          text-transform: uppercase;
          transition: 0.2s;
        }
        .btn-register:hover {
          transform: scale(1.05);
        }
        .btn-register:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ----- LINK ----- */
        .login-link {
          margin-top: 1.5rem;
          font-size: 1rem;
          opacity: 0.85;
        }

        .login-link span {
          color: ${BLUE};
          cursor: pointer;
          font-weight: 600;
        }

        /* ERRORS */
        .error-message {
          color: #D9534F;
          margin-top: 1rem;
          font-weight: bold;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <motion.div
          className="register-card"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        >
          <div className="home-icon" onClick={() => navigate("/")}>
            🏠
          </div>

          <h1 className="register-title">¡Crea tu cuenta!</h1>
          <p className="register-subtitle">
            Regístrate y comienza a aprender inglés de forma divertida
          </p>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="register-input"
              required
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input"
              required
            />

            <input
              type="text"
              placeholder="Código de Administrador (opcional)"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="register-input"
            />

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-register" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear cuenta"}
            </button>
          </form>

          <div className="login-link">
            ¿Ya tienes una cuenta?{" "}
            <span onClick={() => navigate("/login")}>Inicia sesión</span>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
