import React, { useState, useEffect } from "react";
import * as AuthService from "../../api/auth.service";
import { AssignmentData } from "../../api/auth.types";

export const GroupsSection: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 👉 cursos y curso seleccionado
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // 🔧 formulario de creación de grupo
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  // 🔧 tareas del grupo
  const [tasks, setTasks] = useState<AssignmentData[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskXp, setTaskXp] = useState<number>(50); // XP por defecto
  const [taskLoading, setTaskLoading] = useState(false);

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
      await AuthService.createClassroom(newGroupName.trim(), selectedCourseId);
      setNewGroupName("");
      setSelectedCourseId("");
      await loadGroups();
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el grupo");
    } finally {
      setCreating(false);
    }
  };

  // ==========================
  // CARGA DETALLE DE GRUPO + TAREAS
  // ==========================
  const openGroup = async (id: string) => {
    try {
      const [groupDetails, assignments] = await Promise.all([
        AuthService.getClassroomDetails(id),
        AuthService.getClassroomAssignments(id),
      ]);

      setSelectedGroup(groupDetails);
      setTasks(Array.isArray(assignments) ? assignments : []);
    } catch (err) {
      console.error("Error cargando detalle de grupo o tareas", err);
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

      // recargar detalle del grupo
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
  // CREAR TAREA PARA EL GRUPO
  // ==========================
  const handleCreateTask = async () => {
    if (!selectedGroup?.id) return;
    if (!taskTitle.trim()) {
      alert("Ponle un título a la tarea");
      return;
    }

    setTaskLoading(true);
    try {
      // 🔹 mandamos también el XP porque el backend espera "xp"
      await AuthService.createAssignment(selectedGroup.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        xp: Number(taskXp) || 0,
        dueDate: taskDueDate || null, // "2025-02-20" -> LocalDate.parse OK
      });

      // recargamos solo las tareas
      const assignments = await AuthService.getClassroomAssignments(
        selectedGroup.id
      );
      setTasks(Array.isArray(assignments) ? assignments : []);

      // limpiar formulario
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskXp(50);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la tarea");
    } finally {
      setTaskLoading(false);
    }
  };

  // ==========================
  // PANTALLA DETALLE DE UN GRUPO
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

        {/* FORMULARIO DE TAREAS */}
        <div className="mt-6 bg-white p-5 rounded-xl border">
          <h3 className="font-black text-lg text-gray-700 mb-3">
            Asignar tarea al grupo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              className="border p-3 rounded-xl md:col-span-2"
              placeholder="Título de la tarea"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Fecha límite (opcional)"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />

            <input
              className="border p-3 rounded-xl"
              type="number"
              min={0}
              placeholder="XP"
              value={taskXp}
              onChange={(e) => setTaskXp(Number(e.target.value) || 0)}
            />
          </div>

          <button
            onClick={handleCreateTask}
            disabled={taskLoading}
            className="bg-[#1cb0f6] text-white rounded-xl font-black px-4 py-3 w-full md:w-auto"
          >
            {taskLoading ? "Guardando..." : "Crear tarea"}
          </button>

          <textarea
            className="w-full border p-3 rounded-xl mt-3"
            rows={3}
            placeholder="Descripción / instrucciones (opcional)"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
        </div>

        {/* LISTA DE TAREAS */}
        <h3 className="mt-6 font-black text-gray-500 uppercase text-xs">
          Tareas del grupo
        </h3>

        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">
            Aún no has asignado tareas a este grupo.
          </p>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id || t.title}
              className="bg-gray-100 p-4 rounded-xl border mt-2"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-black">{t.title}</span>
                <div className="flex flex-col items-end text-xs text-gray-600">
                  {t.dueDate && (
                    <span>
                      vence:{" "}
                      {new Date(t.dueDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {typeof (t as any).xpReward === "number" && (
                    <span className="text-[#58cc02] font-bold">
                      {`+${(t as any).xpReward} XP`}
                    </span>
                  )}
                </div>
              </div>
              {t.description && (
                <p className="text-sm text-gray-700">{t.description}</p>
              )}
            </div>
          ))
        )}

        {/* LISTA DE ALUMNOS */}
        <h3 className="mt-8 font-black text-gray-500 uppercase text-xs">
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
