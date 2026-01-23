// src/components/admin/AdminDashboard.tsx
import React, { useState } from 'react';
import { apiFetch } from '../api/auth.service';

export const AdminDashboard = () => {
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);

   // En AdminDashboard.tsx, cambia la función handleGenerateCode:
// BUSCA ESTA FUNCIÓN EN TU AdminDashboard.tsx
const handleGenerateCode = async () => {
    try {
        const response = await apiFetch('/auth/admin/generate-teacher-code', { 
            method: 'POST' 
        });

        // Validamos si la respuesta es correcta (status 200)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            alert("Error del servidor: " + (errorData.error || "No se pudo generar"));
            return;
        }

        const data = await response.json();
        
        if (data.code) {
            setGeneratedCode(data.code); 
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Error de conexión con el servidor");
    }
};

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
                <h2 className="text-xl font-semibold mb-4">Invitación para Profesores</h2>
                <p className="text-gray-600 mb-4">
                    Genera un código único para que un nuevo docente pueda registrarse.
                </p>
                
                <button 
                    onClick={handleGenerateCode}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Generando...' : 'Generar Código de Profesor'}
                </button>

                {generatedCode && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-center">
                        <span className="text-sm text-green-700 block mb-1">Código generado:</span>
                        <strong className="text-2xl tracking-widest text-green-800">{generatedCode}</strong>
                        <button 
                            onClick={() => navigator.clipboard.writeText(generatedCode)}
                            className="block w-full mt-2 text-xs text-blue-600 underline"
                        >
                            Copiar código
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};