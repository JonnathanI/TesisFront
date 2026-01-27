import React, { useState } from 'react';
import * as Icons from 'react-icons/fi';
import { apiFetch } from '../api/auth.service';

// Corregimos el error TS2786 definiendo los iconos como React.ElementType
const FiCopy = Icons.FiCopy as React.ElementType;

export const AdminDashboard = () => {
    // subView alterna entre la lógica de profesor y alumno dentro de la misma pestaña
    const [subView, setSubView] = useState<'teacher' | 'student'>('teacher');
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerateCode = async () => {
        setLoading(true);
        // Endpoint dinámico basado en la sub-vista seleccionada
        const endpoint = subView === 'teacher' 
            ? '/auth/admin/generate-teacher-code' 
            : '/auth/admin/generate-student-code';
            
        try {
            const response = await apiFetch(endpoint, { method: 'POST' });
            const data = await response.json();
            if (data.code) setGeneratedCode(data.code);
        } catch (error) {
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-12 max-w-5xl animate-in fade-in duration-500">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Generar Invitaciones</h1>
                <p className="text-slate-500 font-bold text-sm uppercase mt-2">Crea códigos de acceso único para nuevos usuarios</p>
            </header>

            <div className="bg-white border border-gray-200 rounded-[32px] shadow-sm overflow-hidden">
                {/* Pestañas internas para conmutar entre Roles */}
                <div className="flex border-b border-gray-100 bg-gray-50/30">
                    <button 
                        onClick={() => {setSubView('teacher'); setGeneratedCode('');}}
                        className={`flex-1 py-5 font-black text-[11px] uppercase tracking-widest transition-all ${
                            subView === 'teacher' 
                            ? 'bg-white text-[#00AEEF] border-b-4 border-[#00AEEF]' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Invitación Profesores
                    </button>
                    <button 
                        onClick={() => {setSubView('student'); setGeneratedCode('');}}
                        className={`flex-1 py-5 font-black text-[11px] uppercase tracking-widest transition-all ${
                            subView === 'student' 
                            ? 'bg-white text-[#00AEEF] border-b-4 border-[#00AEEF]' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Invitación Alumnos
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex items-center justify-between gap-8">
                        <div className="max-w-md">
                            <h3 className="text-xl font-black text-slate-700">
                                Generar Token para {subView === 'teacher' ? 'Docente' : 'Estudiante'}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mt-1 leading-relaxed">
                                El sistema creará un código de un solo uso. Una vez utilizado por un 
                                {subView === 'teacher' ? ' profesor ' : ' alumno '} 
                                para registrarse, el token quedará invalidado.
                            </p>
                        </div>
                        <button 
                            onClick={handleGenerateCode}
                            disabled={loading}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#00AEEF] transition-all transform active:scale-95 disabled:bg-gray-200 shadow-lg shadow-slate-200"
                        >
                            {loading ? 'Procesando...' : 'Obtener Código'}
                        </button>
                    </div>

                    {/* Área del resultado */}
                    {generatedCode && (
                        <div className="bg-blue-50 border-2 border-dashed border-[#00AEEF] p-8 rounded-3xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                            <div>
                                <span className="text-[10px] font-black text-[#00AEEF] uppercase tracking-[3px]">Token de Registro:</span>
                                <div className="text-4xl font-mono font-black text-slate-800 mt-1">{generatedCode}</div>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedCode);
                                    alert("¡Código copiado!");
                                }}
                                className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-sm border border-blue-100 text-[#00AEEF] font-black text-xs hover:shadow-md transition-all active:scale-90"
                            >
                                <FiCopy size={18} /> COPIAR CÓDIGO
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Ayuda visual inferior */}
            <div className="mt-8 flex items-center gap-3 text-slate-400 text-xs font-bold italic px-4">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center not-italic">?</span>
                <p>Recuerda que los códigos para profesores suelen empezar con el prefijo configurado en el backend.</p>
            </div>
        </div>
    );
};