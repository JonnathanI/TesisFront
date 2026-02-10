import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Páginas principales
import Home from "./Pages/Home";
import { Login } from "./Pages/Login";
import Register from "./Pages/Register";
import ResetPassword from "./Pages/ResetPassword";

// Sección de insignias (para ruta independiente)
import { BadgesSection } from "./Students/sections/BadgesSection";

// Páginas de estudiantes
import StudentDashboard from "./Students/StudentDashboard";
import LevelMap from "./Students/LevelMap";
import Lesson from "./Students/Lesson";
// Perfil de Amigo
import { FriendProfile } from "./Students/components/FriendProfile";

// Páginas de profesores
import TeacherDashboard from "./Teachers/TeacherDashboard";
import StatsChart from "./Teachers/StatsChart";
import StudentTable from "./Teachers/StudentTable";

// Panel de Administrador
import { AdminLayout } from "./admin/AdminLayout";
import { EvaluationPlayer } from "./Students/EvaluationPlayer";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout>
            <Register />
          </Layout>
        }
      />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas de estudiantes */}
      <Route
        path="/student/dashboard"
        element={
          <Layout>
            <StudentDashboard />
          </Layout>
        }
      />
      <Route
        path="/student/level-map"
        element={
          <Layout>
            <LevelMap skillTitle="Skill Ejemplo" />
          </Layout>
        }
      />
      <Route
        path="/student/lesson/:lessonId"
        element={
          <Layout>
            <Lesson />
          </Layout>
        }
      />

      {/* Ruta independiente para Insignias */}
       <Route
        path="/student/badges"
        element={
          <Layout>
            <BadgesSection />   {/* 👈 YA SIN userId */}
          </Layout>
        }
      />

      {/* Perfil de Amigo */}
      <Route
        path="/friend-profile/:friendId"
        element={
          <Layout>
            <FriendProfile />
          </Layout>
        }
      />

      {/* Rutas de profesores */}
      <Route
        path="/teacher/dashboard"
        element={
          <Layout>
            <TeacherDashboard />
          </Layout>
        }
      />
      <Route
        path="/teacher/stats"
        element={
          <Layout>
            <StatsChart />
          </Layout>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <Layout>
            <StudentTable />
          </Layout>
        }
      />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminLayout />} />
      <Route path="/evaluation/:id" element={<EvaluationPlayer />} />

      {/* Ruta comodín SIEMPRE al final */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
