import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Páginas principales
import Home from "./Pages/Home";
import { Login } from "./Pages/Login";
import Register from "./Pages/Register";

// Páginas de estudiantes
import StudentDashboard from "./Students/StudentDashboard";
import LevelMap from "./Students/LevelMap";
import Lesson from "./Students/Lesson";

// Páginas de profesores
import TeacherDashboard from "./Teachers/TeacherDashboard";
import StatsChart from "./Teachers/StatsChart";
import StudentTable from "./Teachers/StudentTable";
import ResetPassword from "./Pages/ResetPassword";

// Layout opcional (header/footer compartido)
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {/* Aquí podrías agregar <Header /> */}
    {children}
    {/* Aquí podrías agregar <Footer /> */}
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />

      {/* Rutas de estudiantes */}
      <Route path="/student/dashboard" element={<Layout><StudentDashboard /></Layout>} />
      <Route path="/student/level-map" element={<Layout><LevelMap skillTitle="Skill Ejemplo" /></Layout>} />
      <Route path="/student/lesson/:lessonId" element={<Layout><Lesson /></Layout>} />

      {/* Rutas de profesores */}
      <Route path="/teacher/dashboard" element={<Layout><TeacherDashboard /></Layout>} />
      <Route path="/teacher/stats" element={<Layout><StatsChart /></Layout>} />
      <Route path="/teacher/students" element={<Layout><StudentTable /></Layout>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Redirige cualquier ruta desconocida al Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
