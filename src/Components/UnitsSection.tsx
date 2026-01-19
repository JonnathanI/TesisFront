import React from 'react';
import { motion } from 'framer-motion';

export const UnitsSection = ({ state, actions }: any) => {
  const { subTab, setSubTab, units, courses, selectedCourseId, editingId } = state;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-card">
      {subTab === "menu" && (
        <div className="grid-menu">
          <div className="action-card" onClick={() => setSubTab("form")}>
            <span>➕</span> <h3>Nueva Unidad</h3>
          </div>
          <div className="action-card" onClick={() => setSubTab("list")}>
            <span>📚</span> <h3>Ver Unidades</h3>
          </div>
        </div>
      )}

      {subTab === "form" && (
        <div>
          <button className="back-btn" onClick={() => setSubTab("menu")}>⬅ Volver</button>
          <h2>{editingId ? "Editar Unidad" : "Nueva Unidad"}</h2>
          <label className="form-label">Curso</label>
          <select className="form-select" value={selectedCourseId} onChange={(e) => actions.setSelectedCourseId(e.target.value)}>
            <option value="">-- Seleccionar curso --</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <label className="form-label">Título de la Unidad</label>
          <input className="form-input" value={state.newUnitTitle} onChange={(e) => actions.setNewUnitTitle(e.target.value)} />
          <button className="btn-primary" onClick={actions.handleSaveUnit}>Guardar</button>
        </div>
      )}

      {subTab === "list" && (
        <div>
          <button className="back-btn" onClick={() => setSubTab("menu")}>⬅ Volver</button>
          <h2>Unidades</h2>
          {units.map((u: any) => (
            <div key={u.id} className="list-item">
              <span>{u.unitOrder}. {u.title}</span>
              <button className="btn-danger" onClick={() => actions.handleDeleteUnit(u.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};