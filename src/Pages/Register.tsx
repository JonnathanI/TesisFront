import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register as registerAPI } from "../api/auth.service";

const VOCABULARY: string[] = ["Hello", "World", "Book", "School", "Seven", "One", "Apple", "Blue", "Ten", "Learn", "English", "Success"];
const RAIN_ICONS: string[] = ["🌟", "🚀", "💡", "🧠", "🔥", "🌈", "📚", "🎯", "🌍", "✨"];

export default function Register() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    cedula: "",
    registrationCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    return s;
  }, [form.password]);

  const memoizedVocab = useMemo(() => {
    return VOCABULARY.map((word, i) => {
      const types = ["rain", "float", "bounce"];
      const type = types[i % types.length];
      return {
        id: i,
        word,
        type,
        left: `${Math.random() * 85 + 5}%`,
        top: `${Math.random() * 80 + 10}%`,
        fontSize: `${14 + Math.random() * 10}px`,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * -10,
      };
    });
  }, []);

  const memoizedIcons = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      icon: RAIN_ICONS[Math.floor(Math.random() * RAIN_ICONS.length)],
      left: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 7,
      delay: Math.random() * -10
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (form.password.length < 8) throw new Error("Mínimo 8 caracteres");
      if (form.cedula.length !== 10) throw new Error("Cédula debe tener 10 dígitos");
      const codeTrimmed = form.registrationCode.trim();
      const payload = {
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        cedula: form.cedula.trim(),
        adminCode: codeTrimmed === "supersecreto123" ? codeTrimmed : null,
        registrationCode: codeTrimmed !== "supersecreto123" ? (codeTrimmed || null) : null,
      };
      await registerAPI(payload as any);
      alert("¡Registro exitoso!");
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* SECCIÓN IZQUIERDA: EUROPEEK + BIENVENIDOS */}
      <div style={styles.leftSection}>
        {memoizedVocab.map((item) => (
          <div
            key={item.id}
            className={`word-anim-${item.type}`}
            style={{
              left: item.left,
              top: item.type === "rain" ? "-100px" : item.top,
              fontSize: item.fontSize,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
            }}
          >
            {item.word}
          </div>
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.brandContent}>
          <h1 style={styles.brandLogo}>EUROPEEK</h1>
          
          {/* Badge Amarillo actualizado */}
          <div style={styles.brandBadge}>BIENVENIDOS</div>
          
          <p style={styles.brandTagline}>¡Tu aventura comienza aquí! 🚀</p>
        </motion.div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div style={styles.rightSection}>
        <div style={styles.rainContainer}>
          {memoizedIcons.map((item) => (
            <motion.div
              key={item.id}
              className="falling-icon"
              style={{
                left: item.left,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
                fontSize: "24px", opacity: 0.15
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={styles.card}>
          <h2 style={styles.title}>Crear Perfil</h2>
          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre Completo</label>
              <input className="custom-input" style={styles.input} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input className="custom-input" style={styles.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Cédula</label>
              <input className="custom-input" style={styles.input} maxLength={10} value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} required />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input className="custom-input" style={styles.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <div style={styles.strengthBarContainer}>
                <motion.div
                  animate={{ 
                    width: `${(passwordStrength / 3) * 100}%`,
                    backgroundColor: passwordStrength === 3 ? "#58cc02" : passwordStrength === 2 ? "#ffc107" : "#ff4b4b"
                  }}
                  style={styles.strengthBar}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Código de Invitación</label>
              <input className="custom-input-special" style={styles.specialInput} value={form.registrationCode} onChange={e => setForm({...form, registrationCode: e.target.value})} />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03, backgroundColor: "#ffdf33" }}
              whileTap={{ scale: 0.97 }}
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "REGISTRANDO..." : "EMPEZAR MI AVENTURA"}
            </motion.button>
          </form>

          <button onClick={() => navigate("/login")} style={styles.secondaryButton}>
            ¿YA TIENES CUENTA? <strong>INICIA SESIÓN</strong>
          </button>
        </motion.div>
      </div>

      <style>{`
        @keyframes animRain {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        .word-anim-rain { position: absolute; color: white; font-weight: 800; pointer-events: none; animation: animRain linear infinite; }
        @keyframes animFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(10px, -20px); opacity: 0.6; }
        }
        .word-anim-float { position: absolute; color: white; font-weight: 800; pointer-events: none; animation: animFloat ease-in-out infinite; }
        @keyframes animBounce {
          0%, 100% { transform: translateY(0); animation-timing-function: ease-out; opacity: 0.4; }
          50% { transform: translateY(-50px); animation-timing-function: ease-in; opacity: 0.7; }
        }
        .word-anim-bounce { position: absolute; color: white; font-weight: 800; pointer-events: none; animation: animBounce infinite; }
        .falling-icon { position: absolute; top: -50px; animation: animRain linear infinite; }
        .custom-input:focus { border-color: #1cb0f6 !important; box-shadow: 0 0 0 4px rgba(28, 176, 246, 0.1) !important; outline: none; }
      `}</style>
    </div>
  );
}

const styles: any = {
  pageWrapper: { display: "flex", height: "100vh", overflow: "hidden", fontFamily: '"Quicksand", sans-serif' },
  leftSection: {
    flex: 1.2, position: "relative", background: "linear-gradient(135deg, #1cb0f6 0%, #168dbd 100%)",
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
  },
  brandContent: { zIndex: 10, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  brandLogo: { fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 900, letterSpacing: "-4px", margin: 0, textShadow: "0 5px 15px rgba(0,0,0,0.1)" },
  brandBadge: { background: "#FFD700", color: "#4b4b4b", padding: "12px 40px", borderRadius: "50px", fontWeight: 900, marginTop: "15px", boxShadow: "0 6px 0 #d4b600", fontSize: "22px", letterSpacing: "1px" },
  brandTagline: { maxWidth: "400px", marginTop: "30px", fontSize: "22px", fontWeight: 600 },
  rightSection: { flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" },
  rainContainer: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" },
  card: { zIndex: 10, background: "#ffffff", padding: "40px", borderRadius: "35px", width: "90%", maxWidth: "440px", boxShadow: "0 20px 40px rgba(0,0,0,0.06)", border: "2px solid #cbd5e0" },
  title: { textAlign: "center", fontSize: "28px", fontWeight: 900, color: "#1a202c", marginBottom: "20px" },
  errorBox: { color: "#e53e3e", background: "#fff5f5", padding: "12px", borderRadius: "12px", marginBottom: "15px", fontSize: "14px", border: "1px solid #feb2b2", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "14px", fontWeight: 700, color: "#4a5568", marginLeft: "4px" },
  input: { width: "100%", padding: "14px 18px", borderRadius: "15px", border: "2px solid #cbd5e0", fontSize: "15px", background: "#f8fafc", boxSizing: "border-box", fontWeight: 600 },
  specialInput: { width: "100%", padding: "14px 18px", borderRadius: "15px", border: "2px dashed #1cb0f6", fontSize: "15px", background: "#f0f9ff", color: "#1cb0f6", fontWeight: 700, boxSizing: "border-box", outline: "none" },
  strengthBarContainer: { height: "6px", background: "#e2e8f0", borderRadius: "10px", marginTop: "4px", overflow: "hidden" },
  strengthBar: { height: "100%", borderRadius: "10px" },
  button: { marginTop: "15px", padding: "18px", borderRadius: "18px", background: "#FFD700", border: "none", color: "#4b4b4b", fontSize: "16px", fontWeight: 900, cursor: "pointer", boxShadow: "0 6px 0 #d4b600" },
  secondaryButton: { marginTop: "20px", background: "none", border: "none", color: "#1cb0f6", fontWeight: 600, cursor: "pointer", fontSize: "14px", width: "100%" },
};