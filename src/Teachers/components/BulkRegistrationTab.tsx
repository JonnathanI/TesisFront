import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- INTERFACES ---
interface BulkUserItem {
    fullName: string;
    email: string;
    password?: string;
}

interface BulkRegistrationError {
    email: string;
    message: string;
}

interface BulkRegisterResponse {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    errors: BulkRegistrationError[];
}

interface StudentEntry extends BulkUserItem {
    id: string;
}

// --- ICONOS ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

export default function BulkRegistrationTab() {
    const [inputText, setInputText] = useState("");
    const [studentsToRegister, setStudentsToRegister] = useState<StudentEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<BulkRegisterResponse | null>(null);

    // Lógica para procesar el texto pegado
    const handleParseText = () => {
        if (!inputText.trim()) return;
        
        const lines = inputText.split("\n");
        const newStudents: StudentEntry[] = [];

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
            
            const parts = trimmedLine.split(",").map(p => p.trim());
            if (parts.length >= 2) {
                newStudents.push({
                    id: Math.random().toString(36).substring(2, 9),
                    fullName: parts[0],
                    email: parts[1],
                    password: parts[2] || "temporal123"
                });
            }
        });

        setStudentsToRegister([...studentsToRegister, ...newStudents]);
        setInputText("");
    };

    const handleRemoveStudent = (id: string) => {
        setStudentsToRegister(prev => prev.filter(s => s.id !== id));
    };

    const handleBulkSubmit = async () => {
        if (studentsToRegister.length === 0) return;
        
        setIsLoading(true);
        setResults(null);
        
        try {
            const token = localStorage.getItem('jwt-token');
            const payload = {
                students: studentsToRegister.map(s => ({
                    fullName: s.fullName,
                    email: s.email,
                    password: s.password
                }))
            };

            const response = await fetch('http://localhost:8081/api/auth/register-bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const data: BulkRegisterResponse = await response.json();
            setResults(data);
            
            if (data.failureCount === 0) {
                setStudentsToRegister([]);
            }
        } catch (error) {
            console.error("Error en registro masivo:", error);
            alert("No se pudo conectar con el servidor. Verifique su conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '1rem', color: 'white' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1cb0f6', marginBottom: '1rem' }}>
                <UsersIcon /> Carga Masiva de Alumnos
            </h2>
            
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
                Formato: <b>Nombre, Email, Contraseña</b> (uno por línea)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* ÁREA DE TEXTO */}
                <div style={{ background: '#1f2a30', padding: '1.5rem', borderRadius: '1rem', border: '2px solid #2c363a' }}>
                    <textarea
                        placeholder="Juan Perez, juan@mail.com, pass123"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        style={{
                            width: '100%', height: '200px', background: '#131f24', color: 'white',
                            border: '2px solid #2c363a', borderRadius: '0.8rem', padding: '1rem',
                            fontFamily: 'monospace', resize: 'none'
                        }}
                    />
                    <button 
                        onClick={handleParseText}
                        disabled={!inputText.trim()}
                        style={{
                            marginTop: '1rem', width: '100%', padding: '0.8rem', borderRadius: '0.8rem',
                            border: 'none', background: inputText.trim() ? '#58cc02' : '#3c4d55',
                            color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}
                    >
                        <UploadIcon /> Previsualizar
                    </button>
                </div>

                {/* VISTA PREVIA */}
                <div style={{ background: '#1f2a30', padding: '1.5rem', borderRadius: '1rem', border: '2px solid #2c363a', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginTop: 0 }}>Listado a procesar ({studentsToRegister.length})</h3>
                    <div style={{ flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
                        {studentsToRegister.map((s) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #2c363a' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem' }}>{s.fullName}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{s.email}</div>
                                </div>
                                <button onClick={() => handleRemoveStudent(s.id)} style={{ background: 'none', border: 'none', color: '#ff4b4b', cursor: 'pointer' }}>
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={handleBulkSubmit}
                        disabled={studentsToRegister.length === 0 || isLoading}
                        style={{
                            marginTop: '1rem', width: '100%', padding: '1rem', borderRadius: '0.8rem',
                            border: 'none', background: '#1cb0f6', color: 'white', fontWeight: 'bold',
                            cursor: 'pointer', opacity: (studentsToRegister.length === 0 || isLoading) ? 0.5 : 1
                        }}
                    >
                        {isLoading ? "Registrando..." : "Registrar Todo"}
                    </button>
                </div>
            </div>

            {/* RESULTADOS */}
            <AnimatePresence>
                {results && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '2rem', padding: '1rem', background: '#131f24', borderRadius: '1rem', border: '2px solid #2c363a' }}>
                        <h3>Resultados: {results.successCount} éxitos / {results.failureCount} fallos</h3>
                        {results.errors.map((err, i) => (
                            <div key={i} style={{ color: '#ff4b4b', fontSize: '0.8rem' }}>• {err.email}: {err.message}</div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}