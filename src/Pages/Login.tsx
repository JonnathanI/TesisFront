import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// 🚨 CORRECCIÓN: La importación ahora apunta a '../api', que debería resolverse correctamente.
import { login, AuthResponse, UserRole } from "../api/auth.service"; 

export default function Login() {
    // Usamos 'email' porque tu backend espera 'email' en LoginRequest.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    /**
     * Maneja el proceso de inicio de sesión llamando al backend.
     */
    const handleLogin = async () => {
        if (!email || !password) {
            setError("Por favor, ingresa correo y contraseña.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            // 1. Llamar a la función de login. El tipo AuthResponse es ahora correcto.
            const data: AuthResponse = await login({ 
                username: email,
                password: password 
            });

            // 2. Guardar datos del usuario
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('fullName', data.fullName);
            
            // 3. Redirigir basado en el rol del usuario
            // Usamos toUpperCase() por si acaso el backend devuelve 'student' en minúsculas.
            switch (data.role.toUpperCase() as UserRole) {
                case 'ADMIN':
                    navigate("/teacher/dashboard");
                    break;
                case 'TEACHER':
                    navigate("/teacher/dashboard"); 
                    break;
                case 'STUDENT':
                default:
                    navigate("/student/dashboard");
                    break;
            }

        } catch (err) {
            // 4. Manejar errores del backend
            let errorMessage = "Error al intentar iniciar sesión.";
            if (err instanceof Error) {
                errorMessage = err.message.includes('401')
                    ? "Credenciales inválidas. Por favor, verifica tu correo y contraseña."
                    : `Error: ${err.message}`;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
                
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
                .login-card {
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
                .login-title {
                    font-size: 2.8rem;
                    font-weight: 900;
                    margin-bottom: 1rem;
                    color: #00ffff;
                    text-shadow: 0 0 10px #00ffff, 0 0 20px #00aaff;
                }
                .login-subtitle {
                    margin-bottom: 2.5rem;
                    font-size: 1.2rem;
                    opacity: 0.85;
                }
                .login-input {
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
                .login-input::placeholder {
                    color: rgba(255,255,255,0.6);
                    text-align: center;
                }
                .login-input:focus {
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
                .btn-login {
                    background: transparent;
                    color: #00ffff;
                    border: 2px solid #00ffff;
                    box-shadow: 0 0 30px rgba(0,255,255,0.5);
                }
                .btn-login:hover:not(:disabled) {
                    transform: scale(1.05) translateY(-3px);
                    box-shadow: 0 0 50px rgba(0,255,255,0.8);
                }
                .btn-login:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background-color: rgba(0,255,255,0.1);
                }
                .register-link {
                    margin-top: 1.5rem;
                    font-size: 1rem;
                    opacity: 0.85;
                }
                .register-link span {
                    color: #00ffff;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .error-message {
                    color: #ff4d4f;
                    margin-top: 10px;
                    margin-bottom: 10px;
                    font-size: 1rem;
                    font-weight: bold;
                    min-height: 20px; 
                }
            `}</style>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
            >
                <motion.div
                    className="login-card"
                    initial={{ scale: 0.8, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
                >
                    <div className="home-icon" onClick={() => navigate("/")}>
                        🏠
                    </div>

                    <h1 className="login-title">¡Bienvenido!</h1>
                    <p className="login-subtitle">
                        Inicia sesión para aprender inglés de forma divertida
                    </p>

                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        disabled={isLoading}
                        onKeyDown={(e) => { 
                            if (e.key === 'Enter') {
                                handleLogin();
                            }
                        }}
                    />

                    {/* Mensaje de error */}
                    <div className="error-message">
                         {error}
                    </div>

                    <button 
                        className="btn btn-login" 
                        onClick={handleLogin}
                        disabled={isLoading || !email || !password}
                    >
                        {isLoading ? "Cargando..." : "Iniciar sesión"}
                    </button>

                    <div className="register-link">
                        ¿No tienes cuenta?{" "}
                        <span onClick={() => navigate("/register")}>Regístrate</span>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}