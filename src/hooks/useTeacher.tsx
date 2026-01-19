import { useState } from 'react';

export const useTeacher = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [subTab, setSubTab] = useState("menu");
  const [showLogoutModal, setShowLogoutModal] = useState(false); // <--- AGREGADO
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados de datos
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  
  // Estados de formularios
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [newUnitTitle, setNewUnitTitle] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setNewCourseTitle("");
    setNewUnitTitle("");
  };

  const confirmLogout = () => {
    console.log("Cerrando sesión...");
    localStorage.clear(); // O tu lógica de logout
    window.location.href = "/login";
  };

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSubTab("menu");
    resetForm();
  };

  return {
    activeTab, setActiveTab: changeTab,
    subTab, setSubTab,
    showLogoutModal, setShowLogoutModal, // <--- EXPORTADO
    confirmLogout, // <--- EXPORTADO
    courses, setCourses,
    units, setUnits,
    lessons, setLessons,
    classrooms, setClassrooms,
    editingId, setEditingId,
    newCourseTitle, setNewCourseTitle,
    selectedCourseId, setSelectedCourseId,
    newUnitTitle, setNewUnitTitle,
    resetForm
  };
};