import React from "react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<Props> = ({ onConfirm, onCancel }) => {
  return (
    <div>
      <p>¿Seguro que deseas cerrar sesión?</p>
      <button onClick={onConfirm}>Sí</button>
      <button onClick={onCancel}>No</button>
    </div>
  );
};

export default LogoutModal;
