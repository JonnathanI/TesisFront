import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebarDashboard } from './AdminSidebarDashboard';
import { 
  generateClassroomCode, 
  generateTeacherRegistrationCode, 
  getStudentList, 
  StudentData,
  apiFetch,
  getUserProfile
} from '../api/auth.service';

export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('carga'); // Por defecto en Carga
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<StudentData[]>([]);
  const [filterType, setFilterType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [notification, setNotification] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [studentCode, setStudentCode] = useState('');
  const [teacherRegCode, setTeacherRegCode] = useState('');

  // --- ESTADO PARA CARGA MANUAL DINÁMICA ---
  const [manualUsers, setManualUsers] = useState([
    { name: '', email: '', password: '', idCard: '', role: 'STUDENT' }
  ]);

  useEffect(() => {
    fetchUsers();
    getUserProfile().catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setNotification({ show: true, msg });
    setTimeout(() => setNotification({ show: false, msg: '' }), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getStudentList();
      setUsers(data || []);
    } catch (error) { 
      showToast("❌ Error de conexión");
    } finally { 
      setLoading(false); 
    }
  };

  const addRow = () => {
    setManualUsers([...manualUsers, { name: '', email: '', password: '', idCard: '', role: 'STUDENT' }]);
  };

  const removeRow = (index: number) => {
    if (manualUsers.length > 1) {
      setManualUsers(manualUsers.filter((_, i) => i !== index));
    }
  };

  const handleManualChange = (index: number, field: string, value: string) => {
    const updated = [...manualUsers];
    updated[index] = { ...updated[index], [field]: value };
    setManualUsers(updated);
  };

  const handleBulkSubmit = async () => {
    setLoading(true);
    try {
      await apiFetch('/auth/admin/users/manual-bulk', {
        method: 'POST',
        body: JSON.stringify({ users: manualUsers }),
      });
      showToast("🚀 Registro completado con éxito");
      setManualUsers([{ name: '', email: '', password: '', idCard: '', role: 'STUDENT' }]);
      fetchUsers();
    } catch (error) {
      showToast("❌ Error al registrar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      await apiFetch('/auth/admin/users/bulk-upload', {
        method: 'POST',
        body: formData,
      });
      showToast("🚀 Usuarios cargados con éxito");
      setActiveSection('roles');
      fetchUsers();
    } catch (error) {
      showToast("❌ Error en el archivo");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenCode = async (type: 'student' | 'teacher') => {
    try {
      const code = type === 'student' ? await generateClassroomCode() : await generateTeacherRegistrationCode();
      type === 'student' ? setStudentCode(code) : setTeacherRegCode(code);
      showToast(`✨ Código creado`);
    } catch (e) { showToast("❌ Error al generar"); }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return users.filter(u => {
      const fullName = (u.fullName || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      const cedula = String((u as any).cedula || (u as any).dni || "").toLowerCase();
      const matchesSearch = fullName.includes(term) || username.includes(term) || cedula.includes(term);
      const rawRole = (u.role || "").toUpperCase();
      if (filterType === 'STUDENT') {
        return matchesSearch && (rawRole === "" || rawRole.includes('STUDENT'));
      } else {
        return matchesSearch && (rawRole.includes('TEACHER') || rawRole.includes('PROF'));
      }
    });
  }, [users, searchTerm, filterType]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiFetch(`/auth/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`Asignado como ${newRole} ✨`);
    } catch (error) { showToast("❌ Error de actualización"); }
  };

  return (
    <div style={layoutStyle}>
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0 }} style={toastStyle}>
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <AdminSidebarDashboard activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main style={mainContainerStyle}>
        
        {/* SECCIÓN: CARGA MASIVA */}
        {activeSection === 'carga' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={titleStyle}>Carga Masiva de Usuarios</h2>
            <p style={subtitleStyle}>Importación de usuarios a la base de datos</p>
            
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, color: '#3C3C3C', fontSize: '20px', fontWeight: 800 }}>Listado de nuevos registros</h3>
                <button onClick={addRow} style={btnAddRowStyle}>
                  <span style={{ fontSize: '18px' }}>+</span> Agregar Fila
                </button>
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                <AnimatePresence initial={false}>
                  {manualUsers.map((user, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={rowInputStyle}
                    >
                      <div style={inputGroupStyle}>
                        <label style={labelStyle}>NOMBRE COMPLETO</label>
                        <input 
                          style={inputStyle} 
                          placeholder="Ej: Juan Perez" 
                          value={user.name}
                          onChange={(e) => handleManualChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div style={inputGroupStyle}>
                        <label style={labelStyle}>EMAIL</label>
                        <input 
                          style={inputStyle} 
                          placeholder="correo@ejemplo.com" 
                          value={user.email}
                          onChange={(e) => handleManualChange(index, 'email', e.target.value)}
                        />
                      </div>
                      <div style={inputGroupStyle}>
                        <label style={labelStyle}>CONTRASEÑA</label>
                        <input 
                          style={inputStyle} 
                          type="password"
                          placeholder="********" 
                          value={user.password}
                          onChange={(e) => handleManualChange(index, 'password', e.target.value)}
                        />
                      </div>
                      <div style={inputGroupStyle}>
                        <label style={labelStyle}>CÉDULA/ID</label>
                        <input 
                          style={inputStyle} 
                          placeholder="12345678" 
                          value={user.idCard}
                          onChange={(e) => handleManualChange(index, 'idCard', e.target.value)}
                        />
                      </div>
                      <div style={{ ...inputGroupStyle, flex: '0 0 140px' }}>
                        <label style={labelStyle}>ROL</label>
                        <select 
                          style={selectStyle} 
                          value={user.role}
                          onChange={(e) => handleManualChange(index, 'role', e.target.value)}
                        >
                          <option value="STUDENT">ESTUDIANTE</option>
                          <option value="TEACHER">PROFESOR</option>
                        </select>
                      </div>
                      <button onClick={() => removeRow(index)} style={btnDeleteRowStyle}>🗑️</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div style={footerActionStyle}>
                <button onClick={handleBulkSubmit} disabled={loading} style={btnMainStyle}>
                  {loading ? 'PROCESANDO...' : 'EJECUTAR REGISTRO MASIVO'}
                </button>
                <button onClick={() => fileInputRef.current?.click()} style={btnSecondaryStyle}>
                  SUBIR ARCHIVO (.CSV)
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept=".csv" />
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN: ROLES */}
        {activeSection === 'roles' && (
          <div style={cardStyle}>
            <div style={headerFlexStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={titleStyle}>Usuarios y Roles</h2>
                    <button onClick={fetchUsers} disabled={loading} style={iconBtnStyle}>
                      <motion.span animate={loading ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>🔄</motion.span>
                    </button>
                  </div>
                  <p style={subtitleStyle}>Listado oficial de la plataforma</p>
                </div>
              </div>
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchBarStyle} />
            </div>
            <div style={tabContainerStyle}>
              <button onClick={() => setFilterType('STUDENT')} style={tabButtonStyle(filterType === 'STUDENT')}>📚 ESTUDIANTES</button>
              <button onClick={() => setFilterType('TEACHER')} style={tabButtonStyle(filterType === 'TEACHER')}>👨‍🏫 PROFESORES</button>
            </div>
            <div style={{ marginTop: '20px' }}>
               <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>DATOS DEL USUARIO</th>
                      <th style={thStyle}>CÉDULA / ID</th>
                      <th style={thStyle}>CAMBIAR ROL</th>
                      <th style={thStyle}>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={tdStyleFirst}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ ...avatarStyle, backgroundColor: u.isActive ? '#58CC02' : '#AFB3B6' }}>{u.fullName?.charAt(0) || 'U'}</div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#4B4B4B' }}>{u.fullName}</div>
                              <div style={{ fontSize: '12px', color: '#AFAFAF' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>{(u as any).cedula || '---'}</td>
                        <td style={tdStyle}>
                          <select style={selectStyle} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                            <option value="STUDENT">📚 ESTUDIANTE</option>
                            <option value="TEACHER">👨‍🏫 PROFESOR</option>
                          </select>
                        </td>
                        <td style={tdStyleLast}>
                           <button style={actionBtnStyle(!!u.isActive)}>{u.isActive ? 'BLOQUEAR' : 'ACTIVAR'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* SECCIÓN: GENERAR CÓDIGOS */}
        {activeSection === 'generar' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={titleStyle}>Panel de Accesos</h2>
            <div style={gridCodeStyle}>
              <div style={{ ...codeCardStyle, borderTop: '6px solid #1cb0f6' }}>
                <div style={iconCircleStyle}>📚</div>
                <h3 style={codeCardTitle}>Llave Estudiantes</h3>
                <div style={codeBoxModern}>{studentCode || '••••••'}</div>
                <button onClick={() => handleGenCode('student')} style={btnMainStyle}>GENERAR</button>
              </div>
              <div style={{ ...codeCardStyle, borderTop: '6px solid #ff4b4b' }}>
                <div style={{ ...iconCircleStyle, backgroundColor: '#ff4b4b15' }}>👨‍🏫</div>
                <h3 style={codeCardTitle}>Llave Profesores</h3>
                <div style={{ ...codeBoxModern, color: '#ff4b4b' }}>{teacherRegCode || '••••••'}</div>
                <button onClick={() => handleGenCode('teacher')} style={{ ...btnMainStyle, backgroundColor: '#ff4b4b', boxShadow: '0 4px 0 #d33131' }}>GENERAR</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SISTEMA DE ESTILOS UNIFICADO (DUOLINGO STYLE) ---
const layoutStyle: React.CSSProperties = { display: 'flex', backgroundColor: '#F7F9FA', minHeight: '100vh', fontFamily: '"Nunito", sans-serif' };
const mainContainerStyle: React.CSSProperties = { flex: 1, marginLeft: '260px', padding: '50px' };
const cardStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '2px solid #E5E5E5' };
const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 900, color: '#3C3C3C', marginBottom: '8px' };
const subtitleStyle: React.CSSProperties = { color: '#AFAFAF', fontWeight: 700, marginBottom: '25px', fontSize: '16px' };

const rowInputStyle: React.CSSProperties = { 
  display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#FFF', 
  padding: '18px 20px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #EBEBEB' 
};

const inputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' };
const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 800, color: '#BDBDBD', letterSpacing: '0.8px' };

const inputStyle: React.CSSProperties = { 
  padding: '12px 16px', borderRadius: '14px', border: '2px solid #F0F0F0', 
  backgroundColor: '#FAFAFA', fontSize: '14px', fontWeight: 700, color: '#4B4B4B', outline: 'none', transition: '0.2s'
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'none' };

const btnAddRowStyle: React.CSSProperties = { 
  backgroundColor: '#E1F5FE', color: '#1CB0F6', border: 'none', padding: '10px 20px', 
  borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
};

const footerActionStyle: React.CSSProperties = { display: 'flex', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #F0F0F0' };

const btnMainStyle: React.CSSProperties = { 
  flex: 1, backgroundColor: '#1CB0F6', color: 'white', border: 'none', 
  padding: '16px', borderRadius: '16px', fontWeight: 900, fontSize: '15px', 
  cursor: 'pointer', boxShadow: '0 4px 0 #1899D6', transition: 'transform 0.1s, box-shadow 0.1s' 
};

const btnSecondaryStyle: React.CSSProperties = { 
  flex: 1, backgroundColor: 'white', color: '#AFAFAF', border: '2px solid #E5E5E5', 
  padding: '16px', borderRadius: '16px', fontWeight: 900, fontSize: '15px', cursor: 'pointer' 
};

const btnDeleteRowStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginTop: '18px', opacity: 0.4 };

// Estilos de tabla y otros
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0 20px', fontSize: '11px', fontWeight: 900, color: '#BDBDBD' };
const tdStyleFirst: React.CSSProperties = { padding: '16px 20px', border: '2px solid #E5E5E5', borderRight: 'none', borderRadius: '20px 0 0 20px', backgroundColor: 'white' };
const tdStyle: React.CSSProperties = { padding: '16px 20px', borderTop: '2px solid #E5E5E5', borderBottom: '2px solid #E5E5E5', backgroundColor: 'white', fontWeight: 700, color: '#777' };
const tdStyleLast: React.CSSProperties = { padding: '16px 20px', border: '2px solid #E5E5E5', borderLeft: 'none', borderRadius: '0 20px 20px 0', backgroundColor: 'white' };
const avatarStyle: React.CSSProperties = { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 };
const tabContainerStyle: React.CSSProperties = { display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '2px solid #F0F0F0', paddingBottom: '15px' };
const tabButtonStyle = (active: boolean): React.CSSProperties => ({ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#1cb0f6' : 'transparent', color: active ? 'white' : '#AFAFAF', fontWeight: 900, cursor: 'pointer' });
const searchBarStyle: React.CSSProperties = { padding: '10px 15px', borderRadius: '12px', border: '2px solid #E5E5E5', width: '250px', fontWeight: 700, outline: 'none' };
const headerFlexStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const toastStyle: React.CSSProperties = { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#58CC02', color: 'white', padding: '12px 25px', borderRadius: '15px', fontWeight: 900, zIndex: 1000, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const iconBtnStyle: React.CSSProperties = { backgroundColor: 'white', border: '2px solid #E5E5E5', borderRadius: '12px', width: '38px', height: '38px', cursor: 'pointer' };
const actionBtnStyle = (active: boolean): React.CSSProperties => ({ padding: '8px 15px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '12px', backgroundColor: active ? '#FFF0F0' : '#E8FDF0', color: active ? '#FF4B4B' : '#15A84B', cursor: 'pointer' });
const gridCodeStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' };
const codeCardStyle: React.CSSProperties = { backgroundColor: 'white', padding: '30px', borderRadius: '28px', textAlign: 'center', border: '2px solid #E5E5E5', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const iconCircleStyle: React.CSSProperties = { width: '60px', height: '60px', backgroundColor: '#1cb0f615', borderRadius: '18px', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' };
const codeCardTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 900, color: '#3C3C3C', marginBottom: '15px' };
const codeBoxModern: React.CSSProperties = { width: '100%', backgroundColor: '#F7F9FA', padding: '15px', borderRadius: '15px', fontSize: '28px', fontWeight: 900, color: '#1cb0f6', letterSpacing: '2px', border: '2px dashed #E5E5E5', marginBottom: '20px', fontFamily: 'monospace' };