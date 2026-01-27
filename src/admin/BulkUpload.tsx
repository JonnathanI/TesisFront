import React, { useState } from 'react';
import { registerBulk, BulkRegisterRequest, UserRole } from '../api/auth.service';

export const BulkUpload = () => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [code, setCode] = useState('');
  const [csv, setCsv] = useState('');
  const [loading, setLoading] = useState(false);

const handleBulkSubmit = async () => {
    if (!code || !csv) {
      alert("Por favor completa los campos requeridos.");
      return;
    }
    setLoading(true);

    try {
      const lines = csv.trim().split('\n');
      
      const userItems = lines.map(line => {
        const [fullName, email, password, cedula] = line.split(',').map(item => item?.trim());
        return {
          fullName: fullName || '',
          email: email || '',
          password: password || "Temp123!",
          cedula: cedula || ''
        };
      });

      // Creamos el payload con la llave 'users' que pide el error
      const payload: BulkRegisterRequest = {
        users: userItems, // <-- Esta es la llave que Jackson no encontraba
        registrationCode: code,
        roleToAssign: role
      };

      // Llamamos a la función del servicio
      const result = await registerBulk(payload);

      alert(`✅ ¡Carga completada!\nÉxitos: ${result.successCount}\nErrores: ${result.failureCount}`);
      if (result.successCount > 0) setCsv('');

    } catch (error: any) {
      console.error("Error en carga masiva:", error);
      // Mostramos el mensaje exacto del backend para debug
      alert("Error del servidor: " + error.message);
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="p-10 w-full animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Carga Masiva</h1>
        <p className="text-slate-400 font-bold text-sm tracking-widest mt-2 italic">Importación de usuarios a la base de datos</p>
      </header>

      <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Rol de Destino</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-[#1cb0f6] font-bold text-slate-600 transition-all"
            >
              <option value="STUDENT">ESTUDIANTE</option>
              <option value="TEACHER">PROFESOR</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Código de Vinculación</label>
            <input 
              type="text"
              placeholder="Ej: AULA-123 o PROF-XYZ"
              className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-[#1cb0f6] font-bold"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Listado (Nombre, Email, Contraseña, Cédula)</label>
          <textarea 
            placeholder="Juan Perez, juan@mail.com, pass123, 17263544"
            className="w-full h-48 p-6 rounded-[30px] border-2 border-dashed border-slate-200 bg-slate-50 outline-none focus:border-[#1cb0f6] font-mono text-sm transition-all resize-none"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
        </div>

        <button 
          onClick={handleBulkSubmit}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[4px] hover:bg-[#1cb0f6] transition-all transform active:scale-[0.97] shadow-lg disabled:bg-slate-200"
        >
          {loading ? 'CONECTANDO CON EL SERVIDOR...' : '🚀 EJECUTAR REGISTRO MASIVO'}
        </button>
      </div>
    </div>
  );
};