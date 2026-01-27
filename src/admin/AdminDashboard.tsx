import React, { useState, useEffect } from 'react';
import { AdminSidebarDashboard } from './AdminSidebarDashboard';
import { generateClassroomCode, generateTeacherRegistrationCode } from '../api/auth.service';

export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('estudiantes');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Estados para Generación de Código
  const [maxUses, setMaxUses] = useState<number>(30);
  const [expirationDate, setExpirationDate] = useState<string>('');

  // --- LÓGICA DE CARGA MASIVA ---
  const [rolDestino, setRolDestino] = useState('PROFESOR');
  const [vinculo, setVinculo] = useState('');
  // Estado para las filas dinámicas
  const [rows, setRows] = useState([
    { id: Date.now(), nombre: '', correo: '', password: '', cedula: '' }
  ]);

  useEffect(() => {
    setGeneratedCode(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setExpirationDate(tomorrow.toISOString().split('T')[0]);
  }, [activeSection]);

  // Funciones para manejar las filas
  const addRow = () => {
    setRows([...rows, { id: Date.now(), nombre: '', correo: '', password: '', cedula: '' }]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: number, field: string, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const code = activeSection === 'estudiantes' 
        ? await generateClassroomCode() 
        : await generateTeacherRegistrationCode();
      setGeneratedCode(code);
    } catch (error) {
      alert("Error al generar el código");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (activeSection === 'carga') {
      return (
        <div style={cardFullStyle}>
          <h2 style={{ ...mainTitleStyle, textAlign: 'left' }}>Carga Masiva</h2>
          <p style={{ ...subtitleStyle, textAlign: 'left' }}>Importación de usuarios a la base de datos</p>

          {/* Selectores Superiores */}
          <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={boldLabelStyle}>Rol de Destino</label>
              <select value={rolDestino} onChange={(e) => setRolDestino(e.target.value)} style={selectInlineStyle}>
                <option value="PROFESOR">PROFESOR</option>
                <option value="ESTUDIANTE">ESTUDIANTE</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={boldLabelStyle}>Vínculo</label>
              <input 
                type="text" 
                placeholder="Ej: AULA-123" 
                value={vinculo}
                onChange={(e) => setVinculo(e.target.value)}
                style={inputInlineStyle} 
              />
            </div>
          </div>

          {/* Renderizado de Filas Dinámicas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {rows.map((row, index) => (
              <div key={row.id} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <div style={inputGroupStyle}>
                  {index === 0 && <label style={miniLabelStyle}>NOMBRE</label>}
                  <input 
                    type="text" 
                    placeholder="Nombre" 
                    style={modernInputStyle} 
                    value={row.nombre}
                    onChange={(e) => updateRow(row.id, 'nombre', e.target.value)}
                  />
                </div>
                <div style={inputGroupStyle}>
                  {index === 0 && <label style={miniLabelStyle}>CORREO</label>}
                  <input 
                    type="email" 
                    placeholder="Email" 
                    style={modernInputStyle} 
                    value={row.correo}
                    onChange={(e) => updateRow(row.id, 'correo', e.target.value)}
                  />
                </div>
                <div style={inputGroupStyle}>
                  {index === 0 && <label style={miniLabelStyle}>CONTRASEÑA</label>}
                  <input 
                    type="password" 
                    placeholder="***" 
                    style={modernInputStyle} 
                    value={row.password}
                    onChange={(e) => updateRow(row.id, 'password', e.target.value)}
                  />
                </div>
                <div style={inputGroupStyle}>
                  {index === 0 && <label style={miniLabelStyle}>CÉDULA</label>}
                  <input 
                    type="text" 
                    placeholder="ID" 
                    style={modernInputStyle} 
                    value={row.cedula}
                    onChange={(e) => updateRow(row.id, 'cedula', e.target.value)}
                  />
                </div>
                
                {/* Botones de acción lateral */}
                <div style={{ display: 'flex', gap: '10px', paddingBottom: '5px' }}>
                  <button onClick={addRow} style={circleAddBtn}>+</button>
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(row.id)} style={circleRemoveBtn}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button 
            style={bulkActionBtn}
            onClick={() => console.log("Enviando datos:", { rolDestino, vinculo, usuarios: rows })}
          >
            EJECUTAR REGISTRO MASIVO
          </button>
        </div>
      );
    }

    const isStudent = activeSection === 'estudiantes';
    return (
      <div style={cardCenterStyle}>
        <div style={{ fontSize: '60px', marginBottom: '10px' }}>{isStudent ? '🔑' : '🎓'}</div>
        <h3 style={mainTitleStyle}>CONFIGURACIÓN DE CÓDIGO</h3>
        <p style={subtitleStyle}>Control de acceso para {activeSection}</p>

        <div style={formContainerStyle}>
          <div style={configRowStyle}>
            <div style={inputGroupStyle}>
              <label style={boldLabelStyle}>Límite de Registros</label>
              <input 
                type="number" 
                value={maxUses} 
                onChange={(e) => setMaxUses(Number(e.target.value))} 
                style={modernInputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={boldLabelStyle}>Fecha de Expiración</label>
              <input 
                type="date" 
                value={expirationDate} 
                onChange={(e) => setExpirationDate(e.target.value)} 
                style={modernInputStyle}
              />
            </div>
          </div>

          {generatedCode && (
            <div style={codeBoxDisplay}>
              <small style={{ display: 'block', fontSize: '11px', color: '#888', fontWeight: 700, marginBottom: '8px' }}>
                CÓDIGO GENERADO EXITOSAMENTE
              </small>
              {generatedCode}
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '10px', fontWeight: 600 }}>
                Válido hasta el {expirationDate.split('-').reverse().join('/')} para {maxUses} {isStudent ? 'alumnos' : 'profesores'}.
              </div>
            </div>
          )}

          <button 
            onClick={handleGenerate} 
            disabled={loading} 
            style={{
              ...executeBtnStyle,
              backgroundColor: loading ? '#ccc' : (isStudent ? '#ffc800' : '#1cb0f6'),
              boxShadow: loading ? 'none' : (isStudent ? '0 5px 0 0 #e5a400' : '0 5px 0 0 #1899d6'),
            }}
          >
            {loading ? 'GENERANDO...' : 'GENERAR CÓDIGO'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7f8', fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebarDashboard activeSection={activeSection} setActiveSection={setActiveSection} />
      <main style={{ flex: 1, marginLeft: '260px', padding: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1100px' }}>{renderContent()}</div>
      </main>
    </div>
  );
};

// --- ESTILOS ---

const cardCenterStyle: React.CSSProperties = { 
  backgroundColor: '#fff', padding: '50px', borderRadius: '35px', 
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' 
};

const cardFullStyle: React.CSSProperties = {
  backgroundColor: '#fff', padding: '50px', borderRadius: '35px',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', width: '100%'
};

const modernInputStyle = {
  width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #ddd',
  fontSize: '14px', fontWeight: 500, outline: 'none', backgroundColor: '#fff', color: '#333'
};

const selectInlineStyle = {
  padding: '8px 12px', borderRadius: '8px', border: '1px solid #333',
  fontSize: '14px', fontWeight: 700, cursor: 'pointer', outline: 'none'
};

const inputInlineStyle = {
  padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc',
  fontSize: '14px', outline: 'none'
};

const mainTitleStyle = { fontSize: '32px', fontWeight: 900, color: '#000', margin: '0' };
const subtitleStyle = { color: '#888', fontSize: '15px', marginBottom: '30px' };
const boldLabelStyle = { fontWeight: 800, fontSize: '15px', color: '#000' };
const miniLabelStyle = { fontWeight: 800, fontSize: '11px', color: '#999', marginBottom: '8px' };

const inputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', flex: 1 };
const configRowStyle: React.CSSProperties = { display: 'flex', gap: '20px', marginBottom: '30px', width: '100%' };
const formContainerStyle: React.CSSProperties = { width: '100%', maxWidth: '550px' };

const circleAddBtn: React.CSSProperties = {
  width: '32px', height: '32px', borderRadius: '50%', border: 'none',
  backgroundColor: '#1cb0f6', color: '#fff', fontSize: '20px', fontWeight: 'bold',
  cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const circleRemoveBtn: React.CSSProperties = {
  width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #ff4b4b',
  backgroundColor: 'transparent', color: '#ff4b4b', fontSize: '14px',
  cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const bulkActionBtn: React.CSSProperties = {
  marginTop: '40px', padding: '16px 30px', borderRadius: '12px', border: 'none',
  backgroundColor: '#4B4B4B', color: '#fff', fontWeight: 800, fontSize: '14px',
  cursor: 'pointer', boxShadow: '0 4px 0 0 #222'
};

const codeBoxDisplay: React.CSSProperties = {
  backgroundColor: '#f0f9ff', padding: '30px', borderRadius: '24px', 
  border: '3px dashed #1cb0f6', color: '#1cb0f6', fontSize: '40px', 
  fontWeight: 900, marginBottom: '30px', textAlign: 'center', letterSpacing: '5px'
};

const executeBtnStyle = { 
  width: '100%', padding: '18px', borderRadius: '18px', border: 'none', 
  color: '#fff', fontWeight: 900, fontSize: '17px', cursor: 'pointer'
};