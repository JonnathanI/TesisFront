// src/Pages/Register.tsx (o donde lo tengas)
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { register as registerAPI } from "../api/auth.service";

const VOCABULARY: string[] = [
  "Hello",
  "World",
  "Book",
  "School",
  "Seven",
  "One",
  "Apple",
  "Blue",
  "Ten",
  "Learn",
  "English",
  "Success",
];

const RAIN_ICONS: string[] = [
  "🌟",
  "🚀",
  "💡",
  "🧠",
  "🔥",
  "🌈",
  "📚",
  "🎯",
  "🌍",
  "✨",
];

// Componente para las burbujas de error
const ValidationBubble = ({ message }: { message: string | null }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={styles.bubble}
      >
        {message}
        <div style={styles.bubbleArrow} />
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Register() {
  const navigate = useNavigate();

  // --- FORM ---
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    cedula: "",
    registrationCode: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  // Fuente global (opcional)
  useEffect(() => {
    const id = "quicksand-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;900&display=swap";
      document.head.appendChild(link);
    }
    document.body.style.margin = "0";
    document.body.style.backgroundColor = "#f8fafc";
  }, []);

  // --- VALIDACIÓN ---
  const validateField = (name: string, value: string) => {
    let errorMessage: string | null = null;

    if (name === "fullName") {
      if (/[0-9]/.test(value)) {
        errorMessage = "No se permiten números";
      } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/.test(value)) {
        errorMessage = "No caracteres especiales";
      }
    }

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        errorMessage = "Email no válido (ej@mail.com)";
      }
    }

    if (name === "cedula") {
      if (value.length > 0 && value.length < 10) {
        errorMessage = "Debe tener 10 dígitos";
      }
    }

    setFieldErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "fullName") {
      sanitizedValue = value.replace(/[0-9!@#$%^&*(),.?":{}|<>]/g, "");
    }
    if (name === "cedula") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm({ ...form, [name]: sanitizedValue });
    validateField(name, sanitizedValue);
  };

  const passwordStrength = useMemo(() => {
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    return s;
  }, [form.password]);

  const memoizedVocab = useMemo(() => {
    return VOCABULARY.map((word, i) => ({
      id: i,
      word,
      type: ["rain", "float", "bounce"][i % 3],
      left: `${Math.random() * 85 + 5}%`,
      top: `${Math.random() * 80 + 10}%`,
      fontSize: `${14 + Math.random() * 10}px`,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * -10,
    }));
  }, []);

  const memoizedIcons = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      icon: RAIN_ICONS[Math.floor(Math.random() * RAIN_ICONS.length)],
      left: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 7,
      delay: Math.random() * -10,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // fuerza validación final
    Object.entries(form).forEach(([k, v]) => validateField(k, v as any));

    if (
      Object.values(fieldErrors).some((err) => err !== null) ||
      form.cedula.length !== 10
    ) {
      alert("Por favor revisa los errores en el formulario");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        cedula: form.cedula.trim(),
        registrationCode: form.registrationCode.trim() || null,
      };

      await registerAPI(payload as any);
      alert("¡Registro exitoso!");
      navigate("/login");
    } catch (err: any) {
      alert(err?.message || "Error registrando");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper} className="pageWrapperResponsive">
      {/* IZQUIERDA */}
      <div style={styles.leftSection} className="leftSectionResponsive">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.brandContent}
        >
          <h1 style={styles.brandLogo}>EUROPEEK</h1>
          <div style={styles.brandBadge}>BIENVENIDOS</div>
          <p style={styles.brandTagline}>¡Tu aventura comienza aquí! 🚀</p>
        </motion.div>
      </div>

      {/* DERECHA */}
      <div style={styles.rightSection} className="rightSectionResponsive">
        <div style={styles.rainContainer}>
          {memoizedIcons.map((item) => (
            <motion.div
              key={item.id}
              className="falling-icon"
              style={{
                left: item.left,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
                fontSize: "24px",
                opacity: 0.15,
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.card}
          className="cardResponsive"
        >
          <h2 style={styles.title}>Crear Perfil</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario</label>
              <input
                name="fullName"
                className="custom-input"
                style={styles.input}
                value={form.fullName}
                onChange={handleInputChange}
                placeholder="Solo letras"
                required
              />
              <ValidationBubble message={fieldErrors.fullName ?? null} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                name="email"
                type="email"
                className="custom-input"
                style={styles.input}
                value={form.email}
                onChange={handleInputChange}
                placeholder="ejemplo@correo.com"
                required
              />
              <ValidationBubble message={fieldErrors.email ?? null} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Cédula</label>
              <input
                name="cedula"
                className="custom-input"
                style={styles.input}
                value={form.cedula}
                onChange={handleInputChange}
                placeholder="Máx 10 dígitos"
                required
              />
              <ValidationBubble message={fieldErrors.cedula ?? null} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input
                name="password"
                type="password"
                className="custom-input"
                style={styles.input}
                value={form.password}
                onChange={handleInputChange}
                required
              />
              <div style={styles.strengthBarContainer}>
                <motion.div
                  animate={{
                    width: `${(passwordStrength / 3) * 100}%`,
                    backgroundColor:
                      passwordStrength === 3
                        ? "#58cc02"
                        : passwordStrength === 2
                        ? "#ffc107"
                        : "#ff4b4b",
                  }}
                  style={styles.strengthBar}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Código de Invitación</label>
              <input
                name="registrationCode"
                className="custom-input-special"
                style={styles.specialInput}
                value={form.registrationCode}
                onChange={handleInputChange}
              />
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
          100% { transform: translateY(110vh); opacity: 0; }
        }
        .word-anim-rain {
          position: absolute;
          color: white;
          font-weight: 800;
          pointer-events: none;
          animation: animRain linear infinite;
        }
        .word-anim-float {
          position: absolute;
          color: white;
          font-weight: 800;
          pointer-events: none;
          animation: animFloat 4s ease-in-out infinite;
        }
        @keyframes animFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(10px, -20px); opacity: 0.6; }
        }
        .word-anim-bounce {
          position: absolute;
          color: white;
          font-weight: 800;
          pointer-events: none;
          animation: animBounce 3s infinite;
        }
        @keyframes animBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-30px); opacity: 0.7; }
        }
        .falling-icon {
          position: absolute;
          top: -50px;
          animation: animRain linear infinite;
        }
        .custom-input:focus {
          border-color: #1cb0f6 !important;
          outline: none;
        }

        /* ✅ RESPONSIVE */
        @media (max-width: 900px){
          .pageWrapperResponsive{
            flex-direction: column;
          }
          .leftSectionResponsive{
            min-height: 260px !important;
            flex: none !important;
          }
          .rightSectionResponsive{
            min-height: auto !important;
            padding: 18px 14px !important;
          }
        }

        /* ✅ MOBILE: ocultamos la izquierda y dejamos solo el formulario */
        @media (max-width: 520px){
          .leftSectionResponsive{
            display: none !important;
          }
          .rightSectionResponsive{
            min-height: 100dvh !important;
            padding: 16px 12px !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .cardResponsive{
            margin-top: 10px;
            border-radius: 22px !important;
            padding: 20px !important;
          }

          /* burbujas: que no se salgan en pantallas pequeñas */
          .cardResponsive .bubble-responsive-fix{
            left: 6px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles: any = {
  pageWrapper: {
    display: "flex",
    minHeight: "100dvh",
    height: "auto",
    overflow: "auto",
    fontFamily: '"Quicksand", sans-serif',
  },

  leftSection: {
    flex: 1.2,
    position: "relative",
    background: "linear-gradient(135deg, #1cb0f6 0%, #168dbd 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: "100dvh",
  },

  brandContent: {
    zIndex: 10,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "0 12px",
  },

  brandLogo: {
    fontSize: "clamp(40px, 8vw, 80px)",
    fontWeight: 900,
    letterSpacing: "-4px",
    margin: 0,
  },

  brandBadge: {
    background: "#FFD700",
    color: "#4b4b4b",
    padding: "12px 40px",
    borderRadius: "50px",
    fontWeight: 900,
    marginTop: "15px",
    boxShadow: "0 6px 0 #d4b600",
    fontSize: "22px",
  },

  brandTagline: {
    maxWidth: "400px",
    marginTop: "30px",
    fontSize: "22px",
    fontWeight: 600,
  },

  rightSection: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    minHeight: "100dvh",
    padding: "24px 16px",
    boxSizing: "border-box",
  },

  rainContainer: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },

  card: {
    zIndex: 10,
    background: "#ffffff",
    padding: "30px",
    borderRadius: "35px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
    border: "2px solid #cbd5e0",
    boxSizing: "border-box",
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    fontWeight: 900,
    color: "#1a202c",
    marginBottom: "15px",
  },

  form: { display: "flex", flexDirection: "column", gap: "8px" },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    position: "relative",
  },

  label: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#4a5568",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    padding: "12px 18px",
    borderRadius: "15px",
    border: "2px solid #cbd5e0",
    fontSize: "15px",
    background: "#f8fafc",
    boxSizing: "border-box",
    fontWeight: 600,
  },

  specialInput: {
    width: "100%",
    padding: "12px 18px",
    borderRadius: "15px",
    border: "2px dashed #1cb0f6",
    fontSize: "15px",
    background: "#f0f9ff",
    color: "#1cb0f6",
    fontWeight: 700,
    boxSizing: "border-box",
    outline: "none",
  },

  strengthBarContainer: {
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "10px",
    marginTop: "2px",
    overflow: "hidden",
  },

  strengthBar: { height: "100%", borderRadius: "10px" },

  button: {
    marginTop: "10px",
    padding: "18px",
    borderRadius: "18px",
    background: "#FFD700",
    border: "none",
    color: "#4b4b4b",
    fontSize: "16px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 6px 0 #d4b600",
  },

  secondaryButton: {
    marginTop: "15px",
    background: "none",
    border: "none",
    color: "#1cb0f6",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
    width: "100%",
  },

  bubble: {
    position: "absolute",
    left: "10px",
    bottom: "-35px",
    backgroundColor: "#ff4b4b",
    color: "white",
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 20,
    boxShadow: "0 4px 10px rgba(255, 75, 75, 0.3)",
    maxWidth: "92%",
  },

  bubbleArrow: {
    position: "absolute",
    top: "-5px",
    left: "15px",
    width: "0",
    height: "0",
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderBottom: "6px solid #ff4b4b",
  },
};
