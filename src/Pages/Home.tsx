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

/* CONTENEDOR */
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* 🔥 FONDO RESPONSIVE */
.bird-background {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;   /* 🔥 CLAVE */
  object-position: center;
  opacity: 0.25;
  z-index: 0;
  pointer-events: none;
}

/* HEADER */
.home-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 10;
  box-sizing: border-box;
}

.logo-text {
  font-size: 32px;
  font-weight: 900;
  color: var(--color-primary-blue);
  text-transform: uppercase;
  text-shadow: 2px 2px 0px var(--color-secondary-yellow);
  cursor: pointer;
}

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
  white-space: nowrap;
}

.btn-login-header:hover {
  background: var(--color-primary-blue);
  color: white;
  transform: scale(1.05);
}

/* HERO */
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 160px 20px 40px 20px;
  z-index: 2;
}

.hero h1 {
  font-size: 64px;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--color-primary-blue);
  line-height: 1.1;
}

.hero h1 span {
  color: var(--color-secondary-yellow);
}

.hero p {
  font-size: 20px;
  margin-bottom: 40px;
  max-width: 700px;
}

/* PÁJARO TÍTULO */
.bird-icon-title {
  height: 90px;
  margin-left: 15px;
  animation: floatBird 3s ease-in-out infinite;
}

@keyframes floatBird {
  0% { transform: translateY(0); }
  50% { transform: translateY(-12px) rotate(4deg); }
  100% { transform: translateY(0); }
}

/* CARDS */
.cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;  /* 🔥 IMPORTANTE */
  gap: 30px;
  margin: 40px 20px 80px 20px;
  z-index: 2;
}

.card {
  background: var(--color-card-bg);
  border-radius: 25px;
  width: 280px;
  padding: 30px 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-8px);
}

.card h3 {
  color: var(--color-primary-blue);
}

/* ===================== */
/* TABLET */
/* ===================== */
@media (max-width: 900px) {

  .hero h1 { font-size: 42px; }

  .hero p { font-size: 18px; }

  .logo-text { font-size: 24px; }

  .home-header { padding: 15px 20px; }

  .bird-icon-title { height: 70px; }

}

/* ===================== */
/* MOBILE */
/* ===================== */
@media (max-width: 480px) {

  .home-header {
    padding: 12px 15px;
  }

  .logo-text {
    font-size: 20px;
  }

  .btn-login-header {
    padding: 8px 16px;
    font-size: 14px;
  }

  .hero {
    padding: 120px 15px 30px 15px;
  }

  .hero h1 {
    font-size: 28px;
  }

  .hero p {
    font-size: 15px;
  }

  .bird-icon-title {
    height: 55px;
  }

  .card {
    width: 100%;
    max-width: 350px;
  }

  .bird-background {
    opacity: 0.15;
    object-fit: cover;
  }

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