import React from "react";
import { useNavigate } from "react-router-dom";

// IMPORTANTE: Recuerda tener las imágenes en tu carpeta public
const BIRD_ICON_URL = "/euro-04.png"; 
const BIRD_BACKGROUND_URL = "/euro-02.png"; 

export default function HomeIngles() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        /* PALETA DE COLORES */
        :root {
          --color-bg-light: #E5E6E6; 
          --color-primary-blue: #278DCE; 
          --color-secondary-yellow: #FFD700; 
          --color-card-bg: rgba(255, 255, 255, 0.9); 
          --color-text-dark: #4A4A4A; 
          --color-text-light: #FFFFFF; 
        }
        
        html, body, #root {
          margin: 0;
          height: 100%;
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        body {
          background-color: var(--color-bg-light);
          color: var(--color-text-dark); 
        }
        
        .home-container { 
          display: flex; 
          flex-direction: column; 
          min-height: 100vh;
          position: relative; 
          z-index: 1; 
        }
        
        /* FONDO GRANDE (SIN CAMBIOS) */
        .bird-background {
          position: fixed; 
          top: 50%; 
          left: 50%;
          transform: translate(-50%, -50%); 
          height: 140vh; 
          width: auto;
          max-width: 100%;
          opacity: 0.5; 
          z-index: 0; 
          pointer-events: none; 
          object-fit: contain; 
        }

        /* --- NUEVO: ESTILO PARA EL TEXTO "Europeek" --- */
        .logo-text {
          position: absolute;
          left: 40px; /* Separación desde la izquierda */
          top: 30px;  /* Separación desde arriba */
          font-size: 32px;
          font-weight: 900;
          color: var(--color-primary-blue);
          text-transform: uppercase;
          letter-spacing: 1px;
          /* Sombra para que destaque y combine con el tema */
          text-shadow: 2px 2px 0px var(--color-secondary-yellow);
          cursor: pointer;
          z-index: 10;
        }

        /* --- CAMBIOS AQUÍ: ÍCONO MÁS GRANDE Y CON MOVIMIENTO --- */
        .bird-icon-title {
          height: 100px; /* AUMENTADO: Antes era 55px */
          width: auto;
          vertical-align: middle;
          margin-left: 15px;
          margin-bottom: 10px;
          display: inline-block;
          
          /* ANIMACIÓN AÑADIDA */
          animation: floatBird 3s ease-in-out infinite;
        }

        /* DEFINICIÓN DE LA ANIMACIÓN DE MOVIMIENTO */
        @keyframes floatBird {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); } /* Sube y rota un poquito */
          100% { transform: translateY(0px) rotate(0deg); }
        }

        /* --- Estilos de Componentes --- */
        .header { width: 100%; display: flex; justify-content: center; align-items: center; padding: 25px 40px; position: relative; z-index: 2; }

        .hero { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0 20px; position: relative; z-index: 2;}

        .hero h1 {
          font-size: 64px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 20px;
          text-transform: uppercase;
          position: relative;
          color: var(--color-primary-blue); 
          text-shadow: 0 0 5px rgba(39, 141, 206, 0.7), 0 0 10px rgba(39, 141, 206, 0.4);
        }

        .hero h1 span {
          color: var(--color-secondary-yellow); 
          text-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
        }
        
        .hero h1::before, .hero h1::after {
          content: "🇬🇧";
          font-size: 48px;
          position: absolute;
          top: -20px;
          animation: none;
        }
        .hero h1::after { content: "🇺🇸"; right: -60px; }
        .hero h1::before { left: -60px; }

        .hero p { 
          font-size: 20px; 
          opacity: 1; 
          margin-bottom: 40px; 
          max-width: 700px; 
          animation: fadeUp 1.5s ease forwards; 
          color: var(--color-text-dark); 
        }

        .hero-buttons { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }

        .btn {
          padding: 16px 50px;
          font-size: 18px;
          font-weight: 800;
          border-radius: 50px;
          cursor: pointer;
          border: none;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-transform: uppercase;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); 
        }

        .btn-login {
          background: var(--color-card-bg); 
          color: var(--color-primary-blue); 
          border: 2px solid var(--color-primary-blue); 
          box-shadow: none; 
        }
        .btn-login:hover {
          transform: scale(1.05);
          background-color: var(--color-primary-blue); 
          color: var(--color-text-light); 
          box-shadow: 0 8px 20px rgba(39, 141, 206, 0.4);
        }
        
        .btn-play {
          background: var(--color-secondary-yellow); 
          color: var(--color-text-dark); 
          font-weight: 900;
          border: 2px solid var(--color-secondary-yellow);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }
        .btn-play:hover {
          transform: scale(1.1);
          background-color: #FFC000; 
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.8);
        }

        .cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; margin: 60px 0; position: relative; z-index: 2; }

        .card {
          background: var(--color-card-bg);
          border-radius: 25px;
          width: 280px;
          padding: 30px 20px;
          backdrop-filter: blur(5px); 
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); 
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(0, 0, 0, 0.1); 
        }
        .card:hover { transform: translateY(-10px) scale(1.03); box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3); }
        .card h3 { font-size: 24px; margin-bottom: 10px; color: var(--color-primary-blue); }
        .card p { font-size: 15px; opacity: 1; color: var(--color-text-dark); }

        .footer { text-align: center; padding: 20px; opacity: 0.8; font-size: 14px; position: relative; z-index: 2; }

        @media (max-width: 900px) { 
          .hero h1 { font-size: 45px; } 
          .cards { flex-direction: column; align-items: center; } 
          .logo-text { left: 20px; top: 20px; font-size: 24px; } /* Ajuste de logo en móvil */
        }
        @keyframes fadeUp { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="home-container">
        
        <img 
          src={BIRD_BACKGROUND_URL} 
          alt="Pájaro Fondo"
          className="bird-background"
        />

        <header className="header">
          {/* NUEVO: Logo Europeek en la esquina izquierda */}
          <div className="logo-text">Europeek</div>
        </header>

        <section className="hero">
          <h1>
            Aprende <span>Inglés</span> jugando 
            <br /> y conquista el mundo 
            
            {/* ÍCONO MÁS GRANDE Y CON ANIMACIÓN */}
            <img 
              src={BIRD_ICON_URL} 
              alt="Pájaro Animado"
              className="bird-icon-title"
            />
          </h1>
          <p>
            Únete a millones de estudiantes que aprenden inglés de forma divertida,
            con lecciones interactivas, retos y recompensas.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-login" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
            <button className="btn btn-play" onClick={() => navigate('/student/dashboard')}>
              Juega ahora
            </button>
          </div>
        </section>

        <section className="cards">
          <div className="card">
            <h3>🧠 Lecciones Inteligentes</h3>
            <p>Aprende gramática, vocabulario y pronunciación con ejercicios que se adaptan a tu nivel.</p>
          </div>
          <div className="card">
            <h3>🎯 Desafíos Diarios</h3>
            <p>Mejora cada día con retos, logros y misiones para mantenerte motivado.</p>
          </div>
          <div className="card">
            <h3>🏆 Gana Recompensas</h3>
            <p>Sube de nivel, gana medallas y demuestra tus progresos en cada lección.</p>
          </div>
        </section>

        <footer className="footer">
        </footer>
      </div>
    </>
  );
}