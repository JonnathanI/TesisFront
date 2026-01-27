import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Páginas principales
import Home from "./Pages/Home";
import { Login } from "./Pages/Login";
import Register from "./Pages/Register";
import ResetPassword from "./Pages/ResetPassword";

// Páginas de estudiantes
import StudentDashboard from "./Students/StudentDashboard";
import LevelMap from "./Students/LevelMap";
import Lesson from "./Students/Lesson";
// --- NUEVA IMPORTACIÓN: Perfil de Amigo ---
import { FriendProfile } from "./Students/components/FriendProfile"; 

// Páginas de profesores
import TeacherDashboard from "./Teachers/TeacherDashboard";
import StatsChart from "./Teachers/StatsChart";
import StudentTable from "./Teachers/StudentTable";

// --- Panel de Administrador ---
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminPage } from "./admin/AdminPage";
import { AdminLayout } from "./admin/AdminLayout";

// Layout opcional (header/footer compartido)
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {children}
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas de estudiantes */}
      <Route path="/student/dashboard" element={<Layout><StudentDashboard /></Layout>} />
      <Route path="/student/level-map" element={<Layout><LevelMap skillTitle="Skill Ejemplo" /></Layout>} />
      <Route path="/student/lesson/:lessonId" element={<Layout><Lesson /></Layout>} />
      
      {/* --- NUEVA RUTA: Perfil de Amigo --- */}
      {/* Esta ruta permite ver las medallas y XP de otros alumnos */}
      <Route path="/friend-profile/:friendId" element={<Layout><FriendProfile /></Layout>} />

      {/* Rutas de profesores */}
      <Route path="/teacher/dashboard" element={<Layout><TeacherDashboard /></Layout>} />
      <Route path="/teacher/stats" element={<Layout><StatsChart /></Layout>} />
      <Route path="/teacher/students" element={<Layout><StudentTable /></Layout>} />

    
      <Route path="/admin/dashboard" element={<AdminLayout />} />

      {/* Redirige cualquier ruta desconocida al Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}