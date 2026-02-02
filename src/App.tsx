import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      {/* CONTENEDOR GLOBAL */}
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
