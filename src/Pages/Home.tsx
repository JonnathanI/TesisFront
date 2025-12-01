import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeIngles() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          height: 100%;
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        body {
          background: linear-gradient(135deg, #1a1a1a, #0f0f0f, #2a2a2a, #1f1f1f);
          background-size: 400% 400%;
          animation: backgroundMove 20s ease infinite;
          color: white;
        }

        @keyframes backgroundMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .home-container { display: flex; flex-direction: column; min-height: 100vh; }

        .header { width: 100%; display: flex; justify-content: center; align-items: center; padding: 25px 40px; }

        .hero { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0 20px; position: relative; }

        .hero h1 {
          font-size: 64px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 20px;
          text-transform: uppercase;
          position: relative;
          color: #00ffff;
          text-shadow: 
            0 0 5px #00ffff,
            0 0 10px #00aaff,
            0 0 20px #00ffff,
            0 0 30px #00aaff;
          animation: glowText 1.5s infinite alternate;
        }

        .hero h1 span {
          color: #ffdd00;
          text-shadow: 0 0 10px #ffdd00, 0 0 20px #ffaa00, 0 0 30px #ffcc00;
        }

        .hero h1::before, .hero h1::after {
          content: "🇬🇧";
          font-size: 48px;
          position: absolute;
          top: -20px;
          animation: iconMove 2s infinite alternate;
        }
        .hero h1::after {
          content: "🇺🇸";
          right: -60px;
        }
        .hero h1::before { left: -60px; }

        @keyframes glowText {
          0% { text-shadow: 0 0 5px #00ffff,0 0 10px #00aaff,0 0 20px #00ffff; }
          50% { text-shadow: 0 0 10px #00ffff,0 0 20px #00aaff,0 0 30px #00ffff; }
          100% { text-shadow: 0 0 5px #00ffff,0 0 10px #00aaff,0 0 20px #00ffff; }
        }

        @keyframes iconMove {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-10px); opacity: 0.8; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .hero p { font-size: 20px; opacity: 0.9; margin-bottom: 40px; max-width: 700px; animation: fadeUp 1.5s ease forwards; }

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
        }

        .btn-login {
          background: rgba(255,255,255,0.15);
          color: #00ffff;
          border: 2px solid #00ffff;
          box-shadow: 0 0 20px rgba(0,255,255,0.5);
          animation: glowLogin 2s infinite alternate;
        }
        .btn-login:hover {
          transform: scale(1.1) translateY(-3px);
          box-shadow: 0 0 35px rgba(0,255,255,0.8);
        }
        @keyframes glowLogin {
          0% { box-shadow: 0 0 15px rgba(0,255,255,0.5); }
          50% { box-shadow: 0 0 25px rgba(0,255,255,0.7); }
          100% { box-shadow: 0 0 15px rgba(0,255,255,0.5); }
        }

        .btn-play {
          background: linear-gradient(270deg, #00ffff, #00aaff, #00ddff, #00ffcc);
          background-size: 600% 600%;
          color: black;
          font-weight: 900;
          box-shadow: 0 0 20px rgba(0,255,255,0.5);
          animation: gradientBtn 4s ease infinite, bounce 2s infinite;
        }
        .btn-play:hover {
          transform: scale(1.15) rotate(-2deg);
          box-shadow: 0 0 45px rgba(0,255,255,0.9);
        }

        @keyframes gradientBtn {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; margin: 60px 0; }

        .card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 25px;
          width: 280px;
          padding: 30px 20px;
          backdrop-filter: blur(15px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          transition: transform 0.5s ease, box-shadow 0.5s ease;
          cursor: pointer;
          animation: fadeIn 2s ease forwards;
        }
        .card:hover { transform: translateY(-20px) scale(1.05); box-shadow: 0 20px 50px rgba(255,255,255,0.35); }
        .card h3 { font-size: 24px; margin-bottom: 10px; color: #00ffff; }
        .card p { font-size: 15px; opacity: 0.85; }

        .footer { text-align: center; padding: 20px; opacity: 0.8; font-size: 14px; }

        @keyframes fadeUp { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

        @media (max-width: 900px) { .hero h1 { font-size: 45px; } .cards { flex-direction: column; align-items: center; } }
      `}</style>

      <div className="home-container">
        <header className="header">
          {/* Logo eliminado */}
        </header>

        <section className="hero">
          <h1>
            Aprende <span>Inglés</span> jugando <br /> y conquista el mundo 🌍
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
