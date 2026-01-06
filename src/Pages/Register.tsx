// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth.service';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    password: '',
    cedula: '',
    registrationCode: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !form.fullName ||
      !form.username ||
      !form.password ||
      !form.cedula
    ) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);

      await register({
        fullName: form.fullName,
        username: form.username,
        password: form.password,
        cedula: form.cedula,
        registrationCode: form.registrationCode || undefined,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Registro</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Nombre completo"
          className="w-full p-2 border mb-2"
          onChange={handleChange}
        />

        <input
          type="email"
          name="username"
          placeholder="Correo electrónico"
          className="w-full p-2 border mb-2"
          onChange={handleChange}
        />

        <input
          type="text"
          name="cedula"
          placeholder="Cédula (10 dígitos)"
          className="w-full p-2 border mb-2"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="w-full p-2 border mb-2"
          onChange={handleChange}
        />

        <input
          type="text"
          name="registrationCode"
          placeholder="Código de registro (opcional)"
          className="w-full p-2 border mb-4"
          onChange={handleChange}
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}
