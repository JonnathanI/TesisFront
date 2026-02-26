// src/admin/AdminDashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminSidebarDashboard } from "./AdminSidebarDashboard";
import {
  generateClassroomCode,
  generateTeacherRegistrationCode,
  getAllUsersAdmin,
  registerBulk,
  updateUserRole,
  updateUserStatus,
  createCourse,
  updateCourse,
  deleteCourse,
  apiFetch,
  updateUser,
} from "../api/auth.service";
import {
  StudentData,
  UserRole,
  BulkRegisterRequest,
  BulkUserItem,
} from "../api/auth.types";
import * as XLSX from "xlsx";

// ==========================================
// 1. INTERFACES Y TIPOS
// ==========================================
interface ManualUser {
  fullName: string;
  email: string;
  password?: string;
  cedula: string;
}

interface CoursesProps {
  courses: any[];
  allUsers: StudentData[];
  onSelectCourse: (id: string) => void;
  onRefresh: () => void;
}

// ==========================================
// 2. SUB-COMPONENTE: GESTIÓN DE CURSOS
// ==========================================
// ==========================================
// 2. SUB-COMPONENTE: GESTIÓN DE CURSOS
// ==========================================
const CoursesSection = ({
  courses,
  allUsers,
  onSelectCourse, // ya no lo usamos, pero lo dejamos por compatibilidad
  onRefresh,
}: CoursesProps) => {
  const [form, setForm] = useState({
    title: "",
    baseLanguage: "ES",
    targetLanguage: "EN",
    teachers: [] as string[],
    students: [] as string[],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // 👉 Curso que estoy editando (si aplica)
  const editingCourse = useMemo(
    () => courses.find((c) => c.id === editingId) || null,
    [courses, editingId]
  );

  // ================================================
  // PROFESORES DISPONIBLES
  //  - No repetidos en otros cursos
  //  - PERO si estoy editando, incluir el teacher actual del curso
  // ================================================
  const usedTeacherIds = new Set(
    courses
      .filter((c) => c.teacher)
      .map((c) => c.teacher.id as string)
  );

  const currentTeacherId = editingCourse?.teacher?.id as string | undefined;

  const availableTeachers = allUsers.filter((u) => {
    const isTeacherRole = u.role === "TEACHER" || u.role === "ADMIN";
    if (!isTeacherRole) return false;

    // Si es el teacher actual del curso en edición, permitirlo
    if (currentTeacherId && u.id === currentTeacherId) return true;

    // Si ya está usado en otro curso, NO mostrarlo
    return !usedTeacherIds.has(u.id!);
  });

  // ================================================
  // ESTUDIANTES DISPONIBLES
  //  - No repetidos en otros cursos
  //  - PERO si estoy editando, incluir los alumnos actuales de ese curso
  // ================================================
  const usedStudentIds = new Set<string>();
  courses.forEach((c) => {
    (c.students || []).forEach((s: any) => {
      if (s?.id) usedStudentIds.add(s.id);
    });
  });

  const editingCourseStudentIds = new Set<string>(
    (editingCourse?.students || []).map((s: any) => s.id as string)
  );

  const availableStudents = allUsers.filter((u) => {
    if (u.role !== "STUDENT") return false;

    // Si es alumno del curso que estoy editando, permitirlo
    if (editingCourseStudentIds.has(u.id!)) return true;

    // Si está matriculado en otro curso, NO mostrarlo
    return !usedStudentIds.has(u.id!);
  });

  // ================================================
  // GUARDAR / CREAR CURSO
  // ================================================
  const handleSubmit = async () => {
    if (!form.title.trim()) return alert("Título requerido");
    try {
      if (editingId) {
        await updateCourse(editingId, form);
      } else {
        await createCourse(form);
      }

      setForm({
        title: "",
        baseLanguage: "ES",
        targetLanguage: "EN",
        teachers: [],
        students: [],
      });
      setEditingId(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Error al procesar curso");
    }
  };

  // ================================================
  // ELIMINAR CURSO
  // ================================================
  const handleDeleteCourse = async (id: string, title: string) => {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar el curso "${title}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      await deleteCourse(id);
      // Si estaba editando este curso, limpiamos el formulario
      if (editingId === id) {
        setEditingId(null);
        setForm({
          title: "",
          baseLanguage: "ES",
          targetLanguage: "EN",
          teachers: [],
          students: [],
        });
      }
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar el curso");
    }
  };

  const toggleSelection = (id: string, listName: "teachers" | "students") => {
    setForm((prev) => ({
      ...prev,
      [listName]: prev[listName].includes(id)
        ? prev[listName].filter((item) => item !== id)
        : [...prev[listName], id],
    }));
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "1rem" }}>
        📘 Gestión de Cursos
      </h2>

      {/* FORMULARIO */}
      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "16px",
          border: "2px solid #E5E5E5",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>
          {editingId ? "✏️ Editar curso" : "➕ Nuevo curso"}
        </h3>

        <input
          placeholder="Nombre del curso"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "2px solid #E5E5E5",
            fontWeight: 600,
            marginBottom: "15px",
          }}
        />

        {/* PROFESORES Y ESTUDIANTES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div style={selectorBoxStyle}>
            <label style={labelStyle}>PROFESORES</label>
            <div style={scrollListStyle}>
              {availableTeachers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => toggleSelection(u.id!, "teachers")}
                  style={itemSelectStyle(form.teachers.includes(u.id!))}
                >
                  {u.fullName} {form.teachers.includes(u.id!) && "✅"}
                </div>
              ))}
              {availableTeachers.length === 0 && (
                <span style={{ fontSize: 12, color: "#999" }}>
                  No hay profesores disponibles.
                </span>
              )}
            </div>
          </div>

          <div style={selectorBoxStyle}>
            <label style={labelStyle}>ESTUDIANTES</label>
            <div style={scrollListStyle}>
              {availableStudents.map((u) => (
                <div
                  key={u.id}
                  onClick={() => toggleSelection(u.id!, "students")}
                  style={itemSelectStyle(form.students.includes(u.id!))}
                >
                  {u.fullName} {form.students.includes(u.id!) && "✅"}
                </div>
              ))}
              {availableStudents.length === 0 && (
                <span style={{ fontSize: 12, color: "#999" }}>
                  No hay estudiantes disponibles.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "#1cb0f6",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {editingId ? "Actualizar Curso" : "Crear Curso"}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm({
                  title: "",
                  baseLanguage: "ES",
                  targetLanguage: "EN",
                  teachers: [],
                  students: [],
                });
              }}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #E5E5E5",
                background: "white",
                fontWeight: 700,
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE CURSOS */}
      <div style={{ display: "grid", gap: "16px" }}>
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              background: "#fff",
              padding: "18px",
              borderRadius: "16px",
              border: "2px solid #E5E5E5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: "16px" }}>{course.title}</strong>
              <div style={{ fontSize: "12px", color: "#666" }}>
                👥 {course.students?.length || 0} alumnos | 👨‍🏫{" "}
                {course.teacher ? 1 : 0} prof.
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {/* 🔴 ELIMINAR BOTÓN "UNIDADES" (YA NO SE MUESTRA) */}
              {/* (si quieres borrarlo completamente, puedes eliminar este botón) */}
              {/* <button
                onClick={() => onSelectCourse(course.id)}
                style={btnCourseAction}
              >
                Unidades
              </button> */}

              {/* ✏️ EDITAR */}
              <button
                onClick={() => {
                  setEditingId(course.id);
                  setForm({
                    title: course.title,
                    baseLanguage: course.baseLanguage || "ES",
                    targetLanguage: course.targetLanguage || "EN",
                    teachers: course.teacher ? [course.teacher.id] : [],
                    students: (course.students || []).map((s: any) => s.id),
                  });
                }}
                style={{
                  ...btnCourseAction,
                  background: "#FFF3CD",
                  color: "#856404",
                }}
              >
                Editar
              </button>

              {/* 🗑 ELIMINAR CURSO */}
              <button
                onClick={() =>
                  handleDeleteCourse(course.id, course.title || "curso")
                }
                style={{
                  ...btnCourseAction,
                  background: "#FEE2E2",
                  color: "#B91C1C",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. ADMIN DASHBOARD PRINCIPAL COMPLETO
// ==========================================
export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("roles");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<StudentData[]>([]);
  const [filterType, setFilterType] = useState<"STUDENT" | "TEACHER">(
    "STUDENT"
  );
  const [notification, setNotification] = useState<{
    show: boolean;
    msg: string;
    type?: "success" | "error";
  }>({ show: false, msg: "" });

  // ⭐ CURSOS
  const [courses, setCourses] = useState<any[]>([]);

  // ⭐ Registro masivo
  const [manualUsers, setManualUsers] = useState<ManualUser[]>([
    { fullName: "", email: "", password: "", cedula: "" },
  ]);
  const [bulkRole, setBulkRole] = useState<UserRole>("STUDENT");
  const [bulkTab, setBulkTab] = useState<"manual" | "excel">("manual");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [bulkRegistrationCode, setBulkRegistrationCode] = useState(""); // 👈 NUEVO

  const fetchCourses = async () => {
    try {
      const res = await apiFetch("/courses", { method: "GET" });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando cursos", error);
    }
  };

  const [studentCode, setStudentCode] = useState("");
  const [teacherRegCode, setTeacherRegCode] = useState("");
   const [studentMaxUses, setStudentMaxUses] = useState<number>(20);
  const [teacherMaxUses, setTeacherMaxUses] = useState<number>(5);
  const [editingUser, setEditingUser] = useState<StudentData | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: "" }), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsersAdmin();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      showToast("❌ No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async (
    userId: string,
    field: string,
    value: string | boolean
  ) => {
    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u))
      );

      if (field === "role") await updateUserRole(userId, value as string);
      else if (field === "isActive")
        await updateUserStatus(userId, value as boolean);

      showToast("✨ Estado actualizado");
    } catch (error) {
      showToast("❌ Error al actualizar", "error");
      fetchUsers();
    }
  };

  const saveFullEdit = async () => {
    if (!editingUser || !editingUser.id) return;
    setLoading(true);
    try {
      await updateUser(editingUser.id, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        cedula: editingUser.cedula,
      });

      await fetchUsers();

      showToast("👤 Perfil actualizado con éxito");
      setEditingUser(null);
    } catch (e) {
      console.error(e);
      showToast("❌ Error al guardar cambios", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return users.filter((u) => {
      const name = (u.fullName || u.username || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const cedula = (u.cedula || "").toLowerCase();
      const matchesSearch =
        name.includes(term) || email.includes(term) || cedula.includes(term);

      const roleRaw = (u.role || "STUDENT").toUpperCase();

      if (filterType === "TEACHER")
        return (
          matchesSearch &&
          (roleRaw.includes("TEACH") || roleRaw.includes("ADMIN"))
        );

      return matchesSearch && roleRaw.includes("STUDENT");
    });
  }, [users, searchTerm, filterType]);

const handleGenCode = async (type: "student" | "teacher") => {
  try {
    if (type === "student") {
      // Aseguramos un número válido
      const safeUses =
        typeof studentMaxUses === "number" && studentMaxUses > 0
          ? studentMaxUses
          : 1;

      const code = await generateClassroomCode(safeUses);
      setStudentCode(code);
    } else {
      // 👉 Por ahora el backend de PROFESORES NO recibe maxUses.
      //    Si luego lo agregas, aquí le pasas teacherMaxUses.
      const code = await generateTeacherRegistrationCode();
      setTeacherRegCode(code);
    }

    showToast("✨ Código generado");
  } catch (e) {
    showToast("❌ Error al generar código", "error");
  }
};



  const addRow = () =>
    setManualUsers([
      ...manualUsers,
      {
        fullName: "",
        email: "",
        password: "",
        cedula: "",
      },
    ]);

  const removeRow = (index: number) =>
    manualUsers.length > 1 &&
    setManualUsers(manualUsers.filter((_, i) => i !== index));

 const handleManualChange = (
  index: number,
  field: keyof ManualUser,
  value: string
) => {
  setManualUsers((prev) => {
    const updated = [...prev];

    const before = updated[index];

    const next: ManualUser = {
      ...before,
      [field]: value,
    };

    updated[index] = next;

    const isLastRow = index === updated.length - 1;

    // ✅ Consideramos la fila "completa" SOLO si:
    //   - tiene nombre, email, cédula y contraseña
    const isCompleteNow =
      (next.fullName || "").trim() !== "" &&
      (next.email || "").trim() !== "" &&
      (next.cedula || "").trim() !== "" &&
      (next.password || "").trim() !== "";

    // 👇 Solo agregamos una nueva fila si:
    //   - estamos editando la ÚLTIMA fila
    //   - el campo que se está editando es "password"
    //   - y después del cambio, la fila está completa
    if (isLastRow && field === "password" && isCompleteNow) {
      updated.push({
        fullName: "",
        email: "",
        password: "",
        cedula: "",
      });
    }

    return updated;
  });
};


  // ------- REGISTRO MASIVO: FORMULARIO MANUAL -------
  const handleBulkSubmitManual = async () => {
    if (
      manualUsers.some(
        (u) => !u.fullName.trim() || !u.email.trim() || !u.cedula.trim()
      )
    ) {
      showToast("⚠️ Completa los campos obligatorios", "error");
      return;
    }

    if (!bulkRegistrationCode.trim()) {
      showToast(
        "⚠️ Ingresa un código de vinculación para este lote",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const payload: BulkRegisterRequest = {
        users: manualUsers.map<BulkUserItem>((u) => ({
          fullName: u.fullName,
          email: u.email,
          password: u.password || "Duo12345*",
          cedula: u.cedula,
        })),
        registrationCode: bulkRegistrationCode, // 👈 AHORA SÍ VA EL CÓDIGO
        roleToAssign: bulkRole,
      };

      const result = await registerBulk(payload);

      if (result.successCount === 0) {
        showToast(
          "❌ No se pudo registrar ningún usuario. Revisa el código o los datos.",
          "error"
        );
      } else {
        showToast(
          `🚀 Registro masivo exitoso. Éxitos: ${result.successCount}, errores: ${result.failureCount}`
        );
      }

      setManualUsers([
        { fullName: "", email: "", password: "", cedula: "" },
      ]);
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast("❌ Error en el registro masivo", "error");
    } finally {
      setLoading(false);
    }
  };

  // ------- REGISTRO MASIVO: SUBIR EXCEL -------
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setExcelFile(file);
  };

  const handleBulkSubmitExcel = async () => {
    if (!excelFile) {
      showToast("⚠️ Primero selecciona un archivo Excel", "error");
      return;
    }

    if (!bulkRegistrationCode.trim()) {
      showToast(
        "⚠️ Ingresa un código de vinculación para este lote",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const data = await excelFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      // Se espera columnas: fullName | email | cedula | password (opcional)
      const usersFromExcel: BulkUserItem[] = rows.map((row: any) => ({
  fullName: String(row.fullName || row.nombre || "").trim(),
  email: String(row.email || "").trim(),
  cedula: String(row.cedula || row.ced || "").trim(),
  // ⬇ Leemos bien la columna del Excel
  password: String(
    row.password ||
      row["password"] ||
      row["password (opcional)"] || // <-- nombre de tu columna
      ""
  ).trim(),
}));


   if (
  usersFromExcel.some(
    (u) => !u.fullName.trim() || !u.email.trim() || !u.cedula.trim()
  )
) {
  showToast("⚠️ Hay filas en el Excel sin nombre, email o cédula", "error");
  setLoading(false);
  return;
}


      const payload: BulkRegisterRequest = {
        users: usersFromExcel,
        registrationCode: bulkRegistrationCode, // 👈 CÓDIGO AQUÍ TAMBIÉN
        roleToAssign: bulkRole,
      };

      const result = await registerBulk(payload);

      if (result.successCount === 0) {
        showToast(
          "❌ No se pudo registrar ningún usuario. Revisa el código o el archivo.",
          "error"
        );
      } else {
        showToast(
          `📥 Excel procesado con éxito. Éxitos: ${result.successCount}, errores: ${result.failureCount}`
        );
      }

      setExcelFile(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast("❌ Error al procesar el Excel", "error");
    } finally {
      setLoading(false);
    }
  };

  // ------- DESCARGAR PLANTILLA EXCEL -------
  const handleDownloadTemplateExcel = () => {
    const headers = [["fullName", "email", "cedula", "password)"]];
    const exampleRow = [["Juan Perez", "juan@mail.com", "17263544", "Duo12345*"]];

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...exampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

    XLSX.writeFile(workbook, "plantilla_usuarios.xlsx");
  };

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
  return (
    <div style={layoutStyle}>
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0 }}
            style={{
              ...toastStyle,
              backgroundColor:
                notification.type === "error" ? "#FF4B4B" : "#58CC02",
            }}
          >
            {notification.msg}
          </motion.div>
        )}

        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={overlayStyle}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              style={modalEditStyle}
            >
              <h2 style={{ marginBottom: "20px", fontWeight: 900 }}>
                ✏️ Editar Usuario
              </h2>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "15px" }}
              >
                <div style={inputGroup}>
                  <label style={labelStyle}>NOMBRE</label>
                  <input
                    style={inputStyle}
                    value={editingUser.fullName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        fullName: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={inputGroup}>
                  <label style={labelStyle}>EMAIL</label>
                  <input
                    style={inputStyle}
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={inputGroup}>
                  <label style={labelStyle}>CÉDULA</label>
                  <input
                    style={inputStyle}
                    value={editingUser.cedula}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        cedula: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "30px",
                }}
              >
                <button onClick={saveFullEdit} style={btnMainStyle}>
                  Guardar
                </button>

                <button
                  onClick={() => setEditingUser(null)}
                  style={{ ...btnSecondary, width: "100%" }}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminSidebarDashboard
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main style={mainContainerStyle}>
        {/* USUARIOS */}
        {activeSection === "roles" && (
          <div style={cardStyle}>
            <div style={headerFlexStyle}>
              <h2 style={titleStyle}>Usuarios</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={fetchUsers} style={btnSecondary}>
                  {loading ? "..." : "🔄"}
                </button>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={searchBarStyle}
                />
              </div>
            </div>

            <div style={tabContainerStyle}>
              <button
                onClick={() => setFilterType("STUDENT")}
                style={tabButtonStyle(filterType === "STUDENT")}
              >
                ESTUDIANTES
              </button>

              <button
                onClick={() => setFilterType("TEACHER")}
                style={tabButtonStyle(filterType === "TEACHER")}
              >
                PROFESORES
              </button>
            </div>

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
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={tdStyleFirst}>
                      <div style={{ fontWeight: 800 }}>
                        {u.fullName || "Sin nombre"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#AFAFAF" }}>
                        {u.email}
                      </div>
                    </td>

                    <td style={tdStyle}>{u.cedula || "---"}</td>

                    <td style={tdStyle}>
                      <select
                        value={u.role || "STUDENT"}
                        onChange={(e) =>
                          handleUserUpdate(u.id!, "role", e.target.value)
                        }
                        style={selectRoleStyle}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td style={tdStyleLast}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={() => setEditingUser(u)}
                          style={btnEditMini}
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            handleUserUpdate(u.id!, "isActive", !u.isActive)
                          }
                          style={{
                            ...btnStatusStyle,
                            color: u.isActive ? "#58CC02" : "#FF4B4B",
                            backgroundColor: u.isActive
                              ? "#E8FDF0"
                              : "#FFF0F0",
                          }}
                        >
                          {u.isActive ? "ACTIVO" : "BLOQUEADO"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CURSOS */}
        {activeSection === "cursos" && (
          <div style={cardStyle}>
            <CoursesSection
              courses={courses}
              allUsers={users}
              onSelectCourse={() => {}}
              onRefresh={() => {
                fetchCourses();
                fetchUsers();
              }}
            />
          </div>
        )}

        {/* GENERAR CÓDIGOS */}
       {activeSection === "generar" && (
  <div style={{ width: "100%" }}>
    <h2 style={titleStyle}>Códigos</h2>

    <div style={horizontalGrid}>
      {/* ESTUDIANTES */}
      <div style={modernCodeCard}>
        <p style={smallLabel}>AULA ESTUDIANTES</p>

        {/* 🔢 Cantidad de usos */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label style={labelStyle}>Cantidad de usos permitidos</label>
          <input
            type="number"
            min={1}
            value={studentMaxUses}
            onChange={(e) =>
              setStudentMaxUses(
                Math.max(1, Number.parseInt(e.target.value || "1", 10))
              )
            }
            style={inputStyle}
          />
        </div>

        <div style={codeRowFlex}>
          <span style={{ ...digitalCode, color: "#1cb0f6" }}>
            {studentCode || "••••"}
          </span>

          <button
            onClick={() => handleGenCode("student")}
            style={btnActionSmall}
          >
            Generar
          </button>
        </div>

        <small style={{ fontSize: 11, color: "#999" }}>
          Este código se podrá usar hasta {studentMaxUses} veces por estudiantes.
        </small>
      </div>

      {/* PROFESORES */}
      <div style={modernCodeCard}>
        <p style={smallLabel}>REGISTRO PROFESORES</p>

        {/* 🔢 Cantidad de usos (solo informativo hasta que cambies backend) */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <label style={labelStyle}>Cantidad de usos permitidos</label>
          <input
            type="number"
            min={1}
            value={teacherMaxUses}
            onChange={(e) =>
              setTeacherMaxUses(
                Math.max(1, Number.parseInt(e.target.value || "1", 10))
              )
            }
            style={inputStyle}
          />
        </div>

        <div style={codeRowFlex}>
          <span style={{ ...digitalCode, color: "#AF85FF" }}>
            {teacherRegCode || "••••"}
          </span>

          <button
            onClick={() => handleGenCode("teacher")}
            style={btnActionSmall}
          >
            Generar
          </button>
        </div>

        <small style={{ fontSize: 11, color: "#999" }}>
          Comparte este código con hasta {teacherMaxUses} profesores.
        </small>
      </div>
    </div>
  </div>
)}


        {/* REGISTRO MASIVO */}
 {activeSection === "carga" && (
  <div
    style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
    }}
  >
    {/* CARD CENTRADO Y MÁS ANGOSTO */}
    <div
      style={{
        ...cardStyle,
        maxWidth: "900px",   // 👈 más angosto para que quepa cómodo
        width: "100%",
      }}
    >
      {/* Título + selector de rol del lote */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={titleStyle}>Registro Masivo</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setBulkRole("STUDENT")}
            style={tabButtonStyle(bulkRole === "STUDENT")}
          >
            Estudiantes
          </button>
          <button
            onClick={() => setBulkRole("TEACHER")}
            style={tabButtonStyle(bulkRole === "TEACHER")}
          >
            Profesores
          </button>
        </div>
      </div>

      {/* CÓDIGO DE VINCULACIÓN PARA EL LOTE */}
      <div style={{ marginBottom: "15px" }}>
        <label style={labelStyle}>Código de vinculación para este lote</label>
        <input
          style={inputStyle}
          placeholder={
            bulkRole === "STUDENT"
              ? "Ej: AULA-123 (código de aula)"
              : "Ej: PROF-XYZ (código de profesor)"
          }
          value={bulkRegistrationCode}
          onChange={(e) =>
            setBulkRegistrationCode(e.target.value.toUpperCase())
          }
        />
      </div>

      {/* Tabs Manual / Excel */}
      <div style={tabContainerStyle}>
        <button
          onClick={() => setBulkTab("manual")}
          style={tabButtonStyle(bulkTab === "manual")}
        >
          FORMULARIO MANUAL
        </button>
        <button
          onClick={() => setBulkTab("excel")}
          style={tabButtonStyle(bulkTab === "excel")}
        >
          SUBIR EXCEL
        </button>
      </div>

      {/* CONTENIDO: MANUAL */}
      {bulkTab === "manual" && (
        <>
         

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              marginBottom: "20px",
            }}
          >
            {manualUsers.map((user, index) => (
              <div key={index} style={rowInputStyle}>
                <input
                  style={inputStyle}
                  placeholder="Nombre"
                  value={user.fullName}
                  onChange={(e) =>
                    handleManualChange(index, "fullName", e.target.value)
                  }
                />

                <input
                  style={inputStyle}
                  placeholder="Email"
                  value={user.email}
                  onChange={(e) =>
                    handleManualChange(index, "email", e.target.value)
                  }
                />

                <input
                  style={inputStyle}
                  placeholder="Cédula"
                  value={user.cedula}
                  onChange={(e) =>
                    handleManualChange(index, "cedula", e.target.value)
                  }
                />

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Contraseña"
                  value={user.password || ""}
                  onChange={(e) =>
                    handleManualChange(index, "password", e.target.value)
                  }
                />

                <button
                  onClick={() => removeRow(index)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleBulkSubmitManual}
            style={btnMainStyle}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Registrar Lista Completa"}
          </button>
        </>
      )}

      {/* CONTENIDO: EXCEL */}
      {bulkTab === "excel" && (
        <div style={{ marginTop: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#777",
              marginBottom: 10,
              lineHeight: 1.4,
            }}
          >
            1️⃣ Descarga la plantilla de Excel, 2️⃣ llénala en tu computadora y
            3️⃣ vuelve aquí para subirla.
            <br />
            Columnas esperadas:
            <br />
            <code>fullName | email | cedula | password </code>
          </p>

          <button
            onClick={handleDownloadTemplateExcel}
            style={{
              marginBottom: "15px",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#1cb0f6",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 3px 0 #0e86c5",
            }}
          >
            ⬇️ Descargar plantilla Excel
          </button>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelFileChange}
            style={{
              marginBottom: "20px",
              padding: "10px",
              borderRadius: "12px",
              border: "2px solid #E5E5E5",
              width: "100%",
            }}
          />

          <button
            onClick={handleBulkSubmitExcel}
            style={btnMainStyle}
            disabled={loading || !excelFile}
          >
            {loading ? "Procesando..." : "Importar desde Excel"}
          </button>
        </div>
      )}
    </div>
  </div>
)}


      </main>
    </div>
  );
};

// ========================= ESTILOS =========================
const layoutStyle: React.CSSProperties = {
  display: "flex",
  backgroundColor: "#F7F9FA",
  minHeight: "100vh",
  fontFamily: '"Nunito", sans-serif',
};
const mainContainerStyle: React.CSSProperties = {
  flex: 1,                         // ocupa todo el espacio restante
  padding: "20px 32px",            // ajusta padding a lo que te guste
  boxSizing: "border-box",
};
const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "24px",
  padding: "20px",
  border: "2px solid #E5E5E5",
  boxShadow: "0 4px 0 #E5E5E5",
};
const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 900,
  color: "#3C3C3C",
  marginBottom: "25px",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 10px",
};
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0 20px",
  fontSize: "12px",
  fontWeight: 900,
  color: "#BDBDBD",
  textTransform: "uppercase",
};
const tdStyleFirst: React.CSSProperties = {
  padding: "15px 20px",
  border: "2px solid #F0F0F0",
  borderRight: "none",
  borderRadius: "15px 0 0 15px",
  backgroundColor: "white",
};
const tdStyle: React.CSSProperties = {
  padding: "15px 20px",
  borderTop: "2px solid #F0F0F0",
  borderBottom: "2px solid #F0F0F0",
  backgroundColor: "white",
  fontWeight: 700,
  color: "#4B4B4B",
};
const tdStyleLast: React.CSSProperties = {
  padding: "15px 20px",
  border: "2px solid #F0F0F0",
  borderLeft: "none",
  borderRadius: "0 15px 15px 0",
  backgroundColor: "white",
  textAlign: "right",
};
const searchBarStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: "15px",
  border: "2px solid #E5E5E5",
  width: "300px",
  fontWeight: 700,
  outline: "none",
};
const btnSecondary: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: "15px",
  border: "2px solid #E5E5E5",
  backgroundColor: "white",
  fontWeight: 800,
  cursor: "pointer",
  color: "#4B4B4B",
};
const headerFlexStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
};
const tabContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  marginBottom: "25px",
  borderBottom: "2px solid #E5E5E5",
  paddingBottom: "10px",
};
const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 5px",
  border: "none",
  borderBottom: active ? "4px solid #1cb0f6" : "4px solid transparent",
  backgroundColor: "transparent",
  color: active ? "#1cb0f6" : "#AFAFAF",
  fontWeight: 900,
  cursor: "pointer",
});
const btnStatusStyle: React.CSSProperties = {
  border: "none",
  padding: "8px 15px",
  borderRadius: "12px",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: "11px",
};
const selectRoleStyle: React.CSSProperties = {
  padding: "8px",
  borderRadius: "12px",
  border: "2px solid #F0F0F0",
  fontWeight: 700,
  color: "#777",
  cursor: "pointer",
};
const horizontalGrid: React.CSSProperties = { display: "flex", gap: "20px" };
const modernCodeCard: React.CSSProperties = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "24px",
  border: "2px solid #E5E5E5",
  flex: 1,
  boxShadow: "0 4px 0 #E5E5E5",
};
const codeRowFlex: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "15px",
};
const smallLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 900,
  color: "#BDBDBD",
};
const digitalCode: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
  fontFamily: "monospace",
  letterSpacing: "2px",
};
const btnActionSmall: React.CSSProperties = {
  backgroundColor: "#AF85FF",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "15px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 4px 0 #9366E4",
};
const rowInputStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginBottom: "12px",
  alignItems: "center",
};
const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "12px",
  border: "2px solid #E5E5E5",
  flex: 1,
  fontWeight: 600,
  outline: "none",
};
const btnAddRowStyle: React.CSSProperties = {
  marginBottom: "20px",
  padding: "10px 20px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#E1F5FE",
  color: "#1CB0F6",
  fontWeight: 800,
  cursor: "pointer",
};
const btnMainStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  backgroundColor: "#58CC02",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 5px 0 #46A302",
  fontSize: "16px",
};
const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  color: "white",
  padding: "15px 30px",
  borderRadius: "16px",
  fontWeight: 900,
  zIndex: 3000,
};
const btnCourseAction: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  background: "#e8f5fe",
  color: "#1cb0f6",
  fontWeight: 600,
  cursor: "pointer",
};
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 4000,
};
const modalEditStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "28px",
  width: "400px",
  boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
};
const inputGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};
const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 900,
  color: "#AFAFAF",
  marginLeft: "5px",
};
const btnEditMini: React.CSSProperties = {
  background: "#F0F0F0",
  border: "none",
  borderRadius: "10px",
  padding: "8px",
  cursor: "pointer",
};
const selectorBoxStyle: React.CSSProperties = {
  border: "2px solid #F0F0F0",
  borderRadius: "12px",
  padding: "10px",
  background: "#FAFAFA",
};
const scrollListStyle: React.CSSProperties = {
  maxHeight: "150px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  marginTop: "8px",
};
const itemSelectStyle = (selected: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  backgroundColor: selected ? "#E1F5FE" : "white",
  border: selected ? "2px solid #1CB0F6" : "2px solid #EEE",
  color: selected ? "#1CB0F6" : "#4B4B4B",
  display: "flex",
  justifyContent: "space-between",
});
