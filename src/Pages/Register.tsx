import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register } from "../api/auth.service";

// ===== COLORES =====
const COLOR_PRIMARY_BLUE = "#278DCE";
const COLOR_SECONDARY_YELLOW = "#FFD700";
const COLOR_BG_LIGHT = "#E5E6E6";
const COLOR_CARD_BG = "rgba(255, 255, 255, 0.95)";
const COLOR_TEXT_DARK = "#4A4A4A";
const COLOR_ERROR = "#ff4d4f";
const COLOR_SUCCESS = "#52c41a";

// ===== VALIDADORES =====
const validators = {
  fullName: (v: string) => {
    if (!v.trim()) return "El nombre es obligatorio";
    return null; // El bloqueo en handleChange ya asegura que solo haya letras
  },
  username: (v: string) => {
    if (!v.trim()) return "El correo es obligatorio";
    if (!v.includes("@")) return "El correo debe incluir un '@'";
    if (!v.includes(".")) return "El correo debe incluir un dominio (punto)";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(v) ? null : "Formato de correo no válido";
  },
  cedula: (v: string) => {
    if (!v.trim()) return "La cédula es obligatoria";
    return v.length === 10 ? null : "Debe tener exactamente 10 dígitos";
  },
  password: (v: string) => {
    if (!v.trim()) return "La contraseña es obligatoria";
    return v.length >= 6 ? null : "Mínimo 6 caracteres";
  },
  registrationCode: (v: string) => null, // Opcional
};

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    cedula: "",
    registrationCode: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = "poppins-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap";
      document.head.appendChild(link);
    }
    document.body.style.margin = "0";
    document.body.style.backgroundColor = COLOR_BG_LIGHT;
    document.body.style.color = COLOR_TEXT_DARK;
    document.body.style.fontFamily = "'Poppins', sans-serif";
  }, []);

  const styles = useMemo(() => ({
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative" as const,
      padding: 24,
    },
    logoText: {
      position: "absolute" as const,
      left: 40,
      top: 30,
      fontSize: 32,
      fontWeight: 900,
      color: COLOR_PRIMARY_BLUE,
      textShadow: `2px 2px 0 ${COLOR_SECONDARY_YELLOW}`,
      cursor: "pointer",
    },
    card: {
      background: COLOR_CARD_BG,
      borderRadius: 25,
      padding: "64px 48px",
      width: 520,
      maxWidth: "95%",
      textAlign: "center" as const,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
    title: { fontSize: "2.6rem", fontWeight: 900, color: COLOR_PRIMARY_BLUE, margin: 0 },
    subtitle: { marginBottom: 30, fontSize: "1.1rem" },
    inputWrapper: {
      position: "relative" as const,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      marginBottom: 18,
      width: "100%",
    },
    input: (field: string) => ({
      width: "90%",
      padding: "18px 20px",
      borderRadius: 20,
      border: `2px solid ${
        touched[field]
          ? fieldErrors[field] ? COLOR_ERROR : COLOR_SUCCESS
          : COLOR_SECONDARY_YELLOW
      }`,
      fontSize: "1.1rem",
      textAlign: "center" as const,
      transition: "border 0.3s",
      outline: "none"
    }),
    hintBox: {
      position: "absolute" as const,
      right: -230,
      top: "50%",
      transform: "translateY(-50%)",
      width: 210,
      padding: "10px 14px",
      background: "#fff3cd",
      color: "#856404",
      borderRadius: 12,
      fontSize: "0.85rem",
      fontWeight: 700,
      boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
    },
    strengthBar: {
      width: "90%",
      height: 8,
      borderRadius: 10,
      background: "#ddd",
      overflow: "hidden",
      marginTop: 8,
    },
    strengthFill: (score: number) => ({
      height: "100%",
      width: `${score * 25}%`,
      background: score <= 1 ? "#ff4d4f" : score === 2 ? "#faad14" : "#52c41a",
      transition: "0.3s",
    }),
    error: { color: COLOR_ERROR, fontWeight: 700, marginBottom: 10 },
    button: {
      width: "90%",
      padding: 18,
      fontSize: "1.2rem",
      fontWeight: 900,
      borderRadius: 50,
      background: COLOR_SECONDARY_YELLOW,
      cursor: "pointer",
      border: "none",
      marginTop: 10,
    },
    link: {
      color: COLOR_PRIMARY_BLUE,
      cursor: "pointer",
      fontWeight: 800,
      marginTop: 20,
      display: "block",
    },
  }), [fieldErrors, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // --- BLOQUEO DE TECLADO ---
    if (name === "fullName") {
      // Bloquea números y especiales (solo letras y espacios)
      filteredValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "");
    }

    if (name === "cedula") {
      // Bloquea letras y limita a 10 dígitos
      filteredValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "username") {
        // Correo no puede tener espacios
        filteredValue = value.replace(/\s/g, "");
    }

    setForm((p) => ({ ...p, [name]: filteredValue }));
    
    // Validación en tiempo real sobre el valor filtrado
    const errorMsg = validators[name as keyof typeof validators](filteredValue);
    setFieldErrors((p) => ({ ...p, [name]: errorMsg }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const errorMsg = validators[name as keyof typeof validators](value);
    setFieldErrors((p) => ({ ...p, [name]: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;
    (Object.keys(form) as Array<keyof typeof form>).forEach(key => {
        const err = validators[key](form[key]);
        if(err) hasErrors = true;
        newErrors[key] = err;
    });

    setFieldErrors(newErrors);
    setTouched({ fullName: true, username: true, cedula: true, password: true, registrationCode: true });

    if (hasErrors) {
      setError("Por favor corrige los errores.");
      return;
    }

    try {
      setLoading(true);
      await register(form);
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.logoText} onClick={() => navigate("/")}>Europeek</div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <h1 style={styles.title}>Crear cuenta</h1>
          <p style={styles.subtitle}>Regístrate y comienza a aprender inglés</p>

          {(["fullName", "username", "cedula", "password", "registrationCode"] as const).map((field) => (
            <div key={field} style={styles.inputWrapper}>
              <input
                style={styles.input(field)}
                type={field === "password" ? "password" : "text"}
                name={field}
                placeholder={
                  field === "fullName" ? "Nombre completo" :
                  field === "username" ? "Correo electrónico" :
                  field === "cedula" ? "Cédula" :
                  field === "password" ? "Contraseña" : "Código de registro"
                }
                value={form[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
                maxLength={field === "cedula" ? 10 : undefined}
              />

              {touched[field] && fieldErrors[field] && (
                <div style={styles.hintBox}>{fieldErrors[field]}</div>
              )}

              {field === "password" && form.password && (
                <div style={styles.strengthBar}>
                  <div style={styles.strengthFill(getPasswordStrength(form.password))} />
                </div>
              )}
            </div>
          ))}

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <span style={styles.link} onClick={() => navigate("/login")}>
            ¿Ya tienes cuenta? Inicia sesión
          </span>
        </form>
      </motion.div>
    </div>
  );
}