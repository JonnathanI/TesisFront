import React, { useEffect, useState } from 'react';
import { getPendingRequests, acceptFriendRequest, StudentData } from '../../api/auth.service';

export const FriendRequests = () => {
  const [requests, setRequests] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // 🔑 Tipamos como any para evitar errores de TS
      const data: any = await getPendingRequests();

      // 🛡 Blindado contra cualquier respuesta del backend
      setRequests(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.requests)
          ? data.requests
          : []
      );

    } catch (error) {
      console.error('Error al cargar solicitudes', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (senderId: string) => {
    try {
      await acceptFriendRequest(senderId);

      // Quitamos la solicitud aceptada de la lista
      setRequests(prev => prev.filter(req => req.id !== senderId));

      alert('¡Ahora son amigos!');
    } catch (error) {
      console.error(error);
      alert('No se pudo aceptar la solicitud');
    }
  };

  if (loading) {
    return <div>Cargando solicitudes...</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '15px', border: '2px solid #e5e5e5' }}>
      <h3 style={{ marginTop: 0, color: '#4b4b4b' }}>Solicitudes de amistad</h3>

      {requests.length === 0 ? (
        <p style={{ color: '#777' }}>No tienes solicitudes pendientes.</p>
      ) : (
        requests.map(user => (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '30px' }}>👤</div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{user.fullName}</div>
                <div style={{ fontSize: '12px', color: '#777' }}>
                  {user.xpTotal ?? 0} XP
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAccept(user.id)}
              style={{
                backgroundColor: '#58cc02',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 0 #46a302',
              }}
            >
              ACEPTAR
            </button>
          </div>
        ))
      )}
    </div>
  );
};
