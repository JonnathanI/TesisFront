import React, { useState, useEffect } from "react";
import * as AuthService from "../../api/auth.service";

export const GroupsSection: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 👉 Nuevo: cursos y curso seleccionado
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // 🔧 formulario de creación
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  // ==========================
  // CARGAR GRUPOS Y CURSOS
  // ==========================
  const loadGroups = async () => {
    try {
      const data = await AuthService.getTeacherClassrooms();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando grupos", err);
      setGroups([]);
    }
  };

  const loadCourses = async () => {
    try {
      // Puedes usar getTeacherCourses() si tienes cursos por profesor
      const data = await AuthService.getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando cursos", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    loadGroups();
    loadCourses();
  }, []);

  // ==========================
  // CREAR GRUPO
  // ==========================
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Escribe un nombre para el grupo");
      return;
    }
    if (!selectedCourseId) {
      alert("Selecciona un curso para el grupo");
      return;
    }

    setCreating(true);

    try {
      // 👈 Ahora enviamos nombre + courseId
      await AuthService.createClassroom(newGroupName.trim(), selectedCourseId);
      setNewGroupName("");
      setSelectedCourseId("");
      await loadGroups(); // recargar lista
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el grupo");
    } finally {
      setCreating(false);
    }
  };

  // ==========================
  // CARGA DETALLE DE GRUPO
  // ==========================
  const openGroup = async (id: string) => {
    try {
      const data = await AuthService.getClassroomDetails(id);
      setSelectedGroup(data);
    } catch (err) {
      console.error("Error cargando detalle de grupo", err);
    }
  };

  // ==========================
  // AGREGAR ALUMNO
  // ==========================
  const handleSelectUser = (user: any) => {
    setEmailToAdd(user.email);
    setSuggestions([]);
  };

  const handleAddStudent = async () => {
    if (!emailToAdd || !selectedGroup?.id) return;

    setLoading(true);
    try {
      await AuthService.addStudentToClassroom(selectedGroup.id, emailToAdd);
      const updated = await AuthService.getClassroomDetails(selectedGroup.id);
      setSelectedGroup(updated);
      setEmailToAdd("");
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar el estudiante");
    }
    setLoading(false);
  };

  // ==========================
  // AUTOCOMPLETADO
  // ==========================
  useEffect(() => {
    const run = async () => {
      if (emailToAdd.length < 3 || emailToAdd.includes("@")) {
        setSuggestions([]);
        return;
      }
      try {
        const r = await AuthService.searchUsersByQuery(emailToAdd);
        setSuggestions(Array.isArray(r) ? r : []);
      } catch {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(run, 300);
    return () => clearTimeout(timer);
  }, [emailToAdd]);

  // ==========================
  // PANTALLA DETALLE
  // ==========================
  if (selectedGroup) {
    return (
      <div className="p-4">
        <button
          onClick={() => setSelectedGroup(null)}
          className="text-[#1cb0f6] mb-4 font-bold"
        >
          ← Volver a grupos
        </button>

        <h2 className="text-2xl font-black">{selectedGroup.name}</h2>

        {/* AGREGAR ALUMNO */}
        <div className="mt-6 bg-white p-5 rounded-xl border">
          <label className="font-bold text-sm text-gray-600">
            Inscribir Estudiante
          </label>
          <div className="flex gap-2 mt-2">
            <div className="relative flex-1">
              <input
                value={emailToAdd}
                onChange={(e) => setEmailToAdd(e.target.value)}
                className="w-full border p-3 rounded-xl"
                placeholder="Escribe nombre o correo..."
              />

              {suggestions.length > 0 && (
                <div className="absolute w-full bg-white border rounded-xl shadow z-20 mt-1 max-h-60 overflow-y-auto">
                  {suggestions.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectUser(u)}
                    >
                      <p className="font-bold">{u.fullName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleAddStudent}
              disabled={loading}
              className="bg-[#58cc02] text-white px-6 rounded-xl font-bold"
            >
              {loading ? "..." : "Agregar"}
            </button>
          </div>
        </div>

        {/* LISTA DE ALUMNOS */}
        <h3 className="mt-6 font-black text-gray-500 uppercase text-xs">
          Estudiantes del grupo
        </h3>

        {selectedGroup.students?.map((s: any) => (
          <div
            key={s.id}
            className="flex justify-between items-center bg-gray-100 p-4 rounded-xl border mt-2"
          >
            <span className="font-bold">{s.fullName}</span>
            <span className="text-[#58cc02] font-black">{s.xpTotal} XP</span>
          </div>
        ))}
      </div>
    );
  }

  // ==========================
  // LISTA DE GRUPOS + FORMULARIO
  // ==========================
  return (
    <div className="p-4">
      {/* FORMULARIO DE CREACIÓN */}
      <div className="bg-white p-6 border rounded-2xl mb-6">
        <h3 className="font-black text-lg text-gray-700 mb-3">
          Crear nuevo grupo
        </h3>

        {/* Selección de curso */}
        <div className="mb-3">
          <label className="block text-xs font-black text-gray-500 mb-1 uppercase">
            Curso
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Selecciona un curso</option>
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nombre del grupo"
            className="flex-1 border p-3 rounded-xl"
          />
          <button
            onClick={handleCreateGroup}
            className="bg-[#1cb0f6] text-white px-6 rounded-xl font-black"
          >
            {creating ? "..." : "Crear"}
          </button>
        </div>
      </div>

      {/* LISTA DE GRUPOS */}
      {groups.length === 0 ? (
        <p className="text-center text-gray-500">
          No tienes grupos creados todavía.
          <br />
          🔹 Crea uno arriba.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => openGroup(g.id)}
              className="bg-white p-6 border rounded-2xl cursor-pointer hover:border-[#1cb0f6]"
            >
              <div className="text-4xl mb-2">🏫</div>
              <h3 className="font-black text-xl">{g.name}</h3>
              <p className="text-sm text-gray-500">Código: {g.code}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
