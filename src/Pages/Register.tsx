import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// Asumo que tu archivo de API se llama 'auth.service' y está un nivel arriba
import { register, RegisterCredentials } from '../api/auth.service'; 

export default function Register() {
  // Renombré 'name' a 'fullName' para que coincida con la API
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState(""); // <-- ¡NUEVO!
  const [error, setError] = useState<string | null>(null); // <-- ¡NUEVO!
  const [isLoading, setIsLoading] = useState(false); // <-- ¡NUEVO!
  const navigate = useNavigate();

  // --- ¡FUNCIÓN DE REGISTRO ACTUALIZADA! ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene que la página se recargue
    setError(null);
    setIsLoading(true);

    const credentials: RegisterCredentials = {
        username: email, // Tu API espera 'username' para el email
        password: password,
        fullName: fullName,
        adminCode: adminCode || undefined // Envía undefined si está vacío
    };

    try {
        await register(credentials);
        navigate("/student/dashboard"); // ¡Éxito! Navega al dashboard
    } catch (err: any) {
        // Muestra el error del backend
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
          background: linear-gradient(135deg, #1a1a1a, #0f0f0f, #2a2a2a, #1f1f1f);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: white;
        }
        .register-card {
          background: rgba(0,0,0,0.85);
          border-radius: 25px;
          padding: 4rem 3rem;
          width: 520px;
          max-width: 95%;
          text-align: center;
          box-shadow: 0 0 35px rgba(0,255,255,0.3);
          border: 1px solid rgba(0,255,255,0.4);
          position: relative;
        }
        .home-icon {
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 1.8rem;
          cursor: pointer;
          color: #00ffff;
          transition: transform 0.2s, color 0.2s;
        }
        .home-icon:hover {
          transform: scale(1.2);
          color: #00aaff;
        }
        .register-title {
          font-size: 2.8rem;
          font-weight: 900;
          margin-bottom: 1rem;
          color: #00ffff;
          text-shadow: 0 0 10px #00ffff, 0 0 20px #00aaff;
        }
        .register-subtitle {
          margin-bottom: 2.5rem;
          font-size: 1.2rem;
          opacity: 0.85;
        }
        .register-input {
          width: 90%;
          padding: 1.1rem 1.3rem;
          border-radius: 20px;
          border: 2px solid rgba(0,255,255,0.4);
          background: rgba(0,255,255,0.05);
          color: #fff;
          font-size: 1.15rem;
          outline: none;
          margin-bottom: 1.8rem;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(0,255,255,0.2);
          text-align: center;
        }
        .register-input::placeholder {
          color: rgba(255,255,255,0.6);
          text-align: center;
        }
        .register-input:focus {
          border: 2px solid #00ffff;
          box-shadow: 0 0 25px #00ffff;
          transform: scale(1.03);
          background: rgba(0,255,255,0.1);
        }
        .btn {
          width: 90%;
          padding: 1.2rem;
          font-size: 1.25rem;
          font-weight: 900;
          border-radius: 50px;
          cursor: pointer;
          border: none;
          margin-top: 1.2rem;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }
        .btn-register {
          background: transparent;
          color: #00ffff;
          border: 2px solid #00ffff;
          box-shadow: 0 0 30px rgba(0,255,255,0.5);
        }
        .btn-register:hover {
          transform: scale(1.05) translateY(-3px);
          box-shadow: 0 0 50px rgba(0,255,255,0.8);
        }
        .btn-register:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .login-link {
          margin-top: 1.5rem;
          font-size: 1rem;
          opacity: 0.85;
        }
        .login-link span {
          color: #00ffff;
          cursor: pointer;
          text-decoration: underline;
        }
        .error-message {
            color: #FF6B6B; /* Un color de error rojo/rosado */
            margin-top: 1rem;
            font-weight: bold;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
      >
        <motion.div
          className="register-card"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
        >
          <div className="home-icon" onClick={() => navigate("/")}>
            🏠
          </div>

          <h1 className="register-title">¡Crea tu cuenta!</h1>
          <p className="register-subtitle">
            Regístrate y comienza a aprender inglés de forma divertida
          </p>

          {/* --- FORMULARIO CONECTADO --- */}
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

            {/* --- ¡CAMPO NUEVO AÑADIDO! --- */}
            <input
              type="text"
              placeholder="Código de Administrador (opcional)"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="register-input"
            />
            
            {/* --- MENSAJE DE ERROR AÑADIDO --- */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <button type="submit" className="btn btn-register" disabled={isLoading}>
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