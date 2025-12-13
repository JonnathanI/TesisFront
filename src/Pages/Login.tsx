import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// Importamos la función login y los tipos necesarios
import { login, AuthResponse, UserRole } from "../api/auth.service"; 

// Paleta de colores importada de HomeIngles
const COLOR_PRIMARY_BLUE = "#278DCE";
const COLOR_SECONDARY_YELLOW = "#FFD700";
const COLOR_BG_LIGHT = "#E5E6E6";
const COLOR_CARD_BG = "rgba(255, 255, 255, 0.95)";
const COLOR_TEXT_DARK = "#4A4A4A";

export default function Login() {
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
            const data: AuthResponse = await login({ 
                username: email,
                password: password 
            });

            // CORRECCIÓN CLAVE: El rol ya se guarda en auth.service.ts
            // Usaremos la data que nos da la respuesta, que es lo más directo.
            
            switch (data.role.toUpperCase() as UserRole) {
                case 'ADMIN':
                case 'TEACHER':
                    navigate("/teacher/dashboard"); 
                    break;
                case 'STUDENT':
                default:
                    navigate("/student/dashboard");
                    break;
            }

        } catch (err) {
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
                
                /* PALETA DE COLORES */
                :root {
                  --color-bg-light: ${COLOR_BG_LIGHT}; 
                  --color-primary-blue: ${COLOR_PRIMARY_BLUE}; 
                  --color-secondary-yellow: ${COLOR_SECONDARY_YELLOW}; 
                  --color-card-bg: ${COLOR_CARD_BG};
                  --color-text-dark: ${COLOR_TEXT_DARK}; 
                  --color-text-light: #FFFFFF; 
                }

                html, body, #root {
                    margin: 0;
                    height: 100%;
                    font-family: 'Poppins', sans-serif;
                }
                body {
                    background-color: var(--color-bg-light);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    color: var(--color-text-dark);
                }
                
                /* --- AHORA ES UN BOTÓN DE REGRESO AL HOME --- */
                .logo-text {
                    position: absolute;
                    left: 40px; 
                    top: 30px;  
                    font-size: 32px;
                    font-weight: 900;
                    color: var(--color-primary-blue);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-shadow: 2px 2px 0px var(--color-secondary-yellow);
                    cursor: pointer;
                    z-index: 10;
                    transition: transform 0.2s;
                }
                .logo-text:hover {
                    transform: scale(1.05); /* Agregamos un pequeño efecto al pasar el ratón */
                }
                
                .login-card {
                    background: var(--color-card-bg);
                    border-radius: 25px;
                    padding: 4rem 3rem;
                    width: 520px;
                    max-width: 95%;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); 
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    position: relative;
                }
                
                /* ELIMINADO EN JSX, PERO MANTENGO EL ESTILO SI DECIDES REAÑADIR EL EMOJI 
                .home-icon {
                    position: absolute;
                    top: 20px;
                    left: 20px; 
                    font-size: 1.8rem;
                    cursor: pointer;
                    color: var(--color-text-dark); 
                    transition: transform 0.2s, color 0.2s;
                    opacity: 0; 
                }
                .home-icon:hover {
                    transform: scale(1.2);
                    color: var(--color-primary-blue);
                }*/
                
                .login-title {
                    font-size: 2.8rem;
                    font-weight: 900;
                    margin-bottom: 1rem;
                    color: var(--color-primary-blue); 
                    text-shadow: none;
                }
                
                .login-subtitle {
                    margin-bottom: 2.5rem;
                    font-size: 1.2rem;
                    opacity: 0.85;
                    color: var(--color-text-dark);
                }
                
                .login-input {
                    width: 90%;
                    padding: 1.1rem 1.3rem;
                    border-radius: 20px;
                    border: 2px solid var(--color-secondary-yellow); 
                    background: rgba(255, 215, 0, 0.05);
                    color: var(--color-text-dark);
                    font-size: 1.15rem;
                    outline: none;
                    margin-bottom: 1.8rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
                    text-align: center;
                }
                .login-input::placeholder {
                    color: var(--color-text-dark);
                    opacity: 0.5;
                    text-align: center;
                }
                .login-input:focus {
                    border: 2px solid var(--color-primary-blue);
                    box-shadow: 0 0 25px rgba(39, 141, 206, 0.5);
                    transform: scale(1.03);
                    background: rgba(39, 141, 206, 0.05);
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
                    background: var(--color-secondary-yellow);
                    color: var(--color-text-dark);
                    border: 2px solid var(--color-secondary-yellow);
                    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.5);
                }
                .btn-login:hover:not(:disabled) {
                    transform: scale(1.05) translateY(-3px);
                    background-color: #FFC000;
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
                }
                .btn-login:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background-color: var(--color-secondary-yellow);
                }
                
                .register-link {
                    margin-top: 1.5rem;
                    font-size: 1rem;
                    opacity: 0.85;
                }
                .register-link span {
                    color: var(--color-primary-blue);
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

                @media (max-width: 600px) {
                    .logo-text { left: 20px; top: 20px; font-size: 24px; }
                }
            `}</style>

            {/* Logo de Europeek que ahora actúa como botón de regreso al Home */}
            <div className="logo-text" onClick={() => navigate("/")}>
                Europeek
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100%" }}
            >
                <motion.div
                    className="login-card"
                    initial={{ scale: 0.8, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
                >
                    {/* El icono de casa (🏠) ha sido eliminado del JSX ya que Europeek hace su función */}

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