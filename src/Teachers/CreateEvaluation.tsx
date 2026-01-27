import React, { useState } from 'react';
// Importamos los iconos necesarios
import { FiTrash2, FiPlus, FiSave } from 'react-icons/fi';

// --- SOLUCIÓN AL ERROR TS2786 ---
// Definimos los iconos como 'any' fuera del componente para evitar conflictos de JSX
const IconTrash = FiTrash2 as any;
const IconPlus = FiPlus as any;
const IconSave = FiSave as any;

export const CreateEvaluation = () => {
    // Supongamos que tienes un estado para las preguntas (ajusta según tu lógica real)
    const [questions, setQuestions] = useState<{id: string, text: string}[]>([]);

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const addQuestion = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setQuestions([...questions, { id: newId, text: "Nueva pregunta..." }]);
    };

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm">
            <h2 className="text-2xl font-black mb-6 italic text-slate-800">Crear Evaluación</h2>
            
            <div className="space-y-4 mb-8">
                {questions.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                        <div className="font-bold text-slate-700">
                            {q.text}
                        </div>
                        {/* USO DEL ICONO CORREGIDO */}
                        <button 
                            onClick={() => removeQuestion(q.id)} 
                            className="text-red-400 hover:text-red-600 transition-colors p-2"
                        >
                            <IconTrash size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                {/* BOTÓN AÑADIR CON ICONO CORREGIDO */}
                <button 
                    onClick={addQuestion}
                    className="flex-1 py-4 border-2 border-dashed border-blue-200 text-[#00AEEF] font-black rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                    <IconPlus /> Añadir Pregunta
                </button>

                {/* BOTÓN GUARDAR CON ICONO CORREGIDO */}
                <button 
                    className="flex-1 py-4 bg-[#00AEEF] text-white font-black rounded-2xl shadow-lg shadow-blue-100 hover:bg-[#0096ce] transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                    <IconSave /> Guardar Evaluación
                </button>
            </div>
        </div>
    );
};