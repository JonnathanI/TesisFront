import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register } from "../api/auth.service";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Validaciones mínimas
      if (form.password.length < 8) throw new Error("Mínimo 8 caracteres en contraseña");
      if (form.cedula.length !== 10) throw new Error("Cédula debe tener 10 dígitos");

      // 2. Limpieza del Payload para Kotlin
      const payload = {
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        cedula: form.cedula.trim(),
        registrationCode: form.registrationCode.trim() || null,
      };

      await register(payload as any);
      alert("¡Registro exitoso! Ahora inicia sesión.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px", marginBottom: "15px",
    borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" as const
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "white", padding: "40px", borderRadius: "15px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        
        <h2 style={{ textAlign: "center", color: "#278DCE", marginBottom: "20px" }}>Crear Cuenta</h2>

        {error && <div style={{ color: "red", background: "#fee", padding: "10px", borderRadius: "5px", marginBottom: "15px", fontSize: "0.85rem" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input style={inputStyle} placeholder="Nombre Completo" onChange={e => setForm({...form, fullName: e.target.value})} required />
          <input style={inputStyle} type="email" placeholder="Correo Electrónico" onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={inputStyle} placeholder="Cédula" maxLength={10} onChange={e => setForm({...form, cedula: e.target.value})} required />
          <input style={inputStyle} type="password" placeholder="Contraseña (min. 8)" onChange={e => setForm({...form, password: e.target.value})} required />
          <input style={inputStyle} placeholder="Código de Aula (Opcional)" onChange={e => setForm({...form, registrationCode: e.target.value})} />

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "12px", background: "#FFD700", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9rem" }}>
          ¿Ya tienes cuenta? <span style={{ color: "#278DCE", cursor: "pointer", fontWeight: "bold" }} onClick={() => navigate("/login")}>Inicia sesión</span>
        </p>
      </motion.div>
    </div>
  );
}