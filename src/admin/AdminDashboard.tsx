import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebarDashboard } from './AdminSidebarDashboard';
import { 
  generateClassroomCode, 
  generateTeacherRegistrationCode, 
  getAllUsersAdmin,
  registerBulk, 
  updateUserRole,
  updateUserStatus,
  createCourse,
  updateCourse,
  deleteCourse 
} from '../api/auth.service';
import { StudentData , UserRole } from '../api/auth.types';

// ==========================================
// 1. INTERFACES Y TIPOS
// ==========================================
interface ManualUser {
  fullName: string;
  email: string;
  password?: string;
  cedula: string;
  role: UserRole;
}

interface CoursesProps {
  courses: any[];
  onSelectCourse: (id: string) => void;
  onRefresh: () => void;
}

// ==========================================
// 2. SUB-COMPONENTE: GESTIÓN DE CURSOS
// ==========================================
const CoursesSection = ({ courses, onSelectCourse, onRefresh }: CoursesProps) => {
  const [form, setForm] = useState({ title: "", baseLanguage: "ES", targetLanguage: "EN" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Título requerido");
    try {
      if (editingId) await updateCourse(editingId, form);
      else await createCourse(form);
      setForm({ title: "", baseLanguage: "ES", targetLanguage: "EN" });
      setEditingId(null);
      onRefresh();
    } catch (e) { alert("Error al procesar curso"); }
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setForm({ title: course.title, baseLanguage: course.baseLanguage || "ES", targetLanguage: course.targetLanguage || "EN" });
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>📘 Gestión de Cursos</h2>
      
      {/* Formulario de Creación/Edición */}
      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: '2px solid #E5E5E5', marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>{editingId ? "✏️ Editar curso" : "➕ Nuevo curso"}</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input placeholder="Nombre del curso" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "2px solid #E5E5E5", fontWeight: 600 }} />
          <button onClick={handleSubmit} style={{ padding: "12px 20px", borderRadius: "10px", border: "none", background: "#1cb0f6", color: "white", fontWeight: 700, cursor: "pointer" }}>
            {editingId ? "Actualizar" : "Crear"}
          </button>
        </div>
      </div>

      {/* Lista de Cursos Card */}
      <div style={{ display: "grid", gap: "16px" }}>
        {courses.map((course) => (
          <div key={course.id} style={{ background: "#fff", padding: "18px", borderRadius: "16px", border: '2px solid #E5E5E5', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: "16px" }}>{course.title}</strong>
              <div style={{ fontSize: "13px", color: "#666" }}>{course.baseLanguage} → {course.targetLanguage}</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => onSelectCourse(course.id)} style={btnCourseAction}>Unidades</button>
              <button onClick={() => handleEdit(course)} style={{...btnCourseAction, background: '#FFF3CD', color: '#856404'}}>Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (ADMIN DASHBOARD)
// ==========================================
export const AdminDashboard = () => {
  // --- Estados Globales ---
  const [activeSection, setActiveSection] = useState('roles');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<StudentData[]>([]);
  const [filterType, setFilterType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [notification, setNotification] = useState<{show: boolean, msg: string, type?: 'success' | 'error'}>({ show: false, msg: '' });
  
  // --- Estados de Códigos ---
  const [studentCode, setStudentCode] = useState('');
  const [teacherRegCode, setTeacherRegCode] = useState('');

  // --- Estados de Carga Masiva ---
  const [manualUsers, setManualUsers] = useState<ManualUser[]>([
    { fullName: '', email: '', password: '', cedula: '', role: 'STUDENT' }
  ]);

  useEffect(() => { fetchUsers(); }, []);

  // --- Utilidades ---
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '' }), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersAdmin();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) { 
      showToast("❌ No se pudo conectar con el servidor", 'error');
    } finally { setLoading(false); }
  };

 // ==========================================
  // 4. LÓGICA DE USUARIOS Y ROLES (CON EDICIÓN)
  // ==========================================
  const [editingUser, setEditingUser] = useState<StudentData | null>(null);

  const handleUserUpdate = async (userId: string, field: string, value: string | boolean) => {
    try {
      // Actualización optimista en UI
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u));
      
      if (field === 'role') await updateUserRole(userId, value as string);
      else if (field === 'isActive') await updateUserStatus(userId, value as boolean);
      // Si necesitas actualizar fullName o cedula, llamarías a otra función de tu API aquí
      
      showToast("✨ Cambios guardados");
    } catch (error) {
      showToast("❌ Error al actualizar", 'error');
      fetchUsers();
    }
  };

  // Función para guardar cambios manuales (Nombre, Cédula, etc.)
  const saveFullEdit = async () => {
    if (!editingUser) return;
    try {
      // Aquí llamarías a un endpoint tipo updateUserInfo(editingUser.id, editingUser)
      // Por ahora, lo actualizamos localmente:
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      showToast("👤 Perfil actualizado con éxito");
      setEditingUser(null);
    } catch (e) {
      showToast("❌ Error al guardar cambios", "error");
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return users.filter(u => {
      const name = (u.fullName || u.username || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const matchesSearch = name.includes(term) || email.includes(term);
      const roleRaw = (u.role || "STUDENT").toUpperCase();
      if (filterType === 'TEACHER') return matchesSearch && (roleRaw.includes('TEACH') || roleRaw.includes('ADMIN'));
      return matchesSearch && (roleRaw.includes('STUDENT') || roleRaw === "");
    });
  }, [users, searchTerm, filterType]);
  // ==========================================
  // 5. LÓGICA DE GENERACIÓN DE CÓDIGOS
  // ==========================================
  const handleGenCode = async (type: 'student' | 'teacher') => {
    try {
      const code = type === 'student' ? await generateClassroomCode() : await generateTeacherRegistrationCode();
      if (type === 'student') setStudentCode(code);
      else setTeacherRegCode(code);
      showToast(`✨ Código generado`);
    } catch (e) { showToast("❌ Error al generar código", 'error'); }
  };

  // ==========================================
  // 6. LÓGICA DE CARGA MASIVA
  // ==========================================
  const addRow = () => setManualUsers([...manualUsers, { fullName: '', email: '', password: '', cedula: '', role: 'STUDENT' }]);
  const removeRow = (index: number) => manualUsers.length > 1 && setManualUsers(manualUsers.filter((_, i) => i !== index));
  
  const handleManualChange = (index: number, field: keyof ManualUser, value: string) => {
    const updated = [...manualUsers];
    updated[index] = { ...updated[index], [field]: value };
    setManualUsers(updated);
  };

  const handleBulkSubmit = async () => {
    if (manualUsers.some(u => !u.fullName.trim() || !u.email.trim() || !u.cedula.trim())) { 
      showToast("⚠️ Completa los campos obligatorios", 'error'); 
      return; 
    }
    setLoading(true);
    try {
      await registerBulk({
        users: manualUsers.map(u => ({ ...u, password: u.password || "Duo12345*" })),
        roleToAssign: manualUsers[0].role,
        registrationCode: ""
      });
      showToast("🚀 Registro masivo exitoso");
      setManualUsers([{ fullName: '', email: '', password: '', cedula: '', role: 'STUDENT' }]);
      setActiveSection('roles');
      fetchUsers();
    } catch (error) { showToast("❌ Error en el registro", 'error'); } finally { setLoading(false); }
  };

  // ==========================================
  // 7. RENDERIZADO DE LA VISTA
  // ==========================================
  return (
    <div style={layoutStyle}>
      {/* Notificaciones flotantes */}
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0 }} 
            style={{...toastStyle, backgroundColor: notification.type === 'error' ? '#FF4B4B' : '#58CC02'}}>
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <AdminSidebarDashboard activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main style={mainContainerStyle}>
        
        {/* SECCIÓN: USUARIOS Y ROLES */}
        {activeSection === 'roles' && (
          <div style={cardStyle}>
            <div style={headerFlexStyle}>
              <h2 style={titleStyle}>Gestión de Usuarios</h2>
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={fetchUsers} style={btnSecondary}>{loading ? "..." : "🔄 Actualizar"}</button>
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchBarStyle} />
              </div>
            </div>
            <div style={tabContainerStyle}>
              <button onClick={() => setFilterType('STUDENT')} style={tabButtonStyle(filterType === 'STUDENT')}>ESTUDIANTES</button>
              <button onClick={() => setFilterType('TEACHER')} style={tabButtonStyle(filterType === 'TEACHER')}>PROFESORES / ADMIN</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>USUARIO</th>
                    <th style={thStyle}>CÉDULA</th>
                    <th style={thStyle}>ROL</th>
                    <th style={thStyle}>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={tdStyleFirst}>
                          <div style={{ fontWeight: 800 }}>{u.fullName || 'Sin nombre'}</div>
                          <div style={{ fontSize: '11px', color: '#AFAFAF' }}>{u.email} • <span style={{color: '#1CB0F6'}}>⚡ {u.xpTotal || 0} XP</span></div>
                        </td>
                        <td style={tdStyle}>{u.cedula || '---'}</td>
                        <td style={tdStyle}>
                          <select value={u.role || 'STUDENT'} onChange={(e) => handleUserUpdate(u.id!, 'role', e.target.value)} style={selectRoleStyle}>
                            <option value="STUDENT">STUDENT</option>
                            <option value="TEACHER">TEACHER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td style={tdStyleLast}>
                    
                          <button onClick={() => handleUserUpdate(u.id!, 'isActive', !u.isActive)} 
                            style={{...btnStatusStyle, color: u.isActive ? '#58CC02' : '#FF4B4B', backgroundColor: u.isActive ? '#E8FDF0' : '#FFF0F0'}}>
                            {u.isActive ? '● ACTIVO' : '○ BLOQUEADO'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: '#AFAFAF' }}>{loading ? "Sincronizando..." : "No hay usuarios"}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECCIÓN: CURSOS */}
        {activeSection === 'cursos' && (
          <div style={cardStyle}>
            <CoursesSection 
              courses={[]} // Conectar con el estado de cursos real si existe
              onSelectCourse={(id) => console.log("Seleccionado:", id)} 
              onRefresh={fetchUsers} 
            />
          </div>
        )}

        {/* SECCIÓN: GENERAR CÓDIGOS */}
        {activeSection === 'generar' && (
          <div style={{ width: '100%' }}>
            <h2 style={titleStyle}>Códigos de Acceso</h2>
            <div style={horizontalGrid}>
              <div style={modernCodeCard}>
                <p style={smallLabel}>CÓDIGO AULA (ESTUDIANTES)</p>
                <div style={codeRowFlex}>
                  <span style={{ ...digitalCode, color: '#1cb0f6' }}>{studentCode || '•••• ••••'}</span>
                  <button onClick={() => handleGenCode('student')} style={btnActionSmall}>Generar</button>
                </div>
              </div>
              <div style={modernCodeCard}>
                <p style={smallLabel}>CÓDIGO REGISTRO PROFESORES</p>
                <div style={codeRowFlex}>
                  <span style={{ ...digitalCode, color: '#AF85FF' }}>{teacherRegCode || '•••• ••••'}</span>
                  <button onClick={() => handleGenCode('teacher')} style={btnActionSmall}>Generar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN: CARGA MASIVA */}
        {activeSection === 'carga' && (
          <div style={cardStyle}>
            <h2 style={titleStyle}>Registro Masivo</h2>
            <button onClick={addRow} style={btnAddRowStyle}>+ Añadir Fila</button>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {manualUsers.map((user, index) => (
                <div key={index} style={rowInputStyle}>
                  <input style={inputStyle} placeholder="Nombre" value={user.fullName} onChange={(e) => handleManualChange(index, 'fullName', e.target.value)} />
                  <input style={inputStyle} placeholder="Email" value={user.email} onChange={(e) => handleManualChange(index, 'email', e.target.value)} />
                  <input style={inputStyle} placeholder="Cédula" value={user.cedula} onChange={(e) => handleManualChange(index, 'cedula', e.target.value)} />
                  <input style={inputStyle} type="password" placeholder="Pass" value={user.password} onChange={(e) => handleManualChange(index, 'password', e.target.value)} />
                  <select style={{...inputStyle, flex: 0.6}} value={user.role} onChange={(e) => handleManualChange(index, 'role', e.target.value)}>
                    <option value="STUDENT">ESTUDIANTE</option>
                    <option value="TEACHER">PROFESOR</option>
                  </select>
                  <button onClick={() => removeRow(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                </div>
              ))}
            </div>
            <button onClick={handleBulkSubmit} style={btnMainStyle} disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Lista Completa'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// ==========================================
// 8. ESTILOS (CSS-in-JS)
// ==========================================
const layoutStyle: React.CSSProperties = {
  display: 'flex',
  backgroundColor: '#F7F9FA',
  minHeight: '100vh',
  fontFamily: '"Nunito", sans-serif',
};
const mainContainerStyle: React.CSSProperties = {
  marginLeft: 260,
  padding: '10px 20px 10px 10px', // casi pegado
  width: 'calc(100% - 260px)',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '24px',
  padding: '20px',        // antes estaba 32px
  border: '2px solid #E5E5E5',
  boxShadow: '0 4px 0 #E5E5E5'
};

const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 900, color: '#3C3C3C', marginBottom: '25px' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0 20px', fontSize: '12px', fontWeight: 900, color: '#BDBDBD', textTransform: 'uppercase' };
const tdStyleFirst: React.CSSProperties = { padding: '15px 20px', border: '2px solid #F0F0F0', borderRight: 'none', borderRadius: '15px 0 0 15px', backgroundColor: 'white' };
const tdStyle: React.CSSProperties = { padding: '15px 20px', borderTop: '2px solid #F0F0F0', borderBottom: '2px solid #F0F0F0', backgroundColor: 'white', fontWeight: 700, color: '#4B4B4B' };
const tdStyleLast: React.CSSProperties = { padding: '15px 20px', border: '2px solid #F0F0F0', borderLeft: 'none', borderRadius: '0 15px 15px 0', backgroundColor: 'white', textAlign: 'right' };
const searchBarStyle: React.CSSProperties = { padding: '12px 20px', borderRadius: '15px', border: '2px solid #E5E5E5', width: '300px', fontWeight: 700, outline: 'none' };
const btnSecondary: React.CSSProperties = { padding: '12px 20px', borderRadius: '15px', border: '2px solid #E5E5E5', backgroundColor: 'white', fontWeight: 800, cursor: 'pointer', color: '#4B4B4B' };
const headerFlexStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const tabContainerStyle: React.CSSProperties = { display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #E5E5E5', paddingBottom: '10px' };
const tabButtonStyle = (active: boolean): React.CSSProperties => ({ padding: '10px 5px', border: 'none', borderBottom: active ? '4px solid #1cb0f6' : '4px solid transparent', backgroundColor: 'transparent', color: active ? '#1cb0f6' : '#AFAFAF', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s' });
const btnStatusStyle: React.CSSProperties = { border: 'none', padding: '8px 15px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '11px' };
const selectRoleStyle: React.CSSProperties = { padding: '8px', borderRadius: '12px', border: '2px solid #F0F0F0', fontWeight: 700, color: '#777', cursor: 'pointer' };
const horizontalGrid: React.CSSProperties = { display: 'flex', gap: '20px' };
const modernCodeCard: React.CSSProperties = { backgroundColor: 'white', padding: '25px', borderRadius: '24px', border: '2px solid #E5E5E5', flex: 1, boxShadow: '0 4px 0 #E5E5E5' };
const codeRowFlex: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' };
const smallLabel: React.CSSProperties = { fontSize: '11px', fontWeight: 900, color: '#BDBDBD' };
const digitalCode: React.CSSProperties = { fontSize: '24px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px' };
const btnActionSmall: React.CSSProperties = { backgroundColor: '#AF85FF', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 0 #9366E4' };
const rowInputStyle: React.CSSProperties = { display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' };
const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: '12px', border: '2px solid #E5E5E5', flex: 1, fontWeight: 600 };
const btnAddRowStyle: React.CSSProperties = { marginBottom: '20px', padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#E1F5FE', color: '#1CB0F6', fontWeight: 800, cursor: 'pointer' };
const btnMainStyle: React.CSSProperties = { width: '100%', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#58CC02', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 5px 0 #46A302', fontSize: '16px' };
const toastStyle: React.CSSProperties = { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', color: 'white', padding: '15px 30px', borderRadius: '16px', fontWeight: 900, zIndex: 1000, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' };
const btnCourseAction: React.CSSProperties = { padding: "8px 14px", borderRadius: "8px", border: "none", background: "#e8f5fe", color: "#1cb0f6", fontWeight: 600, cursor: "pointer" };