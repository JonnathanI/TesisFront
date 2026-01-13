import React from "react";
import { useNavigate } from "react-router-dom";

const BIRD_ICON_URL = "/euro-04.png"; 
const BIRD_BACKGROUND_URL = "/euro-02.png"; 

export default function HomeIngles() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        :root {
          --color-bg-light: #E5E6E6; 
          --color-primary-blue: #278DCE; 
          --color-secondary-yellow: #FFD700; 
          --color-card-bg: rgba(255, 255, 255, 0.9); 
          --color-text-dark: #4A4A4A; 
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

        .bird-background {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 140vh;
          opacity: 0.5;
          z-index: 0;
          pointer-events: none;
        }

        /* HEADER CORREGIDO */
        .home-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 40px; /* Padding simétrico */
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          z-index: 10;
          box-sizing: border-box; /* Importante para que el padding no desborde el ancho */
        }

        .logo-text {
          font-size: 32px;
          font-weight: 900;
          color: var(--color-primary-blue);
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 2px 2px 0px var(--color-secondary-yellow);
          cursor: pointer;
        }

        /* BOTÓN CORREGIDO */
        .btn-login-header {
          padding: 12px 25px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          border: 2px solid var(--color-primary-blue);
          background: white;
          color: var(--color-primary-blue);
          transition: all 0.3s ease;
          white-space: nowrap; /* Evita que el texto se amontone */
          margin-left: 0; /* Se eliminó el margen negativo que lo ocultaba */
        }

        .btn-login-header:hover {
          background: var(--color-primary-blue);
          color: white;
          transform: scale(1.05);
        }

        .bird-icon-title {
          height: 100px;
          margin-left: 15px;
          margin-bottom: 10px;
          animation: floatBird 3s ease-in-out infinite;
        }

        @keyframes floatBird {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0); }
        }

        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 150px 20px 0 20px;
          z-index: 2;
        }

        .hero h1 {
          font-size: 64px;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--color-primary-blue);
        }

        .hero h1 span {
          color: var(--color-secondary-yellow);
        }

        .hero p {
          font-size: 20px;
          margin-bottom: 40px;
          max-width: 700px;
        }

        .cards {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 60px 0;
          z-index: 2;
        }

        .card {
          background: var(--color-card-bg);
          border-radius: 25px;
          width: 280px;
          padding: 30px 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .card h3 {
          color: var(--color-primary-blue);
        }

        @media (max-width: 900px) {
          .hero h1 { font-size: 45px; }
          .cards { flex-direction: column; align-items: center; }
          .logo-text { font-size: 24px; }
          .home-header { padding: 15px 20px; }
        }
      `}</style>

      <div className="home-container">
        <img src={BIRD_BACKGROUND_URL} alt="Fondo" className="bird-background" />

        {/* HEADER FIJO */}
        <header className="home-header">
          <div className="logo-text" onClick={() => navigate("/")}>Europeek</div>
          <button className="btn-login-header" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </header>

        {/* HERO */}
        <section className="hero">
          <h1>
            Aprende <span>Inglés</span> jugando <br /> y conquista el mundo
            <img src={BIRD_ICON_URL} alt="Bird" className="bird-icon-title" />
          </h1>

          <p>
            Únete a millones de estudiantes que aprenden inglés de forma divertida,
            con lecciones interactivas, retos y recompensas.
          </p>
        </section>

        {/* CARDS */}
        <section className="cards">
          <div className="card">
            <h3>🧠 Lecciones Inteligentes</h3>
            <p>Aprende con ejercicios adaptados a tu nivel.</p>
          </div>
          <div className="card">
            <h3>🎯 Desafíos Diarios</h3>
            <p>Retos que te mantienen motivado cada día.</p>
          </div>
          <div className="card">
            <h3>🏆 Recompensas</h3>
            <p>Gana medallas y sube de nivel.</p>
          </div>
        </section>
      </div>
    </>
  );
}